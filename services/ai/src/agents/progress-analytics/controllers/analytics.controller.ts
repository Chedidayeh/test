import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";
import {
  ApiResponse,
  ChildProfile,
  Story,
  WeeklyAnalyticsReport,
} from "@shared/src/types";
import { generateWeeklyReport } from "../services/analytics.service";
import { GenerateReportResponse } from "../services/types";

const prisma = new PrismaClient();

export class AnalyticsController {
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
        });
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
        });
        return;
      }

      // ===================================================================
      // STEP 2: Calculate report week based on existing reports for this child
      // ===================================================================
      const reportWeek = await this.getCurrentISOWeek(childProfile.id);

      if (!Number.isInteger(reportWeek) || reportWeek < 1) {
        logger.warn("[Analytics] Invalid week number", { week: reportWeek });
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FIELD",
            message: "week must be a positive integer",
          },
          timestamp: new Date(),
        });
        return;
      }

      const child: ChildProfile = childProfile;
      const stories: Story[] = storiesData;

      logger.info(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Starting analytics generation",
          childProfileId: child.id,
          childName: child.name,
          storiesCount: stories.length,
          week: reportWeek,
        }),
      );

      // ===================================================================
      // STEP 3: Call analytics service
      // ===================================================================
      const report: GenerateReportResponse = await generateWeeklyReport(
        child.id,
        child,
        stories,
        reportWeek,
      );

      // ===================================================================
      // STEP 4: Handle service response
      // ===================================================================
      if (!report.success) {
        logger.error(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "error",
            service: "ai-service",
            agent: "progress-analytics",
            message: "Analytics generation failed",
            childProfileId: child.id,
            error: report.error,
          }),
        );

        res.status(500).json({
          success: false,
          error: {
            code: "ANALYTICS_GENERATION_ERROR",
            message: report.error || "Failed to generate analytics report",
          },
          timestamp: new Date(),
        });
        return;
      }

      // ===================================================================
      // STEP 5: Return success response
      // ===================================================================
      const elapsedMs = Date.now() - startTime;

      logger.info(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Analytics generation successful",
          reportId: report.reportId,
          childProfileId: child.id,
          week: reportWeek,
          elapsedMs,
        }),
      );

      res.status(201).json({
        success: true,
        data: {
          reportId: report.reportId,
          childProfileId: report.childProfileId,
          week: report.week,
          executiveSummary: report.executiveSummary,
          progressTrends: report.progressTrends,
          recommendations: report.recommendations,
          generatedAt: report.generatedAt,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      const elapsedMs = Date.now() - startTime;

      logger.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "error",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Unexpected error in generateAnalytics",
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          elapsedMs,
        }),
      );

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
      });
    }
  }

  /**
   * Calculate the next report week number for a child based on existing reports.
   * Returns the count of existing reports + 1.
   * This allows sequential weekly reports regardless of calendar week.
   *
   * @param childProfileId - The child's profile ID
   * @returns The next week number (1-indexed)
   */
  private async getCurrentISOWeek(childProfileId: string): Promise<number> {
    try {
      const existingReports = await prisma.weeklyAnalyticsReport.findMany({
        where: { childProfileId },
        orderBy: { week: "desc" },
        take: 1,
        select: { week: true },
      });

      if (existingReports.length === 0) {
        // First report for this child
        return 1;
      }

      // Return next week number (last week + 1)
      return existingReports[0].week + 1;
    } catch (error) {
      logger.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Error fetching existing reports for week calculation",
          error: error instanceof Error ? error.message : String(error),
          childProfileId,
        }),
      );

      // Fallback to week 1 if query fails
      return 1;
    }
  }

  /**
   * Get a specific weekly analytics report for a child by week number
   * Retrieves a single report for a specific week and returns total weeks count
   *
   * @param req - Express request with childId in params and week in body
   * @param res - Express response
   */
  async getChildWeeklyAnalytics(
    req: Request,
    res: Response<ApiResponse<
      { report: WeeklyAnalyticsReport | null; totalWeeks: number }>>,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const { childId } = req.params;
      const { week } = req.body;

      // ===================================================================
      // STEP 1: Validate request parameters
      // ===================================================================
      if (!childId || typeof childId !== "string") {
        logger.warn("[Analytics] Missing or invalid childId in request params");
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FIELD",
            message: "childId is required and must be a string",
          },
          timestamp: new Date(),
        });
        return;
      }

      if (week === undefined || week === null) {
        logger.warn("[Analytics] Missing week in request body");
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELD",
            message: "week is required in request body",
          },
          timestamp: new Date(),
        });
        return;
      }

      const weekNumber = parseInt(week);
      if (!Number.isInteger(weekNumber) || weekNumber < 1) {
        logger.warn("[Analytics] Invalid week number", { week: weekNumber });
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FIELD",
            message: "week must be a positive integer",
          },
          timestamp: new Date(),
        });
        return;
      }

      logger.info(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Fetching weekly analytics report for specific week",
          childId,
          week: weekNumber,
        }),
      );

      // ===================================================================
      // STEP 2: Query for report and get total weeks count
      // ===================================================================
      const [report, totalWeeks] = await Promise.all([
        prisma.weeklyAnalyticsReport.findUnique({
          where: {
            childProfileId_week: {
              childProfileId: childId,
              week: weekNumber,
            },
          },
        }),
        prisma.weeklyAnalyticsReport.count({
          where: { childProfileId: childId },
        }),
      ]);

      // ===================================================================
      // STEP 3: Handle report not found
      // ===================================================================
      if (!report) {
        logger.warn(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "warn",
            service: "ai-service",
            agent: "progress-analytics",
            message: "Analytics report not found for specified week",
            childId,
            week: weekNumber,
            totalWeeks,
          }),
        );

        res.status(200).json({
          success: true,
          data: {
            report: null,
            totalWeeks,
          },
          timestamp: new Date(),
        });
        return;
      }

      // ===================================================================
      // STEP 4: Return report with total weeks count
      // ===================================================================
      const elapsedMs = Date.now() - startTime;

      logger.info(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Weekly analytics report retrieved successfully",
          childId,
          week: weekNumber,
          reportId: report.id,
          totalWeeks,
          elapsedMs,
        }),
      );

      res.status(200).json({
        success: true,
        data: {
          report,
          totalWeeks,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      const elapsedMs = Date.now() - startTime;

      logger.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "error",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Error fetching weekly analytics report",
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          childId: req.params.childId,
          week: req.body.week,
          elapsedMs,
        }),
      );

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve analytics report",
        },
        timestamp: new Date(),
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
