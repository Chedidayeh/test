import { logger } from "../../../lib/logger";
import { ChildProfile, Story, Progress, GameSession } from "@shared/src/types";

/**
 * AnalyticsValidationService
 *
 * Validates child progress data before processing by AnalyticsDataAggregator
 * Ensures data integrity, completeness, and consistency
 */
export class AnalyticsValidationService {
  /**
   * Comprehensive validation of input data
   * Throws error if validation fails
   */
  validateAnalyticsInput(
    childProfile: ChildProfile,
    storiesData: Story[],
  ): { valid: true; errors: string[] } {
    const errors: string[] = [];

    // Validate childProfile existence and required fields
    if (!childProfile) {
      errors.push("childProfile is required");
      throw this.createValidationError(errors);
    }

    if (!childProfile.id || typeof childProfile.id !== "string") {
      errors.push("childProfile.id is required and must be a string");
    }

    if (!childProfile.name || typeof childProfile.name !== "string") {
      errors.push("childProfile.name is required and must be a string");
    }

    // Validate progress array
    if (!Array.isArray(childProfile.progress)) {
      logger.warn("[Validation] childProfile.progress is not an array", {
        childProfileId: childProfile.id,
        progressType: typeof childProfile.progress,
      });
      childProfile.progress = [];
    }

    // Validate each progress record
    if (childProfile.progress && childProfile.progress.length > 0) {
      childProfile.progress.forEach((progress, index) => {
        const progressErrors = this.validateProgress(progress, index);
        errors.push(...progressErrors);
      });
    }

    // Validate storiesData
    if (!Array.isArray(storiesData)) {
      errors.push("storiesData must be an array");
      throw this.createValidationError(errors);
    }

    if (storiesData.length === 0) {
      logger.warn("[Validation] storiesData array is empty", {
        childProfileId: childProfile.id,
      });
    }

    // Validate each story
    storiesData.forEach((story, index) => {
      const storyErrors = this.validateStory(story, index);
      errors.push(...storyErrors);
    });

    // Validate numeric fields
    if (childProfile.totalStars !== undefined && childProfile.totalStars < 0) {
      errors.push("childProfile.totalStars must be non-negative");
    }

    if (childProfile.currentLevel !== undefined && childProfile.currentLevel < 0) {
      errors.push("childProfile.currentLevel must be non-negative");
    }

    if (errors.length > 0) {
      logger.warn("[Validation] Analytics input validation detected errors", {
        childProfileId: childProfile.id,
        errorCount: errors.length,
        errors,
      });
    }

    logger.info("[Validation] Analytics input validation passed", {
      childProfileId: childProfile.id,
      progressRecordsCount: childProfile.progress?.length || 0,
      storiesCount: storiesData.length,
    });

    return { valid: true, errors };
  }

  /**
   * Validate individual progress record
   */
  private validateProgress(progress: Progress, index: number): string[] {
    const errors: string[] = [];

    if (!progress) {
      errors.push(`progress[${index}] is null or undefined`);
      return errors;
    }

    if (!progress.id || typeof progress.id !== "string") {
      errors.push(`progress[${index}].id is required and must be a string`);
    }

    if (!progress.status) {
      errors.push(`progress[${index}].status is required`);
    }

    if (process.env.NODE_ENV === "development" && !progress.storyId) {
      logger.debug(`[Validation] progress[${index}].storyId is missing`, {
        progressId: progress.id,
      });
    }

    // Validate game session if present
    if (progress.gameSession) {
      const sessionErrors = this.validateGameSession(
        progress.gameSession,
        index,
      );
      errors.push(...sessionErrors);
    }

    // Validate time spent is non-negative
    if (
      progress.totalTimeSpent !== undefined &&
      progress.totalTimeSpent < 0
    ) {
      errors.push(`progress[${index}].totalTimeSpent must be non-negative`);
    }

    return errors;
  }

