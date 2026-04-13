import { Request, Response } from "express";
import { logger } from "../../../lib/logger";
import { ApiResponse, ChildProfile, Story } from "@shared/src/types";
import { generateWeeklyReport } from "../services/analytics.service";
import { GenerateReportResponse } from "../services/types";

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

      // ===================================================================
      // STEP 2: Validate week number
      // ===================================================================
      const reportWeek = this.getCurrentISOWeek();

      if (!Number.isInteger(reportWeek) || reportWeek < 1 || reportWeek > 53) {
        logger.warn("[Analytics] Invalid week number", { week: reportWeek });
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_FIELD",
            message: "week must be a number between 1 and 53",
          },
          timestamp: new Date(),
        } as ApiResponse<any>);
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
        } as ApiResponse<any>);
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
      } as ApiResponse<any>);
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
      } as ApiResponse<any>);
    }
  }

  /**
   * Calculate current ISO week number
   * Used as default if week not provided in request
   */
  private getCurrentISOWeek(): number {
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    );
    const firstThursday = new Date(date.getFullYear(), 0, 4);
    const daysDiff =
      (date.getTime() - firstThursday.getTime()) /
      (24 * 60 * 60 * 1000);
    return Math.floor(daysDiff / 7) + 1;
  }
}

export const analyticsController = new AnalyticsController();
