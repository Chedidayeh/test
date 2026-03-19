import { PrismaClient } from "@prisma/client";
import { AggregatedMetrics, ChildProfile, InsightsReport } from "@shared/src/types";
import { logger } from "../../../lib/logger";

/**
 * InsightsPersistenceService
 *
 * Handles persistence of AI-generated insights to the database
 * Stores complete analytics responses for future reference and historical tracking
 *
 * Features:
 * - Saves AIProgressInsight records with all metrics and insights as JSON
 * - Allows multiple insights per child per week (for comparison and trend analysis)
 * - Stores recommendations, strengths, weaknesses, and tips as complete JSON
 * - Maintains audit trail with createdAt/updatedAt timestamps
 */
export class InsightsPersistenceService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Save AI progress insights to database
   * @param child ChildProfile
   * @param insights InsightsReport from LLM
   * @param metrics AggregatedMetrics
   * @returns Saved AIProgressInsight record
   */
  public async saveInsights(
    child: ChildProfile,
    insights: InsightsReport,
    metrics: AggregatedMetrics,
  ): Promise<any> {
    try {
      logger.info("[InsightsPersistence] Saving AI progress insights to database", {
        childId: child.id,
        childName: child.name,
        periodStart: insights.periodStart,
        periodEnd: insights.periodEnd,
      });

      // Prepare insights data - convert to plain JSON objects
      const insightsData = JSON.parse(
        JSON.stringify({
          strengths: insights.strengths,
          weaknesses: insights.weaknesses,
          recommendations: insights.recommendations,
          tips: insights.tips,
          summary: insights.summary,
        }),
      );

      // Prepare metrics data - convert to plain JSON objects
      const metricsData = JSON.parse(
        JSON.stringify({
          totalStoriesCompleted: metrics.totalStoriesCompleted,
          totalChallengesAttempted: metrics.totalChallengesAttempted,
          totalChallengesSolved: metrics.totalChallengesSolved,
          successRate: metrics.successRate,
          averageAttemptsPerChallenge: metrics.averageAttemptsPerChallenge,
          totalTimeSpent: metrics.totalTimeSpent,
          hintDependencyRate: metrics.hintDependencyRate,
          starsEarned: metrics.starsEarned,
          starsPossible: metrics.starsPossible,
          starAchievementRate: metrics.starAchievementRate,
          performanceByType: metrics.performanceByType,
          performanceByDifficulty: metrics.performanceByDifficulty,
          improvementTrend: metrics.improvementTrend,
          lastActivityDate: metrics.lastActivityDate,
        }),
      );

      // Save to database
      const savedInsight = await this.prisma.aIProgressInsight.create({
        data: {
          childId: child.id,
          periodStart: insights.periodStart,
          periodEnd: insights.periodEnd,
          readingLevel: insights.readingLevel,
          engagementScore: insights.engagementScore,
          insights: insightsData,
          metrics: metricsData,
        },
      });

      logger.info("[InsightsPersistence] ✅ AI progress insights saved successfully", {
        childId: child.id,
        recordId: savedInsight.id,
        readingLevel: insights.readingLevel,
        engagementScore: insights.engagementScore,
      });

      return savedInsight;
    } catch (error) {
      logger.error("[InsightsPersistence] Error saving insights to database", {
        childId: child.id,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      throw error;
    }
  }

  /**
   * Retrieve insights for a specific child
   * @param childId Child ID
   * @param limit Number of recent records to fetch (default: 10)
   * @returns Array of AIProgressInsight records
   */
  public async getChildInsights(childId: string, limit: number = 10): Promise<any[]> {
    try {
      logger.debug("[InsightsPersistence] Fetching insights for child", {
        childId,
        limit,
      });

      const insights = await this.prisma.aIProgressInsight.findMany({
        where: { childId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      logger.debug("[InsightsPersistence] Retrieved insights", {
        childId,
        count: insights.length,
      });

      return insights;
    } catch (error) {
      logger.error("[InsightsPersistence] Error fetching insights", {
        childId,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      throw error;
    }
  }

  /**
   * Retrieve insights within a time range
   * @param childId Child ID
   * @param startDate Period start
   * @param endDate Period end
   * @returns Array of AIProgressInsight records
   */
  public async getInsightsByPeriod(
    childId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      logger.debug("[InsightsPersistence] Fetching insights for period", {
        childId,
        startDate,
        endDate,
      });

      const insights = await this.prisma.aIProgressInsight.findMany({
        where: {
          childId,
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate },
        },
        orderBy: { createdAt: "desc" },
      });

      logger.debug("[InsightsPersistence] Retrieved period insights", {
        childId,
        count: insights.length,
      });

      return insights;
    } catch (error) {
      logger.error("[InsightsPersistence] Error fetching period insights", {
        childId,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      throw error;
    }
  }

  /**
   * Get the most recent insight for a child
   * @param childId Child ID
   * @returns Latest AIProgressInsight or null
   */
  public async getLatestInsight(childId: string): Promise<any | null> {
    try {
      logger.debug("[InsightsPersistence] Fetching latest insight for child", {
        childId,
      });

      const insight = await this.prisma.aIProgressInsight.findFirst({
        where: { childId },
        orderBy: { createdAt: "desc" },
      });

      if (insight) {
        logger.debug("[InsightsPersistence] Found latest insight", {
          childId,
          recordId: insight.id,
          createdAt: insight.createdAt,
        });
      } else {
        logger.debug("[InsightsPersistence] No insights found for child", {
          childId,
        });
      }

      return insight;
    } catch (error) {
      logger.error("[InsightsPersistence] Error fetching latest insight", {
        childId,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      throw error;
    }
  }
}

// Initialize with Prisma client
const prisma = new PrismaClient();
export const insightsPersistenceService = new InsightsPersistenceService(prisma);
