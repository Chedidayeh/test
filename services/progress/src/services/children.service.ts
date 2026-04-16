import { PrismaClient, ProgressStatus, ChallengeStatus } from "@prisma/client";
import {
  ChildProfile,
  PaginationMeta,
  GameSession,
  Progress,
  ChallengeAttempt,
  StarEvent,
  ChallengeType,
  SessionCheckpoint,
  AttemptAction,
  Story,
} from "@shared/src/types";

const prisma = new PrismaClient();

export class ChildrenService {
  /**
   * Create a new child profile
   */
  static async createChild(payload: {
    parentEmail: string;
    parentId: string;
    name: string;
    gender: string;
    childId: string;
    ageGroupId: string;
    ageGroupName: string;
    themeIds: string[];
    allocatedRoadmaps: string[];
    badgeId: string;
    sessionsPerWeek: number;
    activateNotifications: boolean;
  }): Promise<ChildProfile> {
    const childProfile = await prisma.childProfile.create({
      data: {
        parentId: payload.parentId,
        name: payload.name,
        gender: payload.gender,
        ageGroupId: payload.ageGroupId,
        ageGroupName: payload.ageGroupName,
        favoriteThemes: payload.themeIds,
        allocatedRoadmaps: payload.allocatedRoadmaps,
        childId: payload.childId,
        sessionsPerWeek: payload.sessionsPerWeek,
        activateNotifications: payload.activateNotifications,
        badges: {
          create: { badgeId: payload.badgeId },
        },
        dailyActivity: {
          create: {}, // Create empty daily activity record for tracking
        },
      },
      include: {
        progress: {
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    starEvent: true,
                  },
                },
                checkpoints: true,
              },
            },
          },
        },
        badges: true,
      },
    });

    // Cast to ChildProfile - Prisma handles enum conversion
    return childProfile
  }

  /**
   * Fetch all children with their progress stats
   * Returns paginated results with optional filtering
   */
  static async getAllChildrenWithPagination(
    options: {
      limit?: number;
      offset?: number;
      searchTerm?: string;
    } = {},
  ): Promise<{
    children: ChildProfile[];
    pagination: PaginationMeta;
  }> {
    const limit = Math.min(options.limit || 10, 100); // Max 100 per page
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    // Fetch child profiles with relations
    const childProfiles = await prisma.childProfile.findMany({
      skip: offset,
      take: limit,
      include: {
        progress: {
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    starEvent: true,
                  },
                },
                checkpoints: true,
              },
            },
          },
        },
        badges: true,
      },
    });

    // Get total count
    const total = await prisma.childProfile.count();

    // Cast to ChildProfile[] - Prisma handles enum conversion
    const typedProfiles = childProfiles

    return {
      children: typedProfiles,
      pagination: {
        total,
        page,
        pageSize: limit,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Fetch all children with their progress stats from the past week
   * Only returns children that have progress data in the last 7 days
   * Only returns progress records from the past 7 days
   */
  static async getWeekChildren(): Promise<{
    children: ChildProfile[];
    total: number;
  }> {
    // Calculate date from 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch child profiles with relations, only those with progress in the past week
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        activateWeeklyReports: true, // Only include children who have weekly reports enabled
        progress: {
          some: {
            // Filter for progress records from the past 7 days
            // Use completedAt if available, otherwise check createdAt
            OR: [
              {
                completedAt: {
                  gte: sevenDaysAgo,
                },
              },
              {
                createdAt: {
                  gte: sevenDaysAgo,
                },
              },
            ],
          },
        },
      },
      include: {
        progress: {
          // Only include progress records from the past 7 days
          where: {
            OR: [
              {
                completedAt: {
                  gte: sevenDaysAgo,
                },
              },
              {
                createdAt: {
                  gte: sevenDaysAgo,
                },
              },
            ],
          },
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    actions: true,
                    starEvent: true,
                  },
                },
                checkpoints: true,
              },
            },
          },
        },
        badges: true,
      },
    });

    // Get total count of children with progress in the past 7 days
    const total = await prisma.childProfile.count({
      where: {
        progress: {
          some: {
            OR: [
              {
                completedAt: {
                  gte: sevenDaysAgo,
                },
              },
              {
                createdAt: {
                  gte: sevenDaysAgo,
                },
              },
            ],
          },
        },
      },
    });

    // Cast to ChildProfile[] - Prisma handles enum conversion
    const typedProfiles = childProfiles

    return {
      children: typedProfiles,
      total,
    };
  }

  /**
   * Fetch all children with storytelling profiles enabled
   * Includes:
   * - Children with active storytelling profiles (isActive = true)
   * - Where ALL stories in their storytelling profile have status COMPLETED
   */
  static async getAllChildrenWithStorytelling(): Promise<ChildProfile[]> {
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        AND: [
          {
            storytelling: {
              is: {
                isActive: true, // Only active storytelling profiles
              },
            },
          },
          {
            NOT: {
              storytelling: {
                stories: {
                  some: {
                    status: {
                      not: ProgressStatus.COMPLETED, // No stories with incomplete status
                    },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        storytelling: {
          include: {
            stories: {
              include: {
                progress: true,
              },
            },
          },
        },
      },
    });

    // Cast to ChildProfile[] - Prisma handles enum conversion
    const typedProfiles = childProfiles

    return typedProfiles;
  }

  /**
   * Fetch children for a specific child ID (single or multiple)
   */
  static async getChildrenByIds(childIds: string[]): Promise<ChildProfile[]> {
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        childId: {
          in: childIds,
        },
      },
      include: {
        progress: {
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    starEvent: true,
                  },
                },
                checkpoints: true,
              },
            },
          },
        },
        badges: true,
      },
    });

    // Cast to ChildProfile[] - Prisma handles enum conversion
    return childProfiles
  }

  /**
   * Fetch all children with parent information for push notifications
   * Returns all children with their parent details included
   * Used by the daily parent notification cron job
   */
  /**
   * Fetch all children with parent information and daily activity for push notifications
   * Returns children who have notifications enabled with their activity tracking
   * Used to check if they missed today's session
   */
  static async getChildrenForPushNotifications(): Promise<ChildProfile[]> {
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        activateNotifications: true,
      },
      include: {
        dailyActivity: true, // Include activity tracking to check lastActiveAt
      },
    });

    // Cast to ChildProfile[] - Prisma handles enum conversion
    const typedProfiles = childProfiles 

    return typedProfiles;
  }

  /**
   * Update child's daily activity - called when child completes a story/challenge
   * Updates lastActiveAt to track when child was last active
   */
  static async updateChildDailyActivity(childId: string): Promise<any> {
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId },
    });

    if (!childProfile) {
      throw new Error(`Child profile not found for childId: ${childId}`);
    }

    // Update or create daily activity record
    const dailyActivity = await prisma.childDailyActivity.upsert({
      where: { childProfileId: childProfile.id },
      update: {
        lastActiveAt: new Date(),
      },
      create: {
        childProfileId: childProfile.id,
        lastActiveAt: new Date(),
      },
    });

    return dailyActivity;
  }

  /**
   * Fetch children for a specific parent ID
   */
  static async getChildrenByParentId(
    parentId: string,
  ): Promise<ChildProfile[]> {
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        parentId,
      },
      // include: {
      //   storytelling: true,
      //   progress: {
      //     include: {
      //       gameSession: {
      //         include: {
      //           challengeAttempts: {
      //             include: {
      //               starEvent: true,
      //               actions: true,
      //             },
      //           },
      //           checkpoints: true,
      //         },
      //       },
      //     },
      //   },
      //   badges: true,
      // },
    });

    // Cast to ChildProfile[] - Prisma handles enum conversion
    return childProfiles
  }

  /**
   * Fetch child profile IDs for a specific parent
   * Returns only the child profile ID strings, not full profiles
   */
  static async getChildProfilesByParent(
    parentId: string,
  ): Promise<ChildProfile[]> {
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        parentId,
      },
      orderBy: {
        createdAt: "asc",
      }
    });

    // Extract and return only the childId values
    return childProfiles
  }

  /**
   * Get a single child profile by ID
   */
  static async getChildById(
    childProfileId: string,
  ): Promise<ChildProfile | null> {
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId: childProfileId },
      include: {
        storytelling: {
          include: {
            stories: true,
          },
        },
        progress: {
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    starEvent: true,
                    actions: true,
                  },
                },
                checkpoints: true,
              },
            },
          },
        },
        badges: true,
      },
    });

    if (!childProfile) return null;

    // Cast to ChildProfile - Prisma handles enum conversion
    return childProfile
  }

  /**
   * Get progress for a specific child and story
   */
  static async getChildProgress(
    childId: string,
    storyId: string,
  ): Promise<Progress | null> {
    // First, find the child profile by childId
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId },
    });

    if (!childProfile) {
      return null;
    }

    // Then find the progress record for this child and story
    const progress = await prisma.progress.findUnique({
      where: {
        childProfileId_storyId: {
          childProfileId: childProfile.id,
          storyId,
        },
      },
      include: {
        gameSession: {
          include: {
            challengeAttempts: {
              include: {
                starEvent: true,
                actions: true,
              },
            },
            checkpoints: true,
          },
        },
      },
    });

    if (!progress) {
      return null;
    }

    // Cast to Progress - Prisma handles enum conversion
    return progress
  }

  static async startStoryProgress(payload: {
    childId: string;
    storyId: string;
    worldId: string | undefined;
    roadmapId: string | undefined;
    firstChapterId: string;
    challengeIds?: string[];
  }): Promise<Progress | null> {
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId: payload.childId },
      include: {
        storytelling: {
          include: {
            stories: true,
          },
        },
      },
    });

    if (!childProfile) {
      return null;
    }

    // if storytelling profile is active, find the story and update its status to IN_PROGRESS
    let storytellingStoryId: string | undefined;
    if (childProfile.storytelling?.isActive) {
      // Find the storytelling story using composite fields
      const storytellingStory = await prisma.storytellingStory.findFirst({
        where: {
          storyId: payload.storyId,
          storytellingProfileId: childProfile.storytelling.id,
        },
      });

      // Update using the unique id field
      if (storytellingStory) {
        storytellingStoryId = storytellingStory.id;
        await prisma.storytellingStory.update({
          where: { id: storytellingStory.id },
          data: {
            status: ProgressStatus.IN_PROGRESS,
          },
        });
      }
    }

    const progress = await prisma.progress.upsert({
      where: {
        childProfileId_storyId: {
          childProfileId: childProfile.id,
          storyId: payload.storyId,
        },
      },
      update: {}, // If it exists, just return it
      create: {
        childProfileId: childProfile.id,
        storytellingStoryId,
        storyId: payload.storyId,
        worldId: payload.worldId,
        roadmapId: payload.roadmapId,
        status: ProgressStatus.IN_PROGRESS,
        gameSession: {
          create: {
            storyId: payload.storyId,
            chapterId: payload.firstChapterId,
            challengeAttempts: {
              createMany: {
                data: (payload.challengeIds ?? []).map((challengeId) => ({
                  challengeId,
                  status: ChallengeStatus.NOT_ATTEMPTED,
                  attemptNumber: 0,
                  usedHints: 0,
                  timeSpentSeconds: 0,
                })),
              },
            },
          },
        },
      },
      include: {
        gameSession: {
          include: {
            challengeAttempts: {
              include: {
                starEvent: true,
              },
            },
          },
        },
      },
    });
    return progress
  }

  /**
   * Save checkpoint for a game session
   * Updates the game session with chapter ID and checkpoint reference
   * Used when player pauses or stops reading
   */
  static async saveCheckpoint(
    gameSessionId: string,
    chapterId: string,
    elapsedTime: number,
  ): Promise<GameSession | null> {
    // Validate inputs
    if (!gameSessionId || !chapterId) {
      throw new Error("Missing required fields: gameSessionId and chapterId");
    }

    // Check if game session exists
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
    });

    if (!gameSession) {
      throw new Error(`Game session not found for ID: ${gameSessionId}`);
    }

    // Update game session with checkpoint
    const updatedSession = await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        chapterId: chapterId,
        checkpointAt: new Date(),
        elapsedTimeSeconds: { increment: elapsedTime }, // Increment elapsed time with the new checkpoint duration
      },
      include: {
        challengeAttempts: {
          include: {
            starEvent: true,
          },
        },
      },
    });

    // Get the most recent checkpoint for this game session that doesn't have a pausedAt timestamp yet, and update its sessionDurationSeconds with the elapsedTime since the last checkpoint
    const incompleteCheckpoint = await prisma.sessionCheckpoint.findFirst({
      where: {
        gameSessionId: gameSessionId,
        pausedAt: null,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    if (incompleteCheckpoint) {
      await prisma.sessionCheckpoint.update({
        where: { id: incompleteCheckpoint.id },
        data: {
          sessionDurationSeconds: { increment: elapsedTime },
        },
      });
    }

    return updatedSession
  }

  /**
   * Create a new checkpoint for the game session
   * Records the current state and calculates time since last checkpoint
   * Only creates if recent checkpoint has both startedAt and pausedAt to prevent duplicates
   * Returns the newly created checkpoint
   */
  static async createNewCheckpoint(
    gameSessionId: string,
  ): Promise<SessionCheckpoint> {
    // Validate inputs
    if (!gameSessionId) {
      throw new Error("Missing required field: gameSessionId");
    }

    // Check if game session exists
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: { checkpoints: true },
    });

    if (!gameSession) {
      throw new Error(`Game session not found for ID: ${gameSessionId}`);
    }

    // Check the most recent checkpoint to prevent duplicate checkpoints
    if (gameSession.checkpoints.length > 0) {
      const recentCheckpoint =
        gameSession.checkpoints[gameSession.checkpoints.length - 1];

      // Only create a new checkpoint if the recent checkpoint has both startedAt and pausedAt
      if (!(recentCheckpoint.startedAt && recentCheckpoint.pausedAt)) {
        return recentCheckpoint;
      }
    }

    // Create a new checkpoint record
    const newCheckpoint = await prisma.sessionCheckpoint.create({
      data: {
        gameSessionId,
        firstChapterId: gameSession.chapterId!,
        startedAt: new Date(),
      },
    });

    return newCheckpoint;
  }

  /**
   * Pause a game session - saves state when user exits the story
   * Updates the most recent incomplete checkpoint with the pause timestamp
   * Only updates checkpoints that have startedAt but pausedAt is null
   */
  static async pauseCheckpoint(
    gameSessionId: string,
  ): Promise<SessionCheckpoint | null> {
    // Validate inputs
    if (!gameSessionId) {
      throw new Error("Missing required field: gameSessionId");
    }

    // Check if game session exists
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: { checkpoints: true },
    });

    if (!gameSession) {
      throw new Error(`Game session not found for ID: ${gameSessionId}`);
    }

    // Find the most recent checkpoint with pausedAt as null (incomplete)
    const incompleteCheckpoint = gameSession.checkpoints.find(
      (cp) => cp.pausedAt === null && cp.startedAt !== null,
    );

    if (!incompleteCheckpoint) {
      return null;
    }

    // Update the checkpoint with the pause timestamp
    const checkpoint = await prisma.sessionCheckpoint.update({
      where: { id: incompleteCheckpoint.id },
      data: {
        pausedAt: new Date(),
        lastChapterId: gameSession.chapterId!,
      },
    });

    return checkpoint;
  }

  /**
   * Submit a challenge answer and record the attempt with star rewards
   * Updates the challenge attempt, creates a star event, and updates game session stars
   * Calculates star bonuses based on correctness, hints used, and attempt number
   */
  static async submitChallengeAnswer(payload: {
    gameSessionId: string;
    challengeId: string;
    challengeType: ChallengeType;
    answerId?: string | null;
    textAnswer?: string | null;
    isCorrect: boolean;
    elapsedTime: number;
    attemptNumber: number;
    usedHints: number;
    maxAttempts?: number;
    baseStars: number;
    skipped: boolean;
    status: ChallengeStatus;
    actions: AttemptAction[];
  }): Promise<{
    attempt: ChallengeAttempt;
    starEvent: StarEvent;
    totalStars: number;
  }> {
    // Validate game session exists
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: payload.gameSessionId },
      include: {
        challengeAttempts: {
          include: {
            starEvent: true,
          },
        },
      },
    });

    if (!gameSession) {
      throw new Error(
        `Game session not found for ID: ${payload.gameSessionId}`,
      );
    }

    // Find the challenge attempt record
    const challengeAttempt = await prisma.challengeAttempt.findFirst({
      where: {
        sessionId: payload.gameSessionId,
        challengeId: payload.challengeId,
      },
    });

    if (!challengeAttempt) {
      throw new Error(
        `Challenge attempt not found for challengeId: ${payload.challengeId}`,
      );
    }

    // Update the challenge attempt with answer and result
    const updatedAttempt = await prisma.challengeAttempt.update({
      where: { id: challengeAttempt.id },
      data: {
        status: payload.status,
        answerId: payload.answerId || null,
        textAnswer: payload.textAnswer || null,
        isCorrect: payload.isCorrect,
        attemptNumber: payload.attemptNumber,
        usedHints: payload.usedHints,
        timeSpentSeconds: payload.elapsedTime,
      },
    });

    // Create all attempt actions from the payload
    // Always create new actions - accumulates all actions taken during this attempt
    if (payload.actions && payload.actions.length > 0) {
      await prisma.attemptAction.createMany({
        data: payload.actions.map((action) => ({
          attemptId: updatedAttempt.id,
          selectedAnswerId: action.selectedAnswerId || null,
          selectedAnswerText: action.selectedAnswerText || null,
          answerText: action.answerText || null,
          isCorrect: action.isCorrect !== undefined ? action.isCorrect : null,
          attemptNumberAtAction: action.attemptNumberAtAction,
        })),
      });
    }

    // Calculate star rewards based on attempt result
    let totalStars = 0;
    // let noHintBonus = 0;
    // let firstTryBonus = 0;

    // Only award stars if the attempt is correct
    // If skipped or incorrect, totalStars remains 0
    if (payload.isCorrect) {
      totalStars = payload.baseStars;

      // // No hint bonus: 50% of base stars if hints were not used
      // if (payload.usedHints === 0) {
      //   noHintBonus = Math.ceil(payload.baseStars * 0.5);
      //   totalStars += noHintBonus;
      // }

      // // First try bonus: 25% of base stars if solved on first attempt
      // if (payload.attemptNumber === 1) {
      //   firstTryBonus = Math.ceil(payload.baseStars * 0.25);
      //   totalStars += firstTryBonus;
      // }
    }

    // Create or update a star event record linked to the challenge attempt
    const starEvent = await prisma.starEvent.upsert({
      where: {
        attemptId: updatedAttempt.id,
      },
      create: {
        attemptId: updatedAttempt.id,
        challengeId: payload.challengeId,
        baseStars: payload.baseStars,
        // noHintBonus,
        // firstTryBonus,
        totalStars,
        attemptNumber: payload.attemptNumber,
        usedHints: payload.usedHints > 0,
        wasCorrect: payload.isCorrect ? true : payload.skipped ? null : false,
      },
      update: {
        baseStars: payload.baseStars,
        // noHintBonus,
        // firstTryBonus,
        totalStars,
        attemptNumber: payload.attemptNumber,
        usedHints: payload.usedHints > 0,
        wasCorrect: payload.isCorrect ? true : payload.skipped ? null : false,
      },
    });

    // Update game session with accumulated stars
    await prisma.gameSession.update({
      where: { id: payload.gameSessionId },
      data: {
        starsEarned: {
          increment: totalStars,
        },
      },
    });

    // ✓ Update child's daily activity to mark as active today
    // Fetch progress info to get childId
    const progress = await prisma.progress.findFirst({
      where: {
        gameSession: {
          id: payload.gameSessionId,
        },
      },
      include: {
        childProfile: true,
      },
    });

    if (progress?.childProfile) {
      await this.updateChildDailyActivity(progress.childProfile.childId);
    }

    // Return the results
    return {
      attempt: updatedAttempt,
      starEvent: starEvent ,
      totalStars,
    };
  }

  /**
   * Complete a story for a game session
   * Marks the story as completed, aggregates time metrics, and updates progress record
   * Automatically pauses the last checkpoint if it hasn't been paused yet
   */
  static async completeStory(
    gameSessionId: string,
    elapsedTime: number,
  ): Promise<GameSession | null> {
    // Validate input
    if (!gameSessionId) {
      throw new Error("Missing required field: gameSessionId");
    }

    // Check if game session exists
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: {
        challengeAttempts: {
          include: {
            starEvent: true,
          },
        },
        checkpoints: true,
      },
    });

    if (!gameSession) {
      throw new Error(`Game session not found for ID: ${gameSessionId}`);
    }

    const completionTime = new Date();

    // Handle the last checkpoint if it hasn't been paused
    if (gameSession.checkpoints.length > 0) {
      const lastCheckpoint =
        gameSession.checkpoints[gameSession.checkpoints.length - 1];

      // If the last checkpoint is incomplete (pausedAt is null), complete it now
      if (
        lastCheckpoint.pausedAt === null &&
        lastCheckpoint.startedAt !== null
      ) {
        await prisma.sessionCheckpoint.update({
          where: { id: lastCheckpoint.id },
          data: {
            pausedAt: completionTime,
            lastChapterId: gameSession.chapterId!,
            sessionDurationSeconds: { increment: elapsedTime },
          },
        });
      }
    }

    // Fetch updated checkpoints
    const updatedGameSession = await prisma.gameSession.findUnique({
      where: { id: gameSessionId },
      include: { checkpoints: true },
    });

    if (!updatedGameSession) {
      throw new Error(`Game session not found for ID: ${gameSessionId}`);
    }

    // Find and update the progress record to mark as completed
    const progress = await prisma.progress.findFirst({
      where: {
        gameSession: {
          id: gameSessionId,
        },
      },
    });

    if (progress) {
      // Aggregate total time from game session to progress
      await prisma.progress.update({
        where: { id: progress.id },
        data: {
          status: ProgressStatus.COMPLETED,
          completedAt: completionTime,
          totalTimeSpent: gameSession.elapsedTimeSeconds,
        },
      });
    }

    // Update game session with completion timestamp
    const completedSession = await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        endedAt: completionTime,
      },
      include: {
        progress: {
          include: {
            storytellingStory : true,
          }
        },
        challengeAttempts: {
          include: {
            starEvent: true,
          },
        },
        checkpoints: true,
      },
    });

    // update child profile total stars
    if (progress) {
      const childProfile = await prisma.childProfile.findUnique({
        where: { id: progress.childProfileId },
        include: {
          storytelling: true,
        },
      });

      if (childProfile) {
        await prisma.childProfile.update({
          where: { id: progress.childProfileId },
          data: {
            totalStars: childProfile.totalStars + gameSession.starsEarned,
          },
        });

        // if storytelling profile is active, find the story and update its status to IN_PROGRESS
        if (childProfile.storytelling?.isActive) {
          // Find the storytelling story using composite fields
          const storytellingStory = await prisma.storytellingStory.findFirst({
            where: {
              storyId: progress.storyId!,
              storytellingProfileId: childProfile.storytelling.id,
            },
          });

          // Update using the unique id field
          if (storytellingStory) {
            await prisma.storytellingStory.update({
              where: { id: storytellingStory.id },
              data: {
                status: ProgressStatus.COMPLETED,
              },
            });
          }
        }

        // ✓ Update child's daily activity to mark as active today
        await this.updateChildDailyActivity(childProfile.childId);
      }
    }

    return completedSession
  }

  /**
   * Update a child's current level
   * Called when a child reaches a new level through progression
   */
  static async updateChildLevel(
    childId: string,
    newLevel: number,
  ): Promise<ChildProfile | null> {
    // Validate inputs
    if (!childId || newLevel === undefined || newLevel === null) {
      throw new Error("Missing required fields: childId and newLevel");
    }

    // Check if child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId },
    });

    if (!childProfile) {
      return null;
    }

    // Update child's level
    const updatedChild = await prisma.childProfile.update({
      where: { id: childProfile.id },
      data: {
        currentLevel: newLevel,
      },
      include: {
        progress: {
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    starEvent: true,
                  },
                },
              },
            },
          },
        },
        badges: true,
      },
    });

    return updatedChild
  }

  /**
   * Update notification settings for a child
   * Allows enabling or disabling push notifications
   */
  static async updateNotificationSettings(
    childId: string,
    activateNotifications: boolean,
  ): Promise<ChildProfile | null> {
    // Validate inputs
    if (!childId || activateNotifications === undefined || activateNotifications === null) {
      throw new Error("Invalid childId or notification setting");
    }

    // Check if child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { id : childId },
    });

    if (!childProfile) {
      throw new Error(`Child profile not found for childId: ${childId}`);
    }

    // Update child's notification settings
    const updatedChild = await prisma.childProfile.update({
      where: { id: childProfile.id },
      data: {
        activateNotifications,
      },
    });

    return updatedChild 
  }

  /**
   * Toggle weekly reports for a child
   * Allows enabling or disabling weekly analytics reports
   */
  static async toggleWeeklyReports(
    childId: string,
    activateWeeklyReports: boolean,
  ): Promise<ChildProfile | null> {
    // Validate inputs
    if (!childId || activateWeeklyReports === undefined || activateWeeklyReports === null) {
      throw new Error("Invalid childId or weekly reports setting");
    }

    // Check if child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childId },
    });

    if (!childProfile) {
      throw new Error(`Child profile not found for childId: ${childId}`);
    }

    // Update child's weekly reports settings
    const updatedChild = await prisma.childProfile.update({
      where: { id: childProfile.id },
      data: {
        activateWeeklyReports,
      },
    });

    return updatedChild;
  }

  /**
   * Toggle storytelling activation for a child
   * Enables or disables AI-generated storytelling feature
   */
  static async toggleStorytelling(
    childId: string,
    isActive: boolean,
  ): Promise<ChildProfile | null> {
    // Validate inputs
    if (!childId || isActive === undefined || isActive === null) {
      throw new Error("Invalid childId or storytelling setting");
    }

    // Check if child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { id : childId },
      include: {
        storytelling: {
          include: {
            stories: true,
          },
        },
      },
    });

    if (!childProfile) {
      throw new Error(`Child profile not found for childId: ${childId}`);
    }

    // Update child's storytelling settings
    const updatedChild = await prisma.childProfile.update({
      where: { id: childProfile.id },
      data: {
        storytelling: {
          update: {
            isActive,
          },
        },
      },
      include: {
        storytelling: {
          include: {
            stories: true,
          },
        },
      },
    });

    return updatedChild;
  }

  /**
   * Update child's general settings (name, age group, favorite themes)
   * Called when parent updates child profile in settings modal
   */
  static async updateChildGeneralSettings(
    childId: string,
    name: string,
    ageGroupId: string,
    favoriteThemes: string[],
    allocatedRoadmaps: string[],
    sessionsPerWeek: number,
    ageGroup: string,
  ): Promise<ChildProfile | null> {
    // Validate inputs
    if (!childId || !name || !ageGroupId) {
      console.error(
        "Invalid inputs for updateChildGeneralSettings",
        { childId, name, ageGroupId },
      );
      throw new Error(
        "Missing required fields: childId, name, and ageGroupId",
      );
    }

    // Check if child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId },
    });

    if (!childProfile) {
      console.error("Child profile not found", { childId });
      return null;
    }

    // Merge allocated roadmaps: add new ones, ignore duplicates
    const existingRoadmaps = childProfile.allocatedRoadmaps || [];
    const mergedRoadmaps = Array.from(new Set([...existingRoadmaps, ...allocatedRoadmaps]));

    // Update child's general settings
    const updatedChild = await prisma.childProfile.update({
      where: { id: childProfile.id },
      data: {
        name,
        ageGroupId,
        favoriteThemes,
        allocatedRoadmaps: mergedRoadmaps,
        sessionsPerWeek,
        ageGroupName: ageGroup,
      },
    });

    return updatedChild;
  }

  /**
   * Delete a child profile permanently
   * Removes the child and all associated data including:
   * - Child profile record
   * - Associated progress records
   * - Game sessions and challenge attempts
   * - Checkpoints and badges
   * - Daily activity
   * - All related data cascading through relationships
   */
  static async deleteChild(childId: string): Promise<boolean> {
    // Validate input
    if (!childId) {
      throw new Error("Missing required field: childId");
    }

    try {
      // Find child profile first
      const childProfile = await prisma.childProfile.findUnique({
        where: { id : childId },
      });

      if (!childProfile) {
        console.error("Child profile not found", { childId });
        return false;
      }

      // Delete child profile (cascade deletes all related records due to Prisma schema relations)
      await prisma.childProfile.delete({
        where: { id: childProfile.id },
      });

      console.log("Child profile deleted successfully", {
        childId,
        profileId: childProfile.id,
      });

      return true;
    } catch (error) {
      console.error("Error deleting child profile", { childId, error });
      throw error;
    }
  }

  /**
   * Assign a badge to a child
   * Called when a child earns a new badge through level progression
   */
  static async assignBadgeToChild(
    childId: string,
    badgeId: string,
  ): Promise<ChildProfile | null> {
    // Validate inputs
    if (!childId || !badgeId) {
      throw new Error("Missing required fields: childId and badgeId");
    }

    // Check if child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId },
    });

    if (!childProfile) {
      return null;
    }

    // Check if badge is already assigned to avoid duplicates
    const existingBadge = await prisma.childBadge.findFirst({
      where: {
        childProfileId: childProfile.id,
        badgeId,
      },
    });

    // If badge not already assigned, create it
    if (!existingBadge) {
      await prisma.childBadge.create({
        data: {
          childProfileId: childProfile.id,
          badgeId,
        },
      });
    }

    // Fetch and return updated child profile with all badges
    const updatedChild = await prisma.childProfile.findUnique({
      where: { id: childProfile.id },
      include: {
        progress: {
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    starEvent: true,
                  },
                },
              },
            },
          },
        },
        badges: true,
      },
    });

    return updatedChild
  }

  /**
   * Allocate a roadmap to a child
   * Adds roadmapId to child's allocatedRoadmaps array
   */
  static async allocateRoadmapToChild(
    childId: string,
    roadmapId: string,
  ): Promise<ChildProfile | null> {
    // Validate inputs
    if (!childId || !roadmapId) {
      throw new Error("Missing required fields: childId and roadmapId");
    }

    // Check if child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId },
    });

    if (!childProfile) {
      return null;
    }

    // Check if roadmap is already allocated
    const allocatedRoadmaps = childProfile.allocatedRoadmaps || [];
    if (!allocatedRoadmaps.includes(roadmapId)) {
      // Add roadmap to allocatedRoadmaps
      await prisma.childProfile.update({
        where: { id: childProfile.id },
        data: {
          allocatedRoadmaps: [...allocatedRoadmaps, roadmapId],
        },
      });
    }

    // Fetch and return updated child profile
    const updatedChild = await prisma.childProfile.findUnique({
      where: { id: childProfile.id },
      include: {
        progress: {
          include: {
            gameSession: {
              include: {
                challengeAttempts: {
                  include: {
                    starEvent: true,
                  },
                },
              },
            },
          },
        },
        badges: true,
      },
    });

    return updatedChild
  }

  /**
   * Get aggregated statistics for children
   * Calculates:
   * - totalChildren: Total count of all child profiles
   * - activeChildren: Children with game session activity (checkpoints) in the last 7 days
   * - totalStoriesCompleted: Count of completed stories (Progress with status COMPLETED)
   * - totalChallengesSolved: Count of solved challenges (ChallengeAttempts with isCorrect = true)
   */
  static async getChildrenStats(): Promise<{
    totalChildren: number;
    activeChildren: number;
    totalStoriesCompleted: number;
    totalChallengesSolved: number;
  }> {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Use Promise.all for parallel queries
    const [
      totalChildren,
      activeChildren,
      totalStoriesCompleted,
      totalChallengesSolved,
    ] = await Promise.all([
      // Count total children
      prisma.childProfile.count(),

      // Count children with game session checkpoint activity in last 7 days
      // A child is active if they have a checkpoint (pause/resume) within the last 7 days
      // This indicates recent engagement with a story
      prisma.childProfile.count({
        where: {
          progress: {
            some: {
              gameSession: {
                checkpoints: {
                  some: {
                    startedAt: {
                      gte: sevenDaysAgo,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      // Count completed stories
      prisma.progress.count({
        where: {
          status: "COMPLETED",
        },
      }),

      // Count solved challenges (with correct answers)
      prisma.challengeAttempt.count({
        where: {
          isCorrect: true,
        },
      }),
    ]);

    return {
      totalChildren,
      activeChildren,
      totalStoriesCompleted,
      totalChallengesSolved,
    };
  }

  /**
   * Save storytelling profile for a child
   */
  static async saveStorytellingProfile(payload: {
    childProfileId: string;
    childName: string;
    childLanguage: string;
    favoriteThemes: string[];
    learningObjectives: string[];
  }): Promise<any> {
    const storytellingProfile = await prisma.storytellingProfile.upsert({
      where: { childProfileId: payload.childProfileId },
      update: {
        childName: payload.childName,
        childLanguage: payload.childLanguage,
        favoriteThemes: payload.favoriteThemes,
        learningObjectives: payload.learningObjectives,
      },
      create: {
        childProfileId: payload.childProfileId,
        childName: payload.childName,
        childLanguage: payload.childLanguage,
        favoriteThemes: payload.favoriteThemes,
        learningObjectives: payload.learningObjectives,
        onboardingCompleted: true,
      },
    });

    return storytellingProfile;
  }

  /**
   * Update storytelling story for a child
   * Called after story is generated and saved to Content Service
   * Upserts a StorytellingStory record linking child to generated story
   */
  static async updateStorytellingStory(
    childProfileId: string,
    story: Story,
  ): Promise<any> {
    // Get the storytelling profile for the child
    const storytellingProfile = await prisma.storytellingProfile.findUnique({
      where: { childProfileId },
    });

    if (!storytellingProfile) {
      throw new Error(
        `Storytelling profile not found for child ${childProfileId}`,
      );
    }

    // Check if StorytellingStory already exists for this story
    const existingStory = await prisma.storytellingStory.findFirst({
      where: {
        storytellingProfileId: storytellingProfile.id,
        storyId: story.id,
      },
    });

    let storytellingStory;
    if (existingStory) {
      // Update existing record
      storytellingStory = await prisma.storytellingStory.update({
        where: { id: existingStory.id },
        data: {
          title: story.title,
          storyId: story.id,
          generatedStoryId : story.generatedStoryId
        },
      });
    } else {
      // Create new StorytellingStory record
      storytellingStory = await prisma.storytellingStory.create({
        data: {
          storytellingProfileId: storytellingProfile.id,
          storyId: story.id,
          title: story.title,
          generatedStoryId : story.generatedStoryId,
          status: ProgressStatus.NOT_STARTED, // New story starts as NOT_STARTED
        },
      });
    }

    // Return updated child profile with all storytelling data
    const updatedChild = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: {
        storytelling: {
          include: {
            stories: true,
          },
        },
        progress: true,
        badges: true,
      },
    });

    return updatedChild;
  }
}
