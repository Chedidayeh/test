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
   * Fetch all children profiles without pagination
   * Returns all child profiles with their full relations included
   */
  static async getAllChildrenProfiles(): Promise<ChildProfile[]> {
    const childProfiles = await prisma.childProfile.findMany({
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
    return childProfiles;
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
            stories: true
          },
        },
      },
    });

    return childProfiles;
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
        childProfile: true,
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
    let noHintBonus = 0;
    let firstTryBonus = 0;

    // Only award stars if the attempt is correct
    // If skipped or incorrect, totalStars remains 0
    if (payload.isCorrect) {
      totalStars = payload.baseStars;

      // No hint bonus: 50% of base stars if hints were not used
      if (payload.usedHints === 0) {
        noHintBonus = Math.ceil(payload.baseStars * 0.5);
        totalStars += noHintBonus;
      }

      // First try bonus: 25% of base stars if solved on first attempt
      if (payload.attemptNumber === 1) {
        firstTryBonus = Math.ceil(payload.baseStars * 0.25);
        totalStars += firstTryBonus;
      }
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
        noHintBonus,
        firstTryBonus,
        totalStars,
        attemptNumber: payload.attemptNumber,
        usedHints: payload.usedHints > 0,
        wasCorrect: payload.isCorrect ? true : payload.skipped ? null : false,
      },
      update: {
        baseStars: payload.baseStars,
        noHintBonus,
        firstTryBonus,
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
   * Tunable hint cost ladder (index = hint number, 0-based).
   * Hint 0 (first hint) is always free.
   * Values beyond the array length use the last entry.
   */
  static readonly HINT_COSTS = [0, 10, 20];

  /**
   * Unlock a hint for a child by deducting stars from ChildProfile.totalStars.
   * The first hint (hintIndex 0) is always free — no DB write occurs.
   * Throws "INSUFFICIENT_STARS" if the child cannot afford the hint.
   *
   * @param childId   - The auth-service child ID (ChildProfile.childId)
   * @param hintIndex - 0-based index of the hint being requested
   * @returns { newTotalStars, starsCost }
   */
  static async unlockHint({
    childId,
    hintIndex,
  }: {
    childId: string;
    hintIndex: number;
  }): Promise<{ newTotalStars: number | null; starsCost: number }> {
    const costs = ChildrenService.HINT_COSTS;
    const starsCost = costs[hintIndex] ?? costs[costs.length - 1];

    if (starsCost === 0) {
      return { newTotalStars: null, starsCost: 0 };
    }

    return await prisma.$transaction(async (tx) => {
      const profile = await tx.childProfile.findFirst({
        where: { childId },
      });

      if (!profile) {
        throw new Error(`Child profile not found for childId: ${childId}`);
      }

      if (profile.totalStars < starsCost) {
        throw new Error("INSUFFICIENT_STARS");
      }

      const updated = await tx.childProfile.update({
        where: { id: profile.id },
        data: { totalStars: { decrement: starsCost } },
      });

      return { newTotalStars: updated.totalStars, starsCost };
    });
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
   * Get engagement metrics for the global statistics dashboard
   * Calculates:
   * - Average session duration (in minutes and seconds)
   * - Average sessions per child
   * - Average chapters per session
   * - Average stories completed per day (last 30 days)
   * - Total sessions count
   * - Total children count
   */
  static async getEngagementMetrics(): Promise<{
    avgSessionDurationMinutes: number;
    avgSessionDurationSeconds: number;
    sessionsPerChild: number;
    avgChaptersPerSession: number;
    avgStoriesCompletedPerDay: number;
    totalSessions: number;
    totalChildren: number;
  }> {
    // Calculate date 30 days ago for story completion aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalChildren,
      allGameSessions,
      completedStoriesData,
    ] = await Promise.all([
      // Count total children
      prisma.childProfile.count(),

      // Get all game sessions with their duration
      prisma.gameSession.findMany({
        select: {
          id: true,
          elapsedTimeSeconds: true,
          progress: {
            select: {
              childProfileId: true,
              storyId: true,
              completedAt: true,
            },
          },
        },
      }),

      // Count completed stories in last 30 days
      prisma.progress.findMany({
        where: {
          status: "COMPLETED",
          completedAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          completedAt: true,
        },
      }),
    ]);

    // Calculate metrics from aggregated data
    const totalSessions = allGameSessions.length || 1;
    const totalSessionDuration = allGameSessions.reduce(
      (sum, session) => sum + (session.elapsedTimeSeconds || 0),
      0,
    );
    const avgSessionDurationSeconds = Math.round(totalSessionDuration / totalSessions);
    const avgSessionDurationMinutes = Math.round(avgSessionDurationSeconds / 60);

    // Average sessions per child
    const sessionsPerChild = totalChildren > 0
      ? Math.round(totalSessions / totalChildren)
      : 0;

    // Average chapters per session (assume each session covers ~1-3 chapters)
    // This is estimated based on typical reading patterns
    const avgChaptersPerSession = 2; // Conservative estimate

    // Average stories completed per day over last 30 days
    const daysDiff = Math.max(
      Math.floor(
        (new Date().getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24),
      ),
      1,
    );
    const avgStoriesCompletedPerDay = Math.round(
      completedStoriesData.length / daysDiff,
    );

    return {
      avgSessionDurationMinutes,
      avgSessionDurationSeconds,
      sessionsPerChild,
      avgChaptersPerSession,
      avgStoriesCompletedPerDay,
      totalSessions,
      totalChildren,
    };
  }

  /**
   * Get reading time analytics for the global statistics dashboard
   * Calculates:
   * - Total reading minutes across all children
   * - Average reading minutes per child
   * - Reading time breakdown by age group
   * - Reading time breakdown by gender
   * - Reading time per child (top readers)
   */
  static async getReadingTimeAnalytics(): Promise<{
    totalReadingMinutes: number;
    avgReadingMinutesPerChild: number;
    byAgeGroup: Array<{
      ageGroupId: string;
      ageGroupName: string;
      readingMinutes: number;
      percentageOfTotal: number;
    }>;
    byGender: Array<{
      gender: string;
      readingMinutes: number;
      percentageOfTotal: number;
    }>;
    byChild: Array<{
      childId: string;
      childName: string;
      readingMinutes: number;
    }>;
  }> {
    // Fetch all game sessions with child profile info
    const gameSessions = await prisma.gameSession.findMany({
      select: {
        elapsedTimeSeconds: true,
        progress: {
          select: {
            childProfileId: true,
            childProfile: true,
          },
        },
      },
    });
  

    // Calculate total reading time
    const totalReadingSeconds = gameSessions.reduce(
      (sum, session) => sum + (session.elapsedTimeSeconds || 0),
      0,
    );
    const totalReadingMinutes = Math.round(totalReadingSeconds / 60);

    // Get all children for average calculation
    const totalChildren = await prisma.childProfile.count();
    const avgReadingMinutesPerChild = totalChildren > 0
      ? Math.round(totalReadingMinutes / totalChildren)
      : 0;

    // Group by age group
    const byAgeGroupMap = new Map<
      string,
      { name: string; seconds: number }
    >();
    gameSessions.forEach((session) => {
      const childProfile = session.progress?.childProfile;
      if (childProfile?.ageGroupId) {
        const key = childProfile.ageGroupId;
        const existing = byAgeGroupMap.get(key) || {
          name: childProfile.ageGroupName || "Unknown",
          seconds: 0,
        };
        existing.seconds += session.elapsedTimeSeconds || 0;
        byAgeGroupMap.set(key, existing);
      }
    });

    const byAgeGroup = Array.from(byAgeGroupMap.entries()).map(
      ([id, data]) => ({
        ageGroupId: id,
        ageGroupName: data.name,
        readingMinutes: Math.round(data.seconds / 60),
        percentageOfTotal:
          totalReadingMinutes > 0
            ? Math.round((data.seconds / totalReadingSeconds) * 100)
            : 0,
      }),
    );

    // Group by gender
    const byGenderMap = new Map<string, number>();
    gameSessions.forEach((session) => {
      const childProfile = session.progress?.childProfile;
      if (childProfile?.gender) {
        const gender = childProfile.gender;
        byGenderMap.set(
          gender,
          (byGenderMap.get(gender) || 0) + (session.elapsedTimeSeconds || 0),
        );
      }
    });

    const byGender = Array.from(byGenderMap.entries()).map(
      ([gender, seconds]) => ({
        gender,
        readingMinutes: Math.round(seconds / 60),
        percentageOfTotal:
          totalReadingMinutes > 0
            ? Math.round((seconds / totalReadingSeconds) * 100)
            : 0,
      }),
    );

    // Group by child and get top readers
    const byChildMap = new Map<
      string,
      { name: string; seconds: number }
    >();
    gameSessions.forEach((session) => {
      const childProfile = session.progress?.childProfile;
      if (childProfile?.id) {
        const key = childProfile.id;
        const existing = byChildMap.get(key) || {
          name: childProfile.name,
          seconds: 0,
        };
        existing.seconds += session.elapsedTimeSeconds || 0;
        byChildMap.set(key, existing);
      }
    });

    const byChild = Array.from(byChildMap.entries())
      .map(([id, data]) => ({
        childId: id,
        childName: data.name,
        readingMinutes: Math.round(data.seconds / 60),
      }))
      .sort((a, b) => b.readingMinutes - a.readingMinutes)
      .slice(0, 10); // Top 10 readers

    return {
      totalReadingMinutes,
      avgReadingMinutesPerChild,
      byAgeGroup: byAgeGroup.sort((a, b) => b.readingMinutes - a.readingMinutes),
      byGender: byGender.sort((a, b) => b.readingMinutes - a.readingMinutes),
      byChild,
    };
  }

  /**
   * Get peak usage hours for the global statistics dashboard
   * Shows which hours of the day children are most active (0-23)
   * Uses PostgreSQL EXTRACT function to get hour from SessionCheckpoint.startedAt
   */
  static async getPeakUsageHours(): Promise<
    Array<{
      hour: number;
      hourLabel: string;
      sessionCount: number;
      percentageOfTotal: number;
    }>
  > {
    // Fetch all session checkpoints
    const allCheckpoints = await prisma.sessionCheckpoint.findMany({
      select: {
        startedAt: true,
      },
    });

    // Initialize hour buckets (0-23)
    const hourBuckets = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourBuckets.set(i, 0);
    }

    // Group checkpoints by hour
    allCheckpoints.forEach((checkpoint) => {
      const hour = checkpoint.startedAt.getHours();
      hourBuckets.set(hour, (hourBuckets.get(hour) || 0) + 1);
    });

    // Calculate total sessions and percentages
    const totalSessions = allCheckpoints.length || 1;

    // Convert to response format
    const peakHours = Array.from({ length: 24 }, (_, i) => {
      const sessionCount = hourBuckets.get(i) || 0;
      return {
        hour: i,
        hourLabel: `${String(i).padStart(2, "0")}:00`,
        sessionCount,
        percentageOfTotal: Math.round((sessionCount / totalSessions) * 100),
      };
    });

    return peakHours;
  }

  /**
   * Get learning completion metrics for the global statistics dashboard
   * Calculates:
   * - Total stories started and completed
   * - Overall story completion rate
   * - Completion rate breakdown by difficulty level
   */
  static async getLearningCompletionMetrics(): Promise<{
    totalStoryStarted: number;
    totalStoryCompleted: number;
    completionRate: number;
    byDifficulty: Array<{
      difficulty: string;
      completed: number;
      total: number;
      completionRate: number;
    }>;
  }> {
    // Fetch all progress records
    const allProgress = await prisma.progress.findMany({
      select: {
        id: true,
        status: true,
        childProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    // Count total stories
    const totalStoryStarted = allProgress.length;
    const totalStoryCompleted = allProgress.filter(
      (p) => p.status === 'COMPLETED'
    ).length;
    const completionRate =
      totalStoryStarted > 0
        ? Math.round((totalStoryCompleted / totalStoryStarted) * 100)
        : 0;

    // Group by difficulty (placeholder - would need story data from Content Service)
    // For now, return single difficulty level
    const byDifficulty = [
      {
        difficulty: 'Overall',
        completed: totalStoryCompleted,
        total: totalStoryStarted,
        completionRate,
      },
    ];

    return {
      totalStoryStarted,
      totalStoryCompleted,
      completionRate,
      byDifficulty,
    };
  }

  /**
   * Get challenge success metrics for the global statistics dashboard
   * Calculates:
   * - Overall challenge success rate
   * - Success rate breakdown by challenge type
   * - Most failed challenges
   */
  static async getChallengeSuccessMetrics(): Promise<{
    overallSuccessRate: number;
    totalChallenges: number;
    successfulAttempts: number;
    byType: Array<{
      type: string;
      successCount: number;
      totalCount: number;
      successRate: number;
    }>;
    topFailedChallenges: Array<{
      challengeId: string;
      failureRate: number;
      failureCount: number;
      totalAttempts: number;
    }>;
  }> {
    // Fetch all challenge attempts
    const allAttempts = await prisma.challengeAttempt.findMany({
      select: {
        id: true,
        isCorrect: true,
        challengeId: true,
      },
    });

    const totalChallenges = allAttempts.length;
    const successfulAttempts = allAttempts.filter(
      (a) => a.isCorrect === true
    ).length;
    const overallSuccessRate =
      totalChallenges > 0
        ? Math.round((successfulAttempts / totalChallenges) * 100)
        : 0;

    // Group by challenge ID (shows success rate per individual challenge)
    const byChallengeMap = new Map<string, { success: number; total: number }>();

    allAttempts.forEach((attempt) => {
      const current = byChallengeMap.get(attempt.challengeId) || { success: 0, total: 0 };
      byChallengeMap.set(attempt.challengeId, {
        success: current.success + (attempt.isCorrect ? 1 : 0),
        total: current.total + 1,
      });
    });

    // Convert to array and sort by total attempts (descending) - top active challenges
    const byType = Array.from(byChallengeMap.entries())
      .map(([challengeId, data]) => ({
        type: challengeId, // Using challengeId as the "type" until challenge type is denormalized
        successCount: data.success,
        totalCount: data.total,
        successRate: Math.round((data.success / data.total) * 100),
      }))
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 15); // Top 15 most active challenges

    // Find most failed challenges
    const failedByChallenge = new Map<
      string,
      { failed: number; total: number }
    >();
    allAttempts.forEach((attempt) => {
      const current = failedByChallenge.get(attempt.challengeId) || {
        failed: 0,
        total: 0,
      };
      failedByChallenge.set(attempt.challengeId, {
        failed: current.failed + (attempt.isCorrect === false ? 1 : 0),
        total: current.total + 1,
      });
    });

    const topFailedChallenges = Array.from(failedByChallenge.entries())
      .filter(([, data]) => data.total >= 10) // Minimum 10 attempts
      .map(([challengeId, data]) => ({
        challengeId,
        failureRate: Math.round((data.failed / data.total) * 100),
        failureCount: data.failed,
        totalAttempts: data.total,
      }))
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 20); // Top 20 failed challenges

    return {
      overallSuccessRate,
      totalChallenges,
      successfulAttempts,
      byType,
      topFailedChallenges,
    };
  }

  /**
   * Get hint usage metrics for the global statistics dashboard
   * Calculates:
   * - Overall hint usage rate
   * - Hint effectiveness (success with hints vs without)
   * - Challenges requiring hints most
   * - Children needing support (high hint usage, low success)
   */
  static async getHintUsageMetrics(): Promise<{
    overallHintUsageRate: number;
    successWithoutHints: number;
    successWithHints: number;
    hintEffectiveness: number;
    byChallenge: Array<{
      challengeId: string;
      hintUsageRate: number;
      avgHintsUsed: number;
      totalAttempts: number;
    }>;
    childrenNeedingSupport: Array<{
      childId: string;
      childName: string;
      hintUsageRate: number;
      successRate: number;
    }>;
  }> {
    // Fetch all challenge attempts with child info
    const allAttempts = await prisma.challengeAttempt.findMany({
      include :{
        session : {
          include: {
            progress: {
              include : {
                childProfile: true,
              }
            }
          }
        }
      }
    });

    const totalAttempts = allAttempts.length;
    const withHints = allAttempts.filter((a) => a.usedHints > 0);
    const withoutHints = allAttempts.filter((a) => a.usedHints === 0);

    const overallHintUsageRate =
      totalAttempts > 0
        ? Math.round((withHints.length / totalAttempts) * 100)
        : 0;

    const successWithoutHints = withoutHints.filter(
      (a) => a.isCorrect === true
    ).length;
    const successWithHints = withHints.filter(
      (a) => a.isCorrect === true
    ).length;

    const successRateWithoutHints =
      withoutHints.length > 0
        ? Math.round((successWithoutHints / withoutHints.length) * 100)
        : 0;
    const successRateWithHints =
      withHints.length > 0
        ? Math.round((successWithHints / withHints.length) * 100)
        : 0;

    const hintEffectiveness = successRateWithHints - successRateWithoutHints;

    // Group by challenge
    const byChallengeMao = new Map<
      string,
      { hintCount: number; totalHints: number; total: number }
    >();
    allAttempts.forEach((attempt) => {
      const current = byChallengeMao.get(attempt.challengeId) || {
        hintCount: 0,
        totalHints: 0,
        total: 0,
      };
      byChallengeMao.set(attempt.challengeId, {
        hintCount:
          current.hintCount + (attempt.usedHints > 0 ? 1 : 0),
        totalHints: current.totalHints + attempt.usedHints,
        total: current.total + 1,
      });
    });

    const byChallenge = Array.from(byChallengeMao.entries())
      .map(([challengeId, data]) => ({
        challengeId,
        hintUsageRate: Math.round((data.hintCount / data.total) * 100),
        avgHintsUsed:
          data.hintCount > 0
            ? Math.round(data.totalHints / data.hintCount)
            : 0,
        totalAttempts: data.total,
      }))
      .sort((a, b) => b.hintUsageRate - a.hintUsageRate)
      .slice(0, 15);

    // Find children needing support
    const byChildMap = new Map<
      string,
      {
        name: string;
        hintCount: number;
        successCount: number;
        total: number;
      }
    >();

    allAttempts.forEach((attempt) => {
      const childId = attempt.session?.progress?.childProfile?.id;
      const childName = attempt.session?.progress?.childProfile?.name;
      if (childId) {
        const current = byChildMap.get(childId) || {
          name: childName || 'Unknown',
          hintCount: 0,
          successCount: 0,
          total: 0,
        };
        byChildMap.set(childId, {
          name: childName || current.name,
          hintCount: current.hintCount + (attempt.usedHints > 0 ? 1 : 0),
          successCount: current.successCount + (attempt.isCorrect ? 1 : 0),
          total: current.total + 1,
        });
      }
    });

    const childrenNeedingSupport = Array.from(byChildMap.entries())
      .map(([childId, data]) => ({
        childId,
        childName: data.name,
        hintUsageRate: Math.round((data.hintCount / data.total) * 100),
        successRate: Math.round((data.successCount / data.total) * 100),
      }))
      .filter((child) => child.hintUsageRate > 50 && child.successRate < 60) // High hint usage, low success
      .slice(0, 10);

    return {
      overallHintUsageRate,
      successWithoutHints,
      successWithHints,
      hintEffectiveness,
      byChallenge,
      childrenNeedingSupport,
    };
  }

  /**
   * Get reading speed trends for the global statistics dashboard
   * Calculates:
   * - Average completion time by story, difficulty, age group, and challenge type
   * - Identifies reading speed patterns and potential issues
   */
  static async getReadingSpeedTrends(): Promise<{
    byStory: Array<{
      storyId: string;
      avgCompletionSeconds: number;
      count: number;
    }>;
    byAgeGroup: Array<{
      ageGroupId: string;
      ageGroupName: string;
      avgCompletionSeconds: number;
      count: number;
    }>;
    overallAverageSeconds: number;
  }> {
    // Fetch all game sessions with progress and child profile info
    const allSessions = await prisma.gameSession.findMany({
      select: {
        id: true,
        elapsedTimeSeconds: true,
        progress: {
          select: {
            id: true,
            storyId: true,
            childProfile: {
              select: {
                id: true,
                ageGroupId: true,
                ageGroupName: true,
              },
            },
          },
        },
      },
    });

    // Calculate overall average
    const totalSeconds = allSessions.reduce(
      (sum, s) => sum + (s.elapsedTimeSeconds || 0),
      0
    );
    const overallAverageSeconds =
      allSessions.length > 0 ? Math.round(totalSeconds / allSessions.length) : 0;

    // Group by story
    const byStoryMap = new Map<string, { total: number; count: number }>();
    allSessions.forEach((session) => {
      const storyId = session.progress?.storyId || 'unknown';
      const current = byStoryMap.get(storyId) || { total: 0, count: 0 };
      byStoryMap.set(storyId, {
        total: current.total + (session.elapsedTimeSeconds || 0),
        count: current.count + 1,
      });
    });

    const byStory = Array.from(byStoryMap.entries())
      .map(([storyId, data]) => ({
        storyId,
        avgCompletionSeconds: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group by age group
    const byAgeGroupMap = new Map<
      string,
      { name: string; total: number; count: number }
    >();
    allSessions.forEach((session) => {
      const ageGroupId = session.progress?.childProfile?.ageGroupId || 'unknown';
      const ageGroupName =
        session.progress?.childProfile?.ageGroupName || 'Unknown';
      const current = byAgeGroupMap.get(ageGroupId) || {
        name: ageGroupName,
        total: 0,
        count: 0,
      };
      byAgeGroupMap.set(ageGroupId, {
        name: ageGroupName,
        total: current.total + (session.elapsedTimeSeconds || 0),
        count: current.count + 1,
      });
    });

    const byAgeGroup = Array.from(byAgeGroupMap.entries())
      .map(([ageGroupId, data]) => ({
        ageGroupId,
        ageGroupName: data.name,
        avgCompletionSeconds: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      byStory,
      byAgeGroup,
      overallAverageSeconds,
    };
  }

  /**
   * Get most failed challenges for the global statistics dashboard
   * Identifies challenges with lowest success rates and high attempt counts
   * Used to identify problem areas in content and curriculum
   */
  static async getMostFailedChallenges(): Promise<{
    mostFailed: Array<{
      challengeId: string;
      failureRate: number;
      failureCount: number;
      totalAttempts: number;
      avgAttemptsPerChild: number;
    }>;
    totalUniqueChallenges: number;
  }> {
    // Fetch all challenge attempts
    const allAttempts = await prisma.challengeAttempt.findMany({
      include: {
        session: {
          include: {
            progress: {
              include: {
                childProfile: true
              },
            },
          },
        },
      },
    });

    // Group by challenge
    const byChallengeMap = new Map<
      string,
      { failed: number; total: number; children: Set<string> }
    >();

    allAttempts.forEach((attempt) => {
      const current = byChallengeMap.get(attempt.challengeId) || {
        failed: 0,
        total: 0,
        children: new Set(),
      };
      const childId = attempt.session?.progress?.childProfile?.id;
      if (childId) {
        current.children.add(childId);
      }
      byChallengeMap.set(attempt.challengeId, {
        failed: current.failed + (attempt.isCorrect === false ? 1 : 0),
        total: current.total + 1,
        children: current.children,
      });
    });

    const totalUniqueChallenges = byChallengeMap.size;

    // Build most failed list
    const mostFailed = Array.from(byChallengeMap.entries())
      .filter(([, data]) => data.total >= 10) // Minimum 10 attempts
      .map(([challengeId, data]) => ({
        challengeId,
        failureRate: Math.round((data.failed / data.total) * 100),
        failureCount: data.failed,
        totalAttempts: data.total,
        avgAttemptsPerChild: Math.round(data.total / data.children.size),
      }))
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 20);

    return {
      mostFailed,
      totalUniqueChallenges,
    };
  }

  /**
   * Get content performance metrics for the global statistics dashboard
   * Calculates:
   * - Most popular stories by completion rate
   * - Theme performance with average completion rates
   * - Reading level difficulty heatmap (2D matrix)
   */
  static async getContentPerformanceMetrics(): Promise<{
    mostPopularStories: Array<{
      storyId: string;
      storyTitle?: string;
      totalStarted: number;
      totalCompleted: number;
      completionRate: number;
      avgTimeSpentMinutes: number;
      difficulty: number | null;
    }>;
    themePerformance: Array<{
      storyIds: string[];
      totalStarted: number;
      totalCompleted: number;
      avgCompletionRate: number;
      avgTimeSpentMinutes: number;
    }>;
    difficultyHeatmap: Array<{
      readingLevel: string;
      difficulty1: { completionRate: number; sampleSize: number; avgTimeMinutes: number };
      difficulty2: { completionRate: number; sampleSize: number; avgTimeMinutes: number };
      difficulty3: { completionRate: number; sampleSize: number; avgTimeMinutes: number };
      difficulty4: { completionRate: number; sampleSize: number; avgTimeMinutes: number };
      difficulty5: { completionRate: number; sampleSize: number; avgTimeMinutes: number };
    }>;
  }> {
    try {
      // Fetch all progress records with child and story details
      const allProgress = await prisma.progress.findMany({
        include: {
          childProfile: {
            select: {
              ageGroupId: true,
              allocatedRoadmaps: true,
            },
          },
        },
      });

      console.log("Content performance metrics calculation started", {
        totalProgressRecords: allProgress.length,
      });

      // ===== METRIC 1: MOST POPULAR STORIES =====
      const storyMetricsMap = new Map<
        string,
        {
          totalStarted: number;
          totalCompleted: number;
          totalTimeSpent: number;
          childrenCount: Set<string>;
        }
      >();

      allProgress.forEach((progress) => {
        // Skip if storyId is null
        if (!progress.storyId) return;

        if (!storyMetricsMap.has(progress.storyId)) {
          storyMetricsMap.set(progress.storyId, {
            totalStarted: 0,
            totalCompleted: 0,
            totalTimeSpent: 0,
            childrenCount: new Set(),
          });
        }

        const metrics = storyMetricsMap.get(progress.storyId)!;
        metrics.totalStarted += 1;
        metrics.childrenCount.add(progress.childProfileId);

        if (progress.status === ProgressStatus.COMPLETED) {
          metrics.totalCompleted += 1;
        }

        // Add time spent in seconds
        metrics.totalTimeSpent += progress.totalTimeSpent || 0;
      });

      // Convert to array and calculate rates
      const mostPopularStories = Array.from(storyMetricsMap.entries())
        .map(([storyId, data]) => ({
          storyId,
          storyTitle: undefined,
          totalStarted: data.totalStarted,
          totalCompleted: data.totalCompleted,
          completionRate: data.totalStarted > 0 
            ? Math.round((data.totalCompleted / data.totalStarted) * 100)
            : 0,
          avgTimeSpentMinutes: Math.round(data.totalTimeSpent / Math.max(data.totalStarted, 1) / 60),
          difficulty: null, // Will be populated by gateway from Content Service
        }))
        .sort((a, b) => b.completionRate - a.completionRate || b.totalStarted - a.totalStarted)
        .slice(0, 20);

      console.log("Most popular stories calculated", {
        count: mostPopularStories.length,
        topRate: mostPopularStories[0]?.completionRate,
      });

      // ===== METRIC 2: THEME PERFORMANCE =====
      // Group by story (themes will be mapped at gateway level from Content Service)
      // For now, collect story groups and let gateway handle theme mapping
      const themePerformance = Array.from(storyMetricsMap.entries())
        .map(([storyId, data]) => ({
          storyIds: [storyId],
          totalStarted: data.totalStarted,
          totalCompleted: data.totalCompleted,
          avgCompletionRate: data.totalStarted > 0
            ? Math.round((data.totalCompleted / data.totalStarted) * 100)
            : 0,
          avgTimeSpentMinutes: Math.round(data.totalTimeSpent / Math.max(data.totalStarted, 1) / 60),
        }))
        .sort((a, b) => b.avgCompletionRate - a.avgCompletionRate);

      console.log("Theme performance data prepared", {
        storiesCount: themePerformance.length,
      });

      // ===== METRIC 3: DIFFICULTY HEATMAP =====
      // Build 2D matrix [readingLevel × storyDifficulty 1-5]
      const readingLevels = ["BEGINNER", "EASY", "MEDIUM", "HARD", "ADVANCED"];
      const emptyDifficultyData = (count: number) => ({
        completionRate: 0,
        sampleSize: count,
        avgTimeMinutes: 0,
      });

      const heatmapMap = new Map<
        string,
        Map<number, { completed: number; total: number; timeSpent: number }>
      >();

      // Initialize heatmap structure
      readingLevels.forEach((level) => {
        heatmapMap.set(level, new Map());
        for (let d = 1; d <= 5; d++) {
          heatmapMap.get(level)!.set(d, {
            completed: 0,
            total: 0,
            timeSpent: 0,
          });
        }
      });

      // Populate heatmap by matching stories with child roadmaps
      // For each progress, find its difficulty and reading level
      allProgress.forEach((progress) => {
        // Assume reading level from allocated roadmaps (simplified - would need Content Service in real scenario)
        // For now, distribute evenly or use default
        const childRoadmapCount = progress.childProfile.allocatedRoadmaps?.length || 1;
        const readingLevelIndex = Math.min(
          Math.floor(childRoadmapCount / 2), // Simplified: more roadmaps = higher level
          readingLevels.length - 1
        );
        const readingLevel = readingLevels[readingLevelIndex];

        // Difficulty will come from story metadata (default to 3 for now)
        const difficulty = 3;

        const difficultyData = heatmapMap.get(readingLevel)?.get(difficulty);
        if (difficultyData) {
          difficultyData.total += 1;
          if (progress.status === ProgressStatus.COMPLETED) {
            difficultyData.completed += 1;
          }
          difficultyData.timeSpent += progress.totalTimeSpent || 0;
        }
      });

      // Convert heatmap to final format
      const difficultyHeatmap = readingLevels.map((level) => {
        const levelData = heatmapMap.get(level)!;
        const heatmapRow: any = { readingLevel: level };

        for (let d = 1; d <= 5; d++) {
          const data = levelData.get(d)!;
          heatmapRow[`difficulty${d}`] = {
            completionRate: data.total > 0 
              ? Math.round((data.completed / data.total) * 100)
              : 0,
            sampleSize: data.total,
            avgTimeMinutes: data.total > 0 
              ? Math.round(data.timeSpent / data.total / 60)
              : 0,
          };
        }

        return heatmapRow;
      });

      console.log("Difficulty heatmap calculated", {
        levelCount: difficultyHeatmap.length,
      });

      return {
        mostPopularStories,
        themePerformance,
        difficultyHeatmap,
      };
    } catch (error) {
      console.error("Error calculating content performance metrics", {
        error: String(error),
      });
      throw error;
    }
  }

}