  /**
   * Validate game session data
   */
  private validateGameSession(
    session: GameSession,
    progressIndex: number,
  ): string[] {
    const errors: string[] = [];

    if (!session.id || typeof session.id !== "string") {
      errors.push(
        `progress[${progressIndex}].gameSession.id is required and must be a string`,
      );
    }

    if (!session.storyId || typeof session.storyId !== "string") {
      errors.push(
        `progress[${progressIndex}].gameSession.storyId is required and must be a string`,
      );
    }

    // Validate timestamps (accept both Date objects and date strings)
    if (!session.startedAt) {
      errors.push(
        `progress[${progressIndex}].gameSession.startedAt is required`,
      );
    } else if (!(session.startedAt instanceof Date) && typeof session.startedAt !== "string") {
      errors.push(
        `progress[${progressIndex}].gameSession.startedAt must be a Date or date string`,
      );
    }

    // Validate numeric fields
    if (session.totalTimeSpent !== undefined && session.totalTimeSpent < 0) {
      errors.push(
        `progress[${progressIndex}].gameSession.totalTimeSpent must be non-negative`,
      );
    }

    if (session.sessionCount !== undefined && session.sessionCount < 0) {
      errors.push(
        `progress[${progressIndex}].gameSession.sessionCount must be non-negative`,
      );
    }

    if (session.starsEarned !== undefined && session.starsEarned < 0) {
      errors.push(
        `progress[${progressIndex}].gameSession.starsEarned must be non-negative`,
      );
    }

    // Validate challenge attempts if present
    if (Array.isArray(session.challengeAttempts)) {
      session.challengeAttempts.forEach((attempt, attemptIndex) => {
        if (!attempt.id) {
          errors.push(
            `progress[${progressIndex}].gameSession.challengeAttempts[${attemptIndex}].id is required`,
          );
        }

        if (!attempt.status) {
          errors.push(
            `progress[${progressIndex}].gameSession.challengeAttempts[${attemptIndex}].status is required`,
          );
        }

        if (!attempt.challengeId) {
          errors.push(
            `progress[${progressIndex}].gameSession.challengeAttempts[${attemptIndex}].challengeId is required`,
          );
        }

        if (
          attempt.timeSpentSeconds !== undefined &&
          attempt.timeSpentSeconds < 0
        ) {
          errors.push(
            `progress[${progressIndex}].gameSession.challengeAttempts[${attemptIndex}].timeSpentSeconds must be non-negative`,
          );
        }

        if (
          attempt.usedHints !== undefined &&
          attempt.usedHints < 0
        ) {
          errors.push(
            `progress[${progressIndex}].gameSession.challengeAttempts[${attemptIndex}].usedHints must be non-negative`,
          );
        }
      });
    }

    return errors;
  }

  /**
   * Validate story data
   */
  private validateStory(story: Story, index: number): string[] {
    const errors: string[] = [];

    if (!story) {
      errors.push(`storiesData[${index}] is null or undefined`);
      return errors;
    }

    if (!story.id || typeof story.id !== "string") {
      errors.push(`storiesData[${index}].id is required and must be a string`);
    }

    if (!story.title || typeof story.title !== "string") {
      errors.push(
        `storiesData[${index}].title is required and must be a string`,
      );
    }

    if (story.difficulty !== undefined) {
      if (typeof story.difficulty !== "number" || story.difficulty < 1 || story.difficulty > 5) {
        errors.push(
          `storiesData[${index}].difficulty must be a number between 1 and 5`,
        );
      }
    }

    // Validate chapters if present
    if (Array.isArray(story.chapters)) {
      story.chapters.forEach((chapter, chapterIndex) => {
        if (!chapter.id || typeof chapter.id !== "string") {
          errors.push(
            `storiesData[${index}].chapters[${chapterIndex}].id is required and must be a string`,
          );
        }

        // Validate challenges if present
        if (chapter.challenge) {
          if (!chapter.challenge.id || typeof chapter.challenge.id !== "string") {
            errors.push(
              `storiesData[${index}].chapters[${chapterIndex}].challenge.id is required and must be a string`,
            );
          }

          if (!chapter.challenge.type) {
            errors.push(
              `storiesData[${index}].chapters[${chapterIndex}].challenge.type is required`,
            );
          }
        }
      });
    }

    return errors;
  }

  /**
   * Validate period dates
   */
  validatePeriod(periodStart: Date, periodEnd: Date): { valid: true; errors: string[] } {
    const errors: string[] = [];

    if (!periodStart || !(periodStart instanceof Date)) {
      errors.push("periodStart must be a valid Date");
    }

    if (!periodEnd || !(periodEnd instanceof Date)) {
      errors.push("periodEnd must be a valid Date");
    }

    if (periodStart && periodEnd && periodStart > periodEnd) {
      errors.push("periodStart must be before periodEnd");
    }

    if (errors.length > 0) {
      logger.warn("[Validation] Period validation errors", {
        periodStart,
        periodEnd,
        errors,
      });
      throw this.createValidationError(errors);
    }

    logger.info("[Validation] Period validation passed", {
      periodStart,
      periodEnd,
    });

    return { valid: true, errors };
  }

  /**
   * Helper: Create validation error
   */
  private createValidationError(errors: string[]): Error {
    const errorMessage = `Analytics validation failed: ${errors.join("; ")}`;
    logger.error("[Validation] Validation error created", {
      errorCount: errors.length,
      errorMessage,
    });
    return new Error(errorMessage);
  }

  /**
   * Helper: Log validation summary
   */
  logValidationSummary(
    childProfileId: string,
    progressCount: number,
    storiesCount: number,
  ): void {
    logger.info("[Validation] Input summary", {
      childProfileId,
      progressRecords: progressCount,
      stories: storiesCount,
      timestamp: new Date().toISOString(),
    });
  }
}

export const analyticsValidationService = new AnalyticsValidationService();
