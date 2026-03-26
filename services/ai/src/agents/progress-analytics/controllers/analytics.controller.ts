import { Request, Response } from "express";
import { logger } from "../../../lib/logger";
import { ApiResponse, ChildProfile, Story, ProgressReport } from "@shared/src/types";
import { PrismaClient } from "@prisma/client";
import { analyticsValidationService } from "../services/analytics-validation.service";
import { analyticsDataAggregator } from "../services/analytics-data-aggregator";
import { generateProgressReport } from "../services/analytics-llm.service";

export class AnalyticsController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Generate AI analytics and embeddings for a child's reading progress
   *
   * Accepts:
   * - childProfile: ChildProfile with all progress data
   * - storiesData: Story[] that the child has read
   *
   * Workflow:
   * 1. Validate input data (childProfile, storiesData, periods)
   * 2. Check for duplicate reports
   * 3. Aggregate metrics from raw data
   * 4. Fetch historical reports for context
   * 5. Generate report using LLM
   * 6. Save report to database
   * 7. Return response
   */
  async generateAnalytics(
    req: Request,
    res: Response<ApiResponse<any>>,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const { childProfile, storiesData } = req.body;

      // ===================================================================
      // STEP 1: Basic Request Validation
      // ===================================================================
      if (!childProfile) {
        logger.warn("[Analytics] Missing childProfile in request body");
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELD",
            message: "childProfile is required in request body",
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      if (!Array.isArray(storiesData)) {
        logger.warn(
          "[Analytics] Missing or invalid storiesData in request body",
        );
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FIELD",
            message: "storiesData array is required in request body",
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      const child: ChildProfile = childProfile;
      const stories: Story[] = storiesData;

      logger.info("[Analytics] Received analytics generation request", {
        childProfileId: child.id,
        childName: child.name,
        progressCount: child.progress?.length || 0,
        storiesCount: stories.length,
        totalStars: child.totalStars,
        currentLevel: child.currentLevel,
      });

      // ===================================================================
      // STEP 2: Period Definition and Duplicate Check
      // ===================================================================
      const periodEnd = new Date();
      const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      logger.debug("[Analytics] Defined reporting period", {
        childProfileId: child.id,
        periodStart,
        periodEnd,
        durationDays: 7,
      });

      // Check if analytics record already exists for this period
      const existingRecord = await this.prisma.aIProgressInsight.findFirst({
        where: {
          childId: child.id,
          periodStart: {
            gte: new Date(periodStart.getTime() - 60 * 60 * 1000), // 1 hour tolerance
          },
          periodEnd: {
            lte: new Date(periodEnd.getTime() + 60 * 60 * 1000), // 1 hour tolerance
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingRecord) {
        logger.info(
          "[Analytics] ⏭️  Duplicate prevention: Report already exists for this period",
          {
            childProfileId: child.id,
            childName: child.name,
            existingRecordId: existingRecord.id,
            createdAt: existingRecord.createdAt,
          },
        );

        res.status(200).json({
          success: true,
          data: {
            message: "Report already generated for this period",
            existingReportId: existingRecord.id,
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      logger.info(
        "[Analytics] No existing record found, proceeding with report generation",
        {
          childProfileId: child.id,
        },
      );

      // ===================================================================
      // STEP 3: Comprehensive Input Validation
      // ===================================================================
      logger.debug("[Analytics] Starting comprehensive input validation", {
        childProfileId: child.id,
      });

      try {
        analyticsValidationService.validateAnalyticsInput(child, stories);
        analyticsValidationService.validatePeriod(periodStart, periodEnd);
        analyticsValidationService.logValidationSummary(
          child.id,
          child.progress?.length || 0,
          stories.length,
        );
      } catch (validationError) {
        logger.warn("[Analytics] Input validation failed", {
          childProfileId: child.id,
          error: String(validationError),
        });

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              validationError instanceof Error
                ? validationError.message
                : "Input validation failed",
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      // ===================================================================
      // STEP 4: Data Aggregation + Enrichment
      // ===================================================================
      logger.info("[Analytics] Starting metrics aggregation", {
        childProfileId: child.id,
        childName: child.name,
      });

      let metrics;
      let enrichedContext;
      try {
        metrics = await analyticsDataAggregator.aggregateMetrics(
          child,
          stories,
          periodStart,
          periodEnd,
        );

        // Build enriched context with chapter and challenge details
        enrichedContext = await analyticsDataAggregator.buildEnrichedReadingContext(
          child,
          stories,
          periodStart,
          periodEnd,
        );

        logger.info("[Analytics] Metrics aggregation and enrichment completed", {
          childProfileId: child.id,
          metricsKeys: Object.keys(metrics),
          enrichedStoriesCount: enrichedContext.stories.length,
        });
      } catch (aggregationError) {
        logger.error("[Analytics] Metrics aggregation or enrichment failed", {
          childProfileId: child.id,
          error: String(aggregationError),
        });

        res.status(500).json({
          success: false,
          error: {
            code: "AGGREGATION_ERROR",
            message: "Failed to aggregate metrics",
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      // ===================================================================
      // STEP 5: Fetch Historical Context
      // ===================================================================
      logger.info("[Analytics] Fetching historical reports for context", {
        childProfileId: child.id,
      });

      let historicalContext = "";
      try {
        const historicalReports = await analyticsDataAggregator.fetchHistoricalReports(
          child.id,
          4, // Last 4 weeks
        );

        historicalContext = analyticsDataAggregator.extractHistoricalContext(
          historicalReports,
        );

        logger.info("[Analytics] Historical context extracted", {
          childProfileId: child.id,
          reportsFound: historicalReports.length,
          contextLength: historicalContext.length,
        });
      } catch (historyError) {
        logger.warn("[Analytics] Failed to fetch historical reports", {
          childProfileId: child.id,
          error: String(historyError),
        });

        // Don't fail the entire request if historical context unavailable
        historicalContext =
          "No previous reports available for this child. This is the first week.";
      }

      // ===================================================================
      // STEP 6: Generate Report Using LLM
      // ===================================================================
      logger.info("[Analytics] Starting LLM report generation", {
        childProfileId: child.id,
        childName: child.name,
        withHistoricalContext: historicalContext.length > 100,
        withEnrichedContext: !!enrichedContext,
      });

      let progressReport: ProgressReport;
      try {
        progressReport = await generateProgressReport(
          child.name,
          child.id,
          metrics,
          historicalContext,
          periodStart,
          periodEnd,
          enrichedContext,
        );

        logger.info("[Analytics] LLM report generation completed", {
          childProfileId: child.id,
          reportEngagementStatus: progressReport.summary.engagementStatus,
          reportProgressTrend: progressReport.summary.progressTrend,
        });
      } catch (llmError) {
        logger.error("[Analytics] LLM report generation failed", {
          childProfileId: child.id,
          error: String(llmError),
        });

        res.status(500).json({
          success: false,
          error: {
            code: "LLM_ERROR",
            message: "Failed to generate report from LLM",
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      // ===================================================================
      // STEP 7: Save Report to Database
      // ===================================================================
      logger.info("[Analytics] Saving report to database", {
        childProfileId: child.id,
      });

      let savedRecord;
      try {
        savedRecord = await this.prisma.aIProgressInsight.create({
          data: {
            childId: child.id,
            periodStart,
            periodEnd,
            reportData: progressReport as Record<string, any>,
          },
        });

        logger.info("[Analytics] Report successfully saved to database", {
          childProfileId: child.id,
          recordId: savedRecord.id,
          createdAt: savedRecord.createdAt,
          periodStart: savedRecord.periodStart,
          periodEnd: savedRecord.periodEnd,
        });
      } catch (dbError) {
        logger.error("[Analytics] Failed to save report to database", {
          childProfileId: child.id,
          error: String(dbError),
        });

        res.status(500).json({
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to save report to database",
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      // ===================================================================
      // STEP 8: Return Success Response
      // ===================================================================
      const elapsedMs = Date.now() - startTime;

      logger.info("[Analytics] Report generation workflow completed", {
        childProfileId: child.id,
        childName: child.name,
        recordId: savedRecord.id,
        elapsedMs,
        engagementStatus: progressReport.summary.engagementStatus,
        progressTrend: progressReport.summary.progressTrend,
      });

      res.status(200).json({
        success: true,
        data: {
          reportId: savedRecord.id,
          childId: child.id,
          childName: child.name,
          periodStart,
          periodEnd,
          report: progressReport,
          generatedAt: savedRecord.createdAt,
        },
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      const elapsedMs = Date.now() - startTime;

      logger.error("[Analytics] Unexpected error in generateAnalytics", {
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
        elapsedMs,
      });

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate analytics",
        },
        timestamp: new Date(),
      } as ApiResponse<any>);
    }
  }

  /**
   * Cleanup method: Disconnect Prisma client
   */
  async cleanup(): Promise<void> {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      logger.error("[Analytics] Error disconnecting Prisma client", {
        error: String(error),
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
