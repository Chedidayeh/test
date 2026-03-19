import { Request, Response } from "express";
import { logger } from "../../../lib/logger";
import { AIProgressInsight, ApiResponse, ChildProfile, Story, InsightsReport, AggregatedMetrics } from "@shared/src/types";
import { metricsAggregationService } from "../services/metrics-aggregation.service";
import { llmContextBuilderService } from "../services/llm-context-builder.service";
import { insightsGenerationService } from "../services/insights-generation.service";
import { insightsPersistenceService } from "../services/insights-persistence.service";
import { PrismaClient } from "@prisma/client";

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
   * Current implementation: Extracts and validates the passed data
   * Next steps: Process data through LangChain for summarization and insight generation
   */
  async generateAnalytics(
    req: Request,
    res: Response<ApiResponse<any>>,
  ): Promise<void> {
    try {
      const { childProfile, storiesData } = req.body;

      // Validate required fields
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

      // Extract data from request
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
      // CHECK: Duplicate Record Prevention
      // ===================================================================
      // Calculate the period metadata (same as insights generation)
      const periodEnd = new Date();
      const periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      logger.debug("[Analytics] Checking for existing analytics record", {
        childProfileId: child.id,
        periodStart,
        periodEnd,
      });

      // Check if analytics record exists for this child and period
      const existingRecord = await this.prisma.aIProgressInsight.findFirst({
        where: {
          childId: child.id,
          periodStart: {
            gte: new Date(periodStart.getTime() - 60 * 60 * 1000), // Allow 1 hour tolerance for period matching
          },
          periodEnd: {
            lte: new Date(periodEnd.getTime() + 60 * 60 * 1000), // Allow 1 hour tolerance for period matching
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingRecord) {
        logger.info("[Analytics] ⏭️  Analytics record already exists for this period", {
          childProfileId: child.id,
          childName: child.name,
          existingRecordId: existingRecord.id,
          existingRecordCreatedAt: existingRecord.createdAt,
          periodStart: existingRecord.periodStart,
          periodEnd: existingRecord.periodEnd,
        });

        res.status(200).json({
          success: true,
          data: {
            childProfileId: child.id,
            childName: child.name,
            message: "Analytics record already exists for this period",
            skipped: true,
            existingRecordId: existingRecord.id,
            readingLevel: existingRecord.readingLevel,
            engagementScore: existingRecord.engagementScore,
            periodStart: existingRecord.periodStart,
            periodEnd: existingRecord.periodEnd,
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
        return;
      }

      logger.info("[Analytics] No existing record found, proceeding with analytics generation", {
        childProfileId: child.id,
      });

      // Fetch past records for this child to provide context to the LLM
      const pastRecords = await this.prisma.aIProgressInsight.findMany({
        where: {
          childId: child.id,
        },
        orderBy: { createdAt: "desc" },
        take: 10, // Get last 10 records for historical context
      });

      logger.debug("[Analytics] Retrieved past analytics records for context", {
        childProfileId: child.id,
        pastRecordsCount: pastRecords.length,
        pastRecordsPeriods: pastRecords.map((r) => ({
          periodStart: r.periodStart,
          periodEnd: r.periodEnd,
          readingLevel: r.readingLevel,
          engagementScore: r.engagementScore,
        })),
      });

      if (child.progress && child.progress.length > 0) {
        logger.debug("[Analytics] Child progress details", {
          childProfileId: child.id,
          progressRecords: child.progress.map((p) => ({
            storyId: p.storyId,
            status: p.status,
            totalTimeSpent: p.totalTimeSpent,
            completedAt: p.completedAt,
            gameSessionCount: p.gameSession ? 1 : 0,
          })),
        });
      }

      // Log stories details for processing
      if (stories.length > 0) {
        logger.debug("[Analytics] Stories data for processing", {
          childProfileId: child.id,
          stories: stories.slice(0, 3).map((s) => ({
            id: s.id,
            title: s.title,
            difficulty: s.difficulty,
            chaptersCount: s.chapters?.length || 0,
          })),
          totalStoriesCount: stories.length,
        });
      }

      // ===================================================================
      // STEP 1: Data Validation and Extraction (Completed)
      // ===================================================================
      // ✅ Extracted childProfile and storiesData from request
      // ✅ Validated required fields
      // ✅ Logged all details for monitoring

      // ===================================================================
      // STEP 2: Aggregate Metrics
      // ===================================================================
      logger.info("[Analytics] Starting metrics aggregation...", {
        childProfileId: child.id,
      });

      const metrics = await metricsAggregationService.aggregateChildMetrics(
        child,
        stories,
      );

      logger.info("[Analytics] ✅ Metrics aggregation completed", {
        childProfileId: child.id,
        successRate: metrics.successRate,
        totalStoriesCompleted: metrics.totalStoriesCompleted,
        totalChallengesAttempted: metrics.totalChallengesAttempted,
      });

      // ===================================================================
      // STEP 3: Build LLM Context (with Historical Data)
      // ===================================================================
      logger.info("[Analytics] Building LLM context with historical data...", {
        childProfileId: child.id,
        pastRecordsCount: pastRecords.length,
      });

      const context = await llmContextBuilderService.buildLearningContext(
        child,
        stories,
        metrics,
        pastRecords,
      );

      logger.info("[Analytics] ✅ LLM context built successfully", {
        childProfileId: child.id,
        narrativeLength: context.consolidatedNarrative.length,
        challengePatternsCount: context.challengePattern.strongTypes.length,
        historicalDataIncluded: pastRecords.length > 0,
        pastRecordsProvided: pastRecords.length,
      });

      // ===================================================================
      // STEP 4: Generate AI Insights (LangChain)
      // ===================================================================
      logger.info("[Analytics] Generating AI insights (LangChain)...", {
        childProfileId: child.id,
      });

      const insights = await insightsGenerationService.generateInsights(
        context,
        metrics,
      );

      logger.info("[Analytics] ✅ AI insights generated successfully", {
        childProfileId: child.id,
        readingLevel: insights.readingLevel,
        engagementScore: insights.engagementScore,
        strengthsCount: insights.strengths.length,
        weaknessesCount: insights.weaknesses.length,
      });

      // ===================================================================
      // STEP 5: Save Insights to Database for Future Reference
      // ===================================================================
      logger.info("[Analytics] Saving insights to database for reference...", {
        childProfileId: child.id,
      });

      let savedInsightRecord: any = null;
      try {
        savedInsightRecord = await insightsPersistenceService.saveInsights(
          child,
          insights,
          metrics,
        );

        logger.info("[Analytics] ✅ Insights saved to database successfully", {
          childProfileId: child.id,
          recordId: savedInsightRecord.id,
        });
      } catch (persistenceError) {
        logger.error("[Analytics] Error saving insights to database", {
          childProfileId: child.id,
          error: String(persistenceError),
        });
        // Continue - database save is nice-to-have for this request
      }

      // ===================================================================
      // STEP 6: Return Formatted Response
      // ===================================================================
      logger.info(
        "[Analytics] ✅ All processing steps completed successfully",
        {
          childProfileId: child.id,
          duration: "varies",
        },
      );

      res.status(200).json({
        success: true,
        data: {
          childProfileId: child.id,
          childName: child.name,
          insights: {
            strengths: insights.strengths,
            weaknesses: insights.weaknesses,
            recommendations: insights.recommendations,
            tips: insights.tips,
          },
          readingLevel: insights.readingLevel,
          engagementScore: insights.engagementScore,
          metrics: {
            totalStoriesCompleted: metrics.totalStoriesCompleted,
            totalChallengesAttempted: metrics.totalChallengesAttempted,
            totalChallengesSolved: metrics.totalChallengesSolved,
            successRate: metrics.successRate,
            averageAttemptsPerChallenge: metrics.averageAttemptsPerChallenge,
            hintDependencyRate: metrics.hintDependencyRate,
            starAchievementRate: metrics.starAchievementRate,
          },
          periodStart: insights.periodStart,
          periodEnd: insights.periodEnd,
          databaseRecordId: savedInsightRecord?.id || null,
        },
        timestamp: new Date(),
      } as ApiResponse<any>);
    } catch (error) {
      logger.error("[Analytics] Error in generateAnalytics controller", {
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
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
   * Get all analytics reports for a specific child
   * Returns paginated list of all AIProgressInsight records sorted by date (newest first)
   *
   * Query parameters:
   * - page: number (default 1)
   * - pageSize: number (default 10, max 50)
   */
  async getChildAnalytics(
    req: Request,
    res: Response<ApiResponse<AIProgressInsight[]>>,
  ): Promise<void> {
    try {
      const { childId } = req.params;

      // Validate childId
      if (!childId || childId.trim().length === 0) {
        logger.warn("[Analytics] Missing or invalid childId in request");
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_CHILD_ID",
            message: "childId is required and must be non-empty",
          },
          timestamp: new Date(),
        } as ApiResponse<AIProgressInsight[]>);
        return;
      }

      logger.info("[Analytics] Fetching analytics reports for child", {
        childId,
      });

      // Get total count
      const totalRecords = await this.prisma.aIProgressInsight.count({
        where: { childId },
      });

      // Get paginated records
      const records = await this.prisma.aIProgressInsight.findMany({
        where: { childId },
        orderBy: { periodEnd: "desc" }, // Newest first
      });

      // Transform records to properly type JSON fields from Prisma
      const typedRecords: AIProgressInsight[] = records.map((record) => ({
        ...record,
        insights: record.insights as unknown as InsightsReport,
        metrics: record.metrics as unknown as AggregatedMetrics,
      }));

      logger.info("[Analytics] ✅ Successfully retrieved child analytics", {
        childId,
        recordsCount: typedRecords.length,
        totalRecords,
      });

      res.status(200).json({
        success: true,
        data: typedRecords,
        timestamp: new Date(),
      } as ApiResponse<AIProgressInsight[]>);
    } catch (error) {
      logger.error("[Analytics] Error fetching child analytics", {
        childId: req.params.childId,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to retrieve analytics",
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
