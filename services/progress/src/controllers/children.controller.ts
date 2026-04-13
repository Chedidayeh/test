import { Request, Response } from "express";
import { ChildrenService } from "../services/children.service";
import {
  ApiResponse,
  ChildProfile,
  GameSession,
  Progress,
  ChallengeAttempt,
  StarEvent,
  ChallengeStatus,
  ChallengeType,
  SessionCheckpoint,
  Story,
} from "@shared/src/types";

export class ChildrenController {
  /**
   * Create a new child profile
   */
  static async createChild(
    req: Request,
    res: Response<ApiResponse<ChildProfile>>,
  ): Promise<void> {
    try {
      const {
        parentEmail,
        parentId,
        name,
        gender,
        childId,
        ageGroupId,
        ageGroupName,
        themeIds,
        allocatedRoadmaps,
        badgeId,
        sessionsPerWeek,
        activateNotifications,
      } = req.body;

      // Validation
      if (
        !parentEmail ||
        !parentId ||
        !name ||
        !gender ||
        !childId ||
        !ageGroupId ||
        !ageGroupName ||
        !badgeId
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message:
              "Missing required fields: parentEmail, parentId, name, gender, childId, ageGroupId, badgeId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const child = await ChildrenService.createChild({
        parentEmail,
        parentId,
        name,
        gender,
        childId,
        ageGroupId,
        ageGroupName,
        themeIds: themeIds || [],
        allocatedRoadmaps: allocatedRoadmaps || [],
        badgeId,
        sessionsPerWeek: sessionsPerWeek ,
        activateNotifications: activateNotifications,
      });

      res.status(201).json({
        success: true,
        data: child,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "CREATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create child",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Fetch all children with stats
   * Query params: limit, offset, childIds (filter by specific child IDs)
   */
  static async getAllChildrenWithPagination(
    req: Request,
    res: Response<ApiResponse<ChildProfile[]>>,
  ): Promise<void> {
    try {
      const { limit, offset, childIds } = req.query;

      // Handle single or multiple child ID filtering
      if (childIds) {
        const ids = Array.isArray(childIds)
          ? (childIds as string[])
          : (childIds as string).split(",");
        const children = await ChildrenService.getChildrenByIds(ids);

        res.json({
          success: true,
          data: children,
          pagination: {
            total: children.length,
            page: 1,
            pageSize: children.length,
            hasMore: false,
          },
          timestamp: new Date(),
        });
        return;
      }

      // Get all children with pagination
      const parsedLimit = limit ? Math.min(parseInt(limit as string), 100) : 10;
      const parsedOffset = offset ? parseInt(offset as string) : 0;

      const result = await ChildrenService.getAllChildrenWithPagination({
        limit: parsedLimit,
        offset: parsedOffset,
      });

      res.json({
        success: true,
        data: result.children,
        pagination: result.pagination,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch children",
        },
        timestamp: new Date(),
      });
    }
  }

  static async getWeekChildren(
    req: Request,
    res: Response<ApiResponse<{ children: ChildProfile[]; total: number }>>,
  ): Promise<void> {
    try {
      const result = await ChildrenService.getWeekChildren();

      res.json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch children",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Fetch all children with storytelling profiles enabled
   */
  static async getAllChildrenWithStorytelling(
    req: Request,
    res: Response<ApiResponse<ChildProfile[]>>,
  ): Promise<void> {
    try {
      const result = await ChildrenService.getAllChildrenWithStorytelling();

      res.json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching children with storytelling:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch children with storytelling",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Fetch all children with parent information for push notifications
   */
  static async getChildrenForPushNotifications(
    req: Request,
    res: Response<ApiResponse<ChildProfile[]>>,
  ): Promise<void> {
    try {
      const result = await ChildrenService.getChildrenForPushNotifications();

      res.json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching children for push notifications:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch children for push notifications",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Fetch a single child by ID
   */
  static async getChildById(
    req: Request,
    res: Response<ApiResponse<ChildProfile | null>>,
  ): Promise<void> {
    try {
      const { id } = req.params;

      const child = await ChildrenService.getChildById(id);

      if (!child) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Child profile not found",
          },
          timestamp: new Date(),
        });
        return;
      }

      res.json({
        success: true,
        data: child,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching child:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch child",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Fetch all children for a specific parent
   */
  static async getChildrenByParentId(
    req: Request,
    res: Response<ApiResponse<ChildProfile[]>>,
  ): Promise<void> {
    try {
      const { parentId } = req.params;

      if (!parentId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: parentId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const children = await ChildrenService.getChildrenByParentId(parentId);

      res.json({
        success: true,
        data: children,
        pagination: {
          total: children.length,
          page: 1,
          pageSize: children.length,
          hasMore: false,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching children by parent ID:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch children",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Create a new story progress record for a child
   */
  static async startStoryProgress(
    req: Request,
    res: Response<ApiResponse<Progress | null>>,
  ): Promise<void> {
    try {
      const { childId, storyId } = req.params;
      const { firstChapterId, worldId, roadmapId, challengeIds } = req.body;

      // Validation
      if (!childId || !storyId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameters: childId and storyId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const progressRecord = await ChildrenService.startStoryProgress({
        childId,
        storyId,
        worldId,
        roadmapId,
        firstChapterId,
        challengeIds,
      });

      res.status(201).json({
        success: true,
        data: progressRecord,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error starting story:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "CREATE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to start story",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Fetch child progress for a specific story
   */
  static async getChildProgress(
    req: Request,
    res: Response<ApiResponse<Progress | null>>,
  ): Promise<void> {
    try {
      const { childId, storyId } = req.params;

      // Validation
      if (!childId || !storyId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameters: childId and storyId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const progress = await ChildrenService.getChildProgress(childId, storyId);

      if (!progress) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Progress not found for this story",
          },
          timestamp: new Date(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: progress,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching child progress:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch progress",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Save checkpoint for a game session
   * Body: { gameSessionId, chapterId }
   */
  static async saveCheckpoint(
    req: Request,
    res: Response<ApiResponse<GameSession | null>>,
  ): Promise<void> {
    try {
      const { gameSessionId, chapterId, elapsedTime } = req.body;

      // Validation
      if (!gameSessionId || !chapterId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required fields: gameSessionId and chapterId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const updatedSession = await ChildrenService.saveCheckpoint(
        gameSessionId,
        chapterId,
        elapsedTime,
      );

      res.status(200).json({
        success: true,
        data: updatedSession,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving checkpoint:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "SAVE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to save checkpoint",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Resume from a checkpoint
   * Records resume timestamp and calculates idle time
   * Params: checkpointId, Body: { gameSessionId }
   */
  static async createNewCheckpoint(
    req: Request,
    res: Response<ApiResponse<SessionCheckpoint>>,
  ): Promise<void> {
    try {
      const { gameSessionId } = req.params;

      // Validation
      if (!gameSessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: gameSessionId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const result = await ChildrenService.createNewCheckpoint(gameSessionId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error resuming checkpoint:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "RESUME_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to resume checkpoint",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Pause a game session - saves state when user exits the story
   * Updates the most recent incomplete checkpoint with the pause timestamp
   */
  static async pauseCheckpoint(
    req: Request,
    res: Response<ApiResponse<SessionCheckpoint | null>>,
  ): Promise<void> {
    try {
      const { gameSessionId } = req.params;

      // Validation
      if (!gameSessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: gameSessionId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const result = await ChildrenService.pauseCheckpoint(gameSessionId);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error pausing checkpoint:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "PAUSE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to pause game session",
        },
        timestamp: new Date(),
      });
    }
  }

  static async submitChallengeAnswer(
    req: Request,
    res: Response<
      ApiResponse<{
        attempt: ChallengeAttempt;
        starEvent: StarEvent;
        totalStars: number;
      }>
    >,
  ): Promise<void> {
    try {
      const {
        gameSessionId,
        challengeId,
        challengeType,
        answerId,
        textAnswer,
        isCorrect,
        elapsedTime,
        attemptNumber,
        usedHints,
        maxAttempts,
        baseStars,
        skipped,
        status,
        actions,
      } = req.body;

      // Validation
      if (!gameSessionId || !challengeId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required fields: gameSessionId and challengeId",
          },
          timestamp: new Date(),
        });
        return;
      }

      if (!baseStars || !status) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required fields: baseStars and status",
          },
          timestamp: new Date(),
        });
        return;
      }

      console.log("actions received in controller:", actions);

      const result = await ChildrenService.submitChallengeAnswer({
        gameSessionId,
        challengeId,
        challengeType: challengeType as ChallengeType,
        answerId,
        textAnswer,
        isCorrect,
        elapsedTime,
        attemptNumber,
        usedHints,
        maxAttempts,
        baseStars,
        skipped: skipped || false,
        status: status as ChallengeStatus,
        actions,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error submitting challenge answer:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "SUBMIT_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to submit challenge answer",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Complete a story for a game session
   * Marks the story as completed and triggers completion rewards
   */
  static async completeStory(
    req: Request,
    res: Response<ApiResponse<GameSession | null>>,
  ): Promise<void> {
    try {
      const { gameSessionId } = req.params;
      const { elapsedTime } = req.body;

      // Validation
      if (!gameSessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: gameSessionId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const completedSession = await ChildrenService.completeStory(
        gameSessionId,
        elapsedTime,
      );

      res.status(200).json({
        success: true,
        data: completedSession,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error completing story:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "COMPLETE_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to complete story",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update a child's current level
   * Body: { currentLevel }
   */
  static async updateChildLevel(
    req: Request,
    res: Response<ApiResponse<ChildProfile>>,
  ): Promise<void> {
    try {
      const { childId } = req.params;
      const { currentLevel } = req.body;

      // Validation
      if (!childId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: childId",
          },
          timestamp: new Date(),
        });
        return;
      }

      if (currentLevel === undefined || currentLevel === null) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required field: currentLevel",
          },
          timestamp: new Date(),
        });
        return;
      }

      const updatedChild = await ChildrenService.updateChildLevel(
        childId,
        currentLevel,
      );

      if (!updatedChild) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Child profile not found",
          },
          timestamp: new Date(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedChild,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error updating child level:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update child level",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Assign a badge to a child
   * Body: { badgeId }
   */
  static async assignBadgeToChild(
    req: Request,
    res: Response<ApiResponse<ChildProfile>>,
  ): Promise<void> {
    try {
      const { childId } = req.params;
      const { badgeId } = req.body;

      // Validation
      if (!childId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: childId",
          },
          timestamp: new Date(),
        });
        return;
      }

      if (!badgeId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required field: badgeId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const updatedChild = await ChildrenService.assignBadgeToChild(
        childId,
        badgeId,
      );

      if (!updatedChild) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Child profile not found",
          },
          timestamp: new Date(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedChild,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error assigning badge:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "ASSIGN_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to assign badge",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Allocate a roadmap to a child
   */
  static async allocateRoadmapToChild(
    req: Request,
    res: Response<ApiResponse<ChildProfile>>,
  ): Promise<void> {
    try {
      const { childId } = req.params;
      const { roadmapId } = req.body;

      // Validation
      if (!childId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: childId",
          },
          timestamp: new Date(),
        });
        return;
      }

      if (!roadmapId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required field: roadmapId",
          },
          timestamp: new Date(),
        });
        return;
      }

      const updatedChild = await ChildrenService.allocateRoadmapToChild(
        childId,
        roadmapId,
      );

      if (!updatedChild) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Child profile not found",
          },
          timestamp: new Date(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedChild,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error allocating roadmap:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "ALLOCATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to allocate roadmap",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update child's notification settings
   * Body: { activateNotifications }
   */
  static async updateNotificationSettings(
    req: Request,
    res: Response<ApiResponse<ChildProfile>>,
  ): Promise<void> {
    try {
      const { childId } = req.params;
      const { activateNotifications } = req.body;

      // Validation
      if (!childId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required parameter: childId",
          },
          timestamp: new Date(),
        });
        return;
      }

      if (activateNotifications === undefined || activateNotifications === null) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required field: activateNotifications",
          },
          timestamp: new Date(),
        });
        return;
      }

      const updatedChild = await ChildrenService.updateNotificationSettings(
        childId,
        activateNotifications,
      );

      if (!updatedChild) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Child profile not found",
          },
          timestamp: new Date(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedChild,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update notification settings",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get aggregated children statistics for admin dashboard
   * Returns: totalChildren, activeChildren, totalStoriesCompleted, totalChallengesSolved
   */
  static async getChildrenStats(
    req: Request,
    res: Response<
      ApiResponse<{
        totalChildren: number;
        activeChildren: number;
        totalStoriesCompleted: number;
        totalChallengesSolved: number;
      }>
    >,
  ): Promise<void> {
    try {
      const stats = await ChildrenService.getChildrenStats();

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error fetching children stats:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "STATS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch children statistics",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Save storytelling profile for a child
   * Body: { childProfileId, childName, childLanguage, favoriteThemes, learningObjectives, customThemes, otherObjective }
   */
  static async saveStorytellingProfile(
    req: Request,
    res: Response<ApiResponse<any>>,
  ): Promise<void> {
    try {
      const {
        childProfileId,
        childName,
        childLanguage,
        favoriteThemes,
        learningObjectives,
      } = req.body;

      // Validation
      if (
        !childProfileId ||
        !childName ||
        !childLanguage ||
        !Array.isArray(favoriteThemes)
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message:
              "Missing required fields: childProfileId, childName, childLanguage, favoriteThemes",
          },
          timestamp: new Date(),
        });
        return;
      }

      const storytellingProfile = await ChildrenService.saveStorytellingProfile(
        {
          childProfileId,
          childName,
          childLanguage,
          favoriteThemes,
          learningObjectives: learningObjectives || [],
        },
      );

      res.status(200).json({
        success: true,
        data: storytellingProfile,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving storytelling profile:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "SAVE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to save storytelling profile",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update storytelling story for a child
   * Called after a story is generated and saved to Content Service
   * Receives the Story object and updates Progress Service tracking
   */
  static async updateStorytellingStory(
    req: Request,
    res: Response<ApiResponse<any>>,
  ): Promise<void> {
    try {
      const { childId } = req.params;
      const { story } = req.body;

      if (!childId || !story) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required fields: childId or story",
          },
          timestamp: new Date(),
        });
        return;
      }

      const result = await ChildrenService.updateStorytellingStory(
        childId,
        story as Story,
      );

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error updating storytelling story:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update storytelling story",
        },
        timestamp: new Date(),
      });
    }
  }
}
