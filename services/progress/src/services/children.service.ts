import { PrismaClient, ProgressStatus, ChallengeStatus } from "@prisma/client";
import {
  ChildProfile,
  PaginationMeta,
  GameSession,
  Progress,
  ChallengeAttempt,
  StarEvent,
  ChallengeType,
} from "@shared/types";

const prisma = new PrismaClient();

export class ChildrenService {
  /**
   * Create a new child profile
   */
  static async createChild(payload: {
    parentEmail: string;
    parentId: string;
    name: string;
    childId: string;
    ageGroupId: string;
    themeIds: string[];
    badgeId: string;
  }): Promise<ChildProfile> {
    const childProfile = await prisma.childProfile.create({
      data: {
        parentId: payload.parentId,
        name: payload.name,
        ageGroupId: payload.ageGroupId,
        favoriteThemes: payload.themeIds,
        childId: payload.childId,
        badges: {
          create: { badgeId: payload.badgeId },
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
                  }
                },
              },
            },
          },
        },
        badges: true,
      },
    });

    // Cast to ChildProfile - Prisma handles enum conversion
    return childProfile as unknown as ChildProfile;
  }

  /**
   * Fetch all children with their progress stats
   * Returns paginated results with optional filtering
   */
  static async getAllChildren(
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
    const typedProfiles = childProfiles as unknown as ChildProfile[];

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
              },
            },
          },
        },
        badges: true,
      },
    });

    // Cast to ChildProfile[] - Prisma handles enum conversion
    return childProfiles as unknown as ChildProfile[];
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

    // Cast to ChildProfile[] - Prisma handles enum conversion
    return childProfiles as unknown as ChildProfile[];
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

    if (!childProfile) return null;

    // Cast to ChildProfile - Prisma handles enum conversion
    return childProfile as unknown as ChildProfile;
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
              },
            },
          },
        },
      },
    });

    if (!progress) {
      return null;
    }

    // Cast to Progress - Prisma handles enum conversion
    return progress as unknown as Progress;
  }

  static async startStoryProgress(payload: {
    childId: string;
    storyId: string;
    worldId: string;
    roadmapId: string;
    firstChapterId: string;
    challengeIds?: string[];
  }): Promise<Progress | null> {
    const childProfile = await prisma.childProfile.findUnique({
      where: { childId: payload.childId },
    });

    if (!childProfile) {
      return null
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
    return progress as unknown as Progress;
  }

  /**
   * Save checkpoint for a game session
   * Updates the game session with chapter ID and checkpoint timestamp
   * Used when player pauses or completes a chapter
   */
  static async saveCheckpoint(
    gameSessionId: string,
    chapterId: string,
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
      },
      include: {
        challengeAttempts: {
          include: {
            starEvent: true,
          },
        },
      },
    });

    return updatedSession as unknown as GameSession;
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

    // Return the results
    return {
      attempt: updatedAttempt as unknown as ChallengeAttempt,
      starEvent: starEvent as unknown as StarEvent,
      totalStars,
    };
  }

  /**
   * Complete a story for a game session
   * Marks the story as completed and updates the progress record
   */
  static async completeStory(
    gameSessionId: string,
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
      },
    });

    if (!gameSession) {
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
      await prisma.progress.update({
        where: { id: progress.id },
        data: {
          status: ProgressStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    // Update game session with completion timestamp
    const completedSession = await prisma.gameSession.update({
      where: { id: gameSessionId },
      data: {
        endedAt: new Date(),
      },
      include: {
        challengeAttempts: {
          include: {
            starEvent: true,
          },
        },
      },
    });

    // update child profile total stars
    if (progress) {
      const childProfile = await prisma.childProfile.findUnique({
        where: { id: progress.childProfileId },
      });

      if (childProfile) {
        await prisma.childProfile.update({
          where: { id: progress.childProfileId },
          data: {
            totalStars: childProfile.totalStars + gameSession.starsEarned,
          },
        });
      }
    }

    return completedSession as unknown as GameSession;
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

    return updatedChild as unknown as ChildProfile;
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

    return updatedChild as unknown as ChildProfile;
  }
}
