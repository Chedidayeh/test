import { Request, Response } from "express";

import axios from "axios";
import { logger } from "../utils/logger";
import { ChildProfileMatcher, ParentProfileMatcher } from "../services";
import {
  ApiResponse,
  ChildProfile,
  Child,
  User,
  ParentUser,
  Story,
  GameSession,
  Progress,
  ChallengeAttempt,
  StarEvent,
  SessionCheckpoint,
  AdminDashboardStats,
  API_BASE_URL_V1,
} from "@shared/src/types";

const PROGRESS_SERVICE_URL =
  process.env.PROGRESS_SERVICE_URL || "http://localhost:3004";
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3002";
const CONTENT_SERVICE_URL =
  process.env.CONTENT_SERVICE_URL || "http://localhost:3003";
/**
 * Helper function to fetch a specific child by ID
 * Orchestrates Progress Service (child profile) and Auth Service (child data)
 * TODO: Extend to fetch related content service data (stories, progress, etc.)
 */
export async function forwardGetChildById(
  req: Request,
  res: Response<ApiResponse<ChildProfile>>,
): Promise<void> {
  try {
    const { id: childId } = req.params;

    if (!childId) {
      logger.warn("Missing childId parameter");
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

    logger.info("Fetching child by ID", { childId });

    // Step 1: Fetch child profile from Progress Service
    const profileResponse = await axios.get<ApiResponse<ChildProfile>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/${childId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service child profile response received", {
      status: profileResponse.status,
      hasProfile: !!profileResponse.data?.data,
    });

    // Handle child profile not found
    if (profileResponse.status === 404) {
      logger.warn("Child profile not found in progress service", { childId });
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

    // Handle progress service error
    if (profileResponse.status !== 200) {
      logger.error("Progress service error fetching child profile", {
        status: profileResponse.status,
        childId,
      });
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Progress service unavailable",
        },
        timestamp: new Date(),
      });
      return;
    }

    let profile = profileResponse.data?.data as ChildProfile;

    if (!profile) {
      logger.warn("Profile data is null in progress service response", {
        childId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    // Step 2: Fetch child data from Auth Service to match with profile
    try {
      const childResponse = await axios.get<ApiResponse<Child>>(
        `${AUTH_SERVICE_URL}${API_BASE_URL_V1}/children/${profile.childId}`,
        {
          headers: {
            "Content-Type": "application/json",
            // Forward auth header if available
            ...(req.headers.authorization && {
              Authorization: req.headers.authorization,
            }),
          },
          validateStatus: () => true,
        },
      );

      logger.debug("Auth service child response received", {
        status: childResponse.status,
        hasChild: !!childResponse.data?.data,
      });

      if (childResponse.status === 200 && childResponse.data?.data) {
        const child = childResponse.data.data;
        // Attach child data to profile
        profile = {
          ...profile,
          child: child,
        };

        logger.debug("Child data matched with profile", {
          childId: profile.childId,
        });
      }
    } catch (authError) {
      logger.warn("Error fetching child from auth service", {
        error: String(authError),
        childId,
      });
      // Continue without auth data if it fails
    }

    // TODO: Step 3: Fetch related content service data
    // - Story progress
    // - Current reading level/roadmap
    // - Available stories based on age group
    // - Badges and achievements

    logger.info("Child profile fetched successfully", { childId });

    res.status(200).json({
      success: true,
      data: profile,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Get child by ID forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch child profile",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Helper function to forward requests to the progress service
 * For /children endpoints, also fetches and matches Auth Service children
 */
export async function forwardToProgressService(
  req: Request,
  res: Response<ApiResponse<ChildProfile[]>>,
  basePath: string,
): Promise<void> {
  try {
    const contentUrl = `${PROGRESS_SERVICE_URL}${basePath}`;

    logger.debug("Forwarding progress request to service", {
      method: req.method,
      path: req.path,
      targetUrl: contentUrl,
      queryParams: req.query,
    });

    // Fetch child profiles from Progress Service
    const profileResponse = await axios.get<ApiResponse<ChildProfile[]>>(
      contentUrl,
      {
        params: req.query,
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service response received", {
      status: profileResponse.status,
      dataLength: profileResponse.data?.data?.length,
    });

    // If requesting /children endpoints, enhance with Auth Service data
    if (
      basePath.includes(`${API_BASE_URL_V1}/children`) &&
      profileResponse.status === 200
    ) {
      try {
        // Get profiles and extract child IDs
        const profiles = profileResponse.data?.data || [];

        if (profiles.length === 0) {
          // No profiles, return empty response
          res.status(200).json({
            success: true,
            data: [],
            pagination: profileResponse.data?.pagination,
            timestamp: new Date(),
          });
          return;
        }

        // Extract unique child IDs from profiles
        const childIds = Array.from(new Set(profiles.map((p) => p.childId)));

        logger.debug("Extracted child IDs from profiles", {
          profileCount: profiles.length,
          uniqueChildIds: childIds.length,
        });

        // Fetch only the children referenced by profiles
        const childrenResponse = await axios.get<ApiResponse<Child[]>>(
          `${AUTH_SERVICE_URL}${API_BASE_URL_V1}/children`,
          {
            params: {
              childIds: childIds.join(","),
            },
            headers: {
              "Content-Type": "application/json",
              // Forward auth header from request if available
              ...(req.headers.authorization && {
                Authorization: req.headers.authorization,
              }),
            },
            validateStatus: () => true,
          },
        );

        logger.debug("Auth service response received", {
          status: childrenResponse.status,
          dataLength: childrenResponse.data?.data?.length,
        });

        // Match profiles with children
        const children = childrenResponse.data?.data || [];

        if (
          childrenResponse.status === 200 &&
          ChildProfileMatcher.validate(profiles, children)
        ) {
          const matchedProfiles = ChildProfileMatcher.match(profiles, children);

          logger.debug("Profiles matched successfully", {
            total: matchedProfiles.length,
          });

          // Return matched profiles with auth data attached
          res.status(200).json({
            success: true,
            data: matchedProfiles,
            pagination: profileResponse.data?.pagination,
            timestamp: new Date(),
          });
          return;
        } else {
          logger.warn("Auth service fetch failed or validation failed", {
            authStatus: childrenResponse.status,
            profilesLength: profiles.length,
            childrenLength: children.length,
          });

          // Fallback to unmatched profiles
          res.status(profileResponse.status).json(profileResponse.data);
          return;
        }
      } catch (matchError) {
        logger.error("Error matching profiles with children", {
          error: String(matchError),
        });

        // Fallback to unmatched profiles if matching fails
        res.status(profileResponse.status).json(profileResponse.data);
        return;
      }
    }

    // For non-children endpoints, just forward the response
    res.status(profileResponse.status).json(profileResponse.data);
  } catch (error) {
    logger.error("Progress service forward error", {
      error: String(error),
      path: req.path,
    });
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Progress service unavailable",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Helper function to fetch parent with matched child profiles
 * Orchestrates Auth Service (parent + children) and Progress Service (profiles)
 */
export async function forwardParentWithProfiles(
  req: Request,
  res: Response<ApiResponse<ParentUser>>,
): Promise<void> {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      logger.warn("Missing parentId parameter");
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

    logger.info("Fetching parent with profiles", { parentId });

    // Step A: Fetch parent from Auth Service
    const parentResponse = await axios.get<ApiResponse<User>>(
      `${AUTH_SERVICE_URL}${API_BASE_URL_V1}/parent/${parentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          // Forward auth header if available
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Auth service parent response received", {
      status: parentResponse.status,
      hasParent: !!parentResponse.data?.data,
    });

    // Handle parent not found
    if (parentResponse.status === 404) {
      logger.warn("Parent not found in auth service", { parentId });
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Parent not found",
        },
        timestamp: new Date(),
      });
      return;
    }

    // Handle auth service error
    if (parentResponse.status !== 200) {
      logger.error("Auth service error fetching parent", {
        status: parentResponse.status,
        parentId,
      });
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Auth service unavailable",
        },
        timestamp: new Date(),
      });
      return;
    }

    const parent = parentResponse.data?.data as User;

    if (!parent) {
      logger.warn("Parent data is null in auth service response", { parentId });
      res.status(500).json({
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response from auth service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.debug("Parent fetched from auth service", {
      parentId: parent.id,
      childrenCount: parent.children?.length || 0,
    });

    // Step B: Fetch child profiles from Progress Service
    const profilesResponse = await axios.get<ApiResponse<ChildProfile[]>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/parent/${parentId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service profiles response received", {
      status: profilesResponse.status,
      profileCount: profilesResponse.data?.data?.length,
    });

    // Get profiles (empty array if none exist)
    const profiles = profilesResponse.data?.data || [];

    // Step C & D: Validate and match parent with profiles
    if (!ParentProfileMatcher.validate(parent, profiles)) {
      logger.warn("Parent-profile validation failed", { parentId });
      res.status(500).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Failed to validate parent and profiles",
        },
        timestamp: new Date(),
      });
      return;
    }

    const matchedParent = ParentProfileMatcher.match(parent, profiles);

    logger.info("Parent with profiles fetched successfully", {
      parentId: matchedParent.id,
      childrenCount: matchedParent.children.length,
    });

    res.status(200).json({
      success: true,
      data: matchedParent,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Parent with profiles forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch parent with profiles",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Helper function to start a new story for a child
 * Creates a new progress record with initial game session at page 1
 * Fetches story details from Content Service first
 */
export async function forwardStartStory(
  req: Request,
  res: Response<ApiResponse<Progress | null>>,
): Promise<void> {
  try {
    const { childId, storyId } = req.params;

    if (!childId || !storyId) {
      logger.warn("Missing required parameters for start story", {
        childId,
        storyId,
      });
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

    logger.info("Starting new story", { childId, storyId });

    // Step 1: Fetch story details from Content Service
    const storyResponse = await axios.get<ApiResponse<Story>>(
      `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/stories/${storyId}`,
      {
        headers: {
          "Content-Type": "application/json",
          // Forward auth header if available
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Content service story response received", {
      status: storyResponse.status,
      hasStory: !!storyResponse.data?.data,
    });

    // Handle story not found
    if (storyResponse.status === 404) {
      logger.warn("Story not found in content service", { storyId });
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Story not found",
        },
        timestamp: new Date(),
      });
      return;
    }

    // Handle content service error
    if (storyResponse.status !== 200) {
      logger.error("Content service error fetching story", {
        status: storyResponse.status,
        storyId,
      });
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Content service unavailable",
        },
        timestamp: new Date(),
      });
      return;
    }

    const story = storyResponse.data?.data;

    if (!story) {
      logger.warn("Story data is null in content service response", {
        storyId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response from content service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Story fetched successfully from content service", {
      storyId: story.id,
      title: story.title,
    });

    // Step 2: Extract required fields from story
    const firstChapter = story.chapters.find((ch) => ch.order === 1);
    const firstChapterId = firstChapter?.id;
    const worldId = story.worldId;
    const roadmapId = story.world.roadmapId;

    // Extract challenge IDs from all chapters
    const challengeIds = story.chapters
      .map((chapter) => chapter.challenge?.id)
      .filter((id) => id !== undefined) as string[];

    if (!firstChapterId || !worldId || !roadmapId) {
      logger.warn("Story missing required fields", {
        storyId,
        hasFirstChapter: !!firstChapterId,
        hasWorldId: !!worldId,
        hasRoadmapId: !!roadmapId,
      });
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STORY",
          message:
            "Story is missing required fields: chapters, worldId, or roadmapId",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.debug("Extracted story metadata", {
      storyId,
      firstChapterId,
      worldId,
      roadmapId,
      challengeCount: challengeIds.length,
    });

    // Step 3: Create new progress record in Progress Service
    const progressResponse = await axios.post<ApiResponse<Progress | null>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/progress/${childId}/stories/${storyId}/start`,
      {
        firstChapterId,
        worldId,
        roadmapId,
        challengeIds,
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Forward auth header if available
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service create progress response received", {
      status: progressResponse.status,
      hasProgress: !!progressResponse.data?.data,
    });

    // Handle progress service error
    if (progressResponse.status !== 201 && progressResponse.status !== 200) {
      logger.error("Progress service error creating progress record", {
        status: progressResponse.status,
        childId,
        storyId,
      });
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Progress service unavailable",
        },
        timestamp: new Date(),
      });
      return;
    }

    const progressRecord = progressResponse.data?.data;

    if (!progressRecord) {
      logger.warn("Progress record is null in progress service response", {
        childId,
        storyId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Story progress record created successfully", {
      childId,
      storyId,
      progressId: progressRecord.id,
    });

    res.status(200).json({
      success: true,
      data: progressRecord,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Start story forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to start story",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Helper function to fetch progress for a specific child and story
 * Gets the progress record including accuracy, completion status, and rewards
 */
export async function forwardGetChildProgress(
  req: Request,
  res: Response<ApiResponse<Progress | null>>,
): Promise<void> {
  try {
    const { childId, storyId } = req.params;

    if (!childId || !storyId) {
      logger.warn("Missing required parameters for get child progress", {
        childId,
        storyId,
      });
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

    logger.info("Fetching child progress", { childId, storyId });

    // Forward request to Progress Service
    const progressResponse = await axios.get<ApiResponse<Progress | null>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/progress/${childId}/stories/${storyId}`,
      {
        headers: {
          "Content-Type": "application/json",
          // Forward auth header if available
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service response received", {
      status: progressResponse.status,
      hasProgress: !!progressResponse.data?.data,
    });

    // Handle progress not found (not an error, just return 404)
    if (progressResponse.status === 404) {
      logger.debug("Progress not found for child story", { childId, storyId });
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

    // Handle service error
    if (progressResponse.status !== 200) {
      logger.error("Progress service error fetching progress", {
        status: progressResponse.status,
        childId,
        storyId,
      });
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Progress service unavailable",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Child progress fetched successfully", {
      childId,
      storyId,
      hasProgress: !!progressResponse.data?.data,
    });

    res.status(200).json({
      success: true,
      data: progressResponse.data?.data || null,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Get child progress forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch child progress",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Helper function to submit a challenge answer
 * Records the challenge attempt with answer data and calculates star rewards
 * Creates both ChallengeAttempt and StarEvent records
 */
export async function forwardSubmitChallengeAnswer(
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
      logger.warn("Missing required fields for submit challenge", {
        gameSessionId,
        challengeId,
      });
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

    logger.info("Submitting challenge answer", {
      gameSessionId,
      challengeId,
      challengeType,
      isCorrect,
      attemptNumber,
      usedHints,
      skipped,
      status,
    });

    // Forward to Progress Service
    const submitResponse = await axios.post<
      ApiResponse<{
        attempt: ChallengeAttempt;
        starEvent: StarEvent;
        totalStars: number;
      }>
    >(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/progress/challenge/submit`,
      {
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
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service submit challenge response received", {
      status: submitResponse.status,
      hasAttempt: !!submitResponse.data?.data?.attempt,
      hasStarEvent: !!submitResponse.data?.data?.starEvent,
    });

    // Handle progress service error
    if (submitResponse.status !== 200 && submitResponse.status !== 201) {
      logger.error("Progress service error submitting challenge", {
        status: submitResponse.status,
        gameSessionId,
        challengeId,
      });
      res.status(submitResponse.status).json({
        success: false,
        error: {
          code: submitResponse.data?.error?.code || "SERVICE_ERROR",
          message:
            submitResponse.data?.error?.message ||
            "Failed to submit challenge answer",
        },
        timestamp: new Date(),
      });
      return;
    }

    const responseData = submitResponse.data?.data;

    if (!responseData || !responseData.attempt) {
      logger.warn(
        "Challenge attempt data is null in progress service response",
        {
          gameSessionId,
          challengeId,
        },
      );
      res.status(500).json({
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Challenge answer submitted successfully", {
      gameSessionId,
      challengeId,
      attemptId: responseData.attempt.id,
      totalStars: responseData.totalStars,
      skipped,
    });

    res.status(200).json({
      success: true,
      data: {
        attempt: responseData.attempt,
        starEvent: responseData.starEvent,
        totalStars: responseData.totalStars,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Submit challenge forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to submit challenge answer",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Save checkpoint for a game session
 * Takes gameSessionId and chapterId, forwards to Progress Service
 */
export async function forwardSaveCheckpoint(
  req: Request,
  res: Response<ApiResponse<GameSession | null>>,
): Promise<void> {
  try {
    const { gameSessionId, chapterId } = req.body;

    if (!gameSessionId || !chapterId) {
      logger.warn("Missing required fields for save checkpoint", {
        gameSessionId,
        chapterId,
      });
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

    logger.info("Saving checkpoint for game session", {
      gameSessionId,
      chapterId,
    });

    // Forward to Progress Service
    const checkpointResponse = await axios.post<ApiResponse<GameSession>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/progress/checkpoint`,
      {
        gameSessionId,
        chapterId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Forward auth header if available
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service save checkpoint response received", {
      status: checkpointResponse.status,
      hasGameSession: !!checkpointResponse.data?.data,
    });

    // Handle progress service error
    if (checkpointResponse.status !== 200) {
      logger.error("Progress service error saving checkpoint", {
        status: checkpointResponse.status,
        gameSessionId,
      });
      res.status(checkpointResponse.status).json({
        success: false,
        error: {
          code: checkpointResponse.data?.error?.code || "SERVICE_ERROR",
          message:
            checkpointResponse.data?.error?.message ||
            "Failed to save checkpoint",
        },
        timestamp: new Date(),
      });
      return;
    }

    const updatedSession = checkpointResponse.data?.data;

    if (!updatedSession) {
      logger.warn("Game session is null in progress service response", {
        gameSessionId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedSession,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Save checkpoint forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to save checkpoint",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Create new checkpoint from a game session
 * Records resume timestamp and calculates idle time
 * Returns checkpoint with session duration and idle time
 */
export async function forwardCreateNewCheckpoint(
  req: Request,
  res: Response<ApiResponse<SessionCheckpoint>>,
): Promise<void> {
  try {
    const { gameSessionId } = req.params;

    if (!gameSessionId) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing required parameters: gameSessionId",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Resuming from game session", {
      gameSessionId,
    });

    // Forward to Progress Service
    const resumeResponse = await axios.post<ApiResponse<SessionCheckpoint>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/progress/create-new-checkpoint/${gameSessionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service resume checkpoint response received", {
      status: resumeResponse.status,
      hasCheckpoint: !!resumeResponse.data?.data,
    });

    // Handle progress service error
    if (resumeResponse.status !== 200) {
      logger.error("Progress service resume checkpoint error", {
        status: resumeResponse.status,
        message: resumeResponse.data?.error?.message,
      });
      res.status(resumeResponse.status).json(resumeResponse.data);
      return;
    }

    const result = resumeResponse.data?.data;

    if (!result) {
      logger.error("Resume checkpoint returned no data", {
        gameSessionId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "NO_DATA_ERROR",
          message: "Failed to resume checkpoint: no data returned",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Game session resumed successfully", {
      gameSessionId,
      sessionDurationSeconds: result.sessionDurationSeconds,
    });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Resume game session forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to resume game session",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Pause a game session - saves state when user exits the story
 * Forwards the pause request to Progress Service
 */
export async function forwardPauseGameSession(
  req: Request,
  res: Response<ApiResponse<SessionCheckpoint>>,
): Promise<void> {
  try {
    const { gameSessionId } = req.params;

    if (!gameSessionId) {
      res.status(400).json({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Missing required parameters: gameSessionId",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Pausing game session", {
      gameSessionId,
    });

    // Forward to Progress Service
    const pauseResponse = await axios.post<ApiResponse<SessionCheckpoint>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/progress/pause/${gameSessionId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service pause game session response received", {
      status: pauseResponse.status,
      hasCheckpoint: !!pauseResponse.data?.data,
    });

    // Handle progress service error
    if (pauseResponse.status !== 200) {
      logger.error("Progress service pause game session error", {
        status: pauseResponse.status,
        message: pauseResponse.data?.error?.message,
      });
      res.status(pauseResponse.status).json(pauseResponse.data);
      return;
    }

    const result = pauseResponse.data?.data;

    if (!result) {
      logger.error("Pause game session returned no data", {
        gameSessionId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "NO_DATA_ERROR",
          message: "Failed to pause game session: no data returned",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Game session paused successfully", {
      gameSessionId,
      pausedAt: result.pausedAt,
    });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Pause game session forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to pause game session",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Complete a story for a game session
 * Marks the story as completed and triggers completion rewards
 */
export async function forwardCompleteStory(
  req: Request,
  res: Response<ApiResponse<GameSession | null>>,
): Promise<void> {
  try {
    const { gameSessionId } = req.params;

    if (!gameSessionId) {
      logger.warn("Missing required parameter for complete story", {
        gameSessionId,
      });
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

    logger.info("Completing story for game session", { gameSessionId });

    // Forward to Progress Service
    const completeResponse = await axios.post<ApiResponse<GameSession>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/progress/${gameSessionId}/complete`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          // Forward auth header if available
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service complete story response received", {
      status: completeResponse.status,
      hasGameSession: !!completeResponse.data?.data,
    });

    // Handle progress service error
    if (completeResponse.status !== 200) {
      logger.error("Progress service error completing story", {
        status: completeResponse.status,
        gameSessionId,
      });
      res.status(completeResponse.status).json({
        success: false,
        error: {
          code: completeResponse.data?.error?.code || "SERVICE_ERROR",
          message:
            completeResponse.data?.error?.message || "Failed to complete story",
        },
        timestamp: new Date(),
      });
      return;
    }

    const updatedSession = completeResponse.data?.data;

    if (!updatedSession) {
      logger.warn("Game session is null in progress service response", {
        gameSessionId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid response from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Story completed successfully", {
      gameSessionId,
    });

    res.status(200).json({
      success: true,
      data: updatedSession,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Complete story forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to complete story",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Helper function to update a child's current level
 * Called when a child reaches a new level through progression
 */
export async function forwardUpdateChildLevel(
  req: Request,
  res: Response<ApiResponse<ChildProfile>>,
): Promise<void> {
  try {
    const { childId } = req.params;
    const { currentLevel } = req.body;

    if (!childId || currentLevel === undefined) {
      logger.warn("Invalid parameters for update child level", {
        childId,
        currentLevel,
      });
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "childId and currentLevel are required",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Updating child level", { childId, currentLevel });

    // Forward to Progress Service
    const updateResponse = await axios.patch<ApiResponse<ChildProfile>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/${childId}/level`,
      {
        currentLevel,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service update child level response received", {
      status: updateResponse.status,
      hasChildProfile: !!updateResponse.data?.data,
    });

    // Handle progress service error
    if (updateResponse.status !== 200) {
      logger.error("Progress service update child level failed", {
        status: updateResponse.status,
        error: updateResponse.data?.error,
      });
      res.status(updateResponse.status || 503).json({
        success: false,
        error: {
          code: "PROGRESS_SERVICE_ERROR",
          message:
            updateResponse.data?.error?.message ||
            "Failed to update child level",
        },
        timestamp: new Date(),
      });
      return;
    }

    const updatedChild = updateResponse.data?.data;

    if (!updatedChild) {
      logger.warn("Progress service returned no child data", { childId });
      res.status(500).json({
        success: false,
        error: {
          code: "NO_DATA",
          message: "No child data returned from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Child level updated successfully", {
      childId,
      newLevel: currentLevel,
    });

    res.status(200).json({
      success: true,
      data: updatedChild,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Update child level forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update child level",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Helper function to assign a badge to a child
 * Called when a child earns a new badge through level progression
 */
export async function forwardAssignBadgeToChild(
  req: Request,
  res: Response<ApiResponse<ChildProfile>>,
): Promise<void> {
  try {
    const { childId } = req.params;
    const { badgeId } = req.body;

    if (!childId || !badgeId) {
      logger.warn("Invalid parameters for assign badge", {
        childId,
        badgeId,
      });
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "childId and badgeId are required",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Assigning badge to child", { childId, badgeId });

    // Forward to Progress Service
    const assignResponse = await axios.post<ApiResponse<ChildProfile>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/${childId}/badges`,
      {
        badgeId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service assign badge response received", {
      status: assignResponse.status,
      hasChildProfile: !!assignResponse.data?.data,
    });

    // Handle progress service error
    if (assignResponse.status !== 200 && assignResponse.status !== 201) {
      logger.error("Progress service assign badge failed", {
        status: assignResponse.status,
        error: assignResponse.data?.error,
      });
      res.status(assignResponse.status || 503).json({
        success: false,
        error: {
          code: "PROGRESS_SERVICE_ERROR",
          message:
            assignResponse.data?.error?.message || "Failed to assign badge",
        },
        timestamp: new Date(),
      });
      return;
    }

    const updatedChild = assignResponse.data?.data;

    if (!updatedChild) {
      logger.warn("Progress service returned no child data", {
        childId,
        badgeId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "NO_DATA",
          message: "No child data returned from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Badge assigned successfully", {
      childId,
      badgeId,
      badgeCount: updatedChild.badges?.length || 0,
    });

    res.status(200).json({
      success: true,
      data: updatedChild,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Assign badge forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to assign badge",
      },
      timestamp: new Date(),
    });
  }
}
/**
 * Helper function to allocate a roadmap to a child
 * Forwards the request to Progress Service
 */
export async function forwardAllocateRoadmapToChild(
  req: Request,
  res: Response<ApiResponse<ChildProfile>>,
): Promise<void> {
  try {
    const { childId } = req.params;
    const { roadmapId } = req.body;

    if (!childId || !roadmapId) {
      logger.warn("Invalid parameters for allocate roadmap", {
        childId,
        roadmapId,
      });
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "childId and roadmapId are required",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Allocating roadmap to child", { childId, roadmapId });

    // Forward to Progress Service
    const allocateResponse = await axios.post<ApiResponse<ChildProfile>>(
      `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/${childId}/allocate-roadmap`,
      {
        roadmapId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization && {
            Authorization: req.headers.authorization,
          }),
        },
        validateStatus: () => true,
      },
    );

    logger.debug("Progress service allocate roadmap response received", {
      status: allocateResponse.status,
      hasChildProfile: !!allocateResponse.data?.data,
    });

    // Handle progress service error
    if (allocateResponse.status !== 200 && allocateResponse.status !== 201) {
      logger.error("Progress service allocate roadmap failed", {
        status: allocateResponse.status,
        error: allocateResponse.data?.error,
      });
      res.status(allocateResponse.status || 503).json({
        success: false,
        error: {
          code: "PROGRESS_SERVICE_ERROR",
          message:
            allocateResponse.data?.error?.message ||
            "Failed to allocate roadmap",
        },
        timestamp: new Date(),
      });
      return;
    }

    const updatedChild = allocateResponse.data?.data;

    if (!updatedChild) {
      logger.warn("Progress service returned no child data", {
        childId,
        roadmapId,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "NO_DATA",
          message: "No child data returned from progress service",
        },
        timestamp: new Date(),
      });
      return;
    }

    logger.info("Roadmap allocated successfully", {
      childId,
      roadmapId,
      allocatedRoadmapCount: updatedChild.allocatedRoadmaps?.length || 0,
    });

    res.status(200).json({
      success: true,
      data: updatedChild,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Allocate roadmap forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to allocate roadmap",
      },
      timestamp: new Date(),
    });
  }
}

/**
 * Get comprehensive admin dashboard statistics
 * Orchestrates Content, Auth, and Progress services to aggregate metrics:
 * - Content counts: age groups, roadmaps, worlds, stories, chapters, challenges
 * - User counts: total parents
 * - Child metrics: total children, active children, stories completed, challenges solved
 */
export async function forwardGetDashboardStats(
  req: Request,
  res: Response<ApiResponse<AdminDashboardStats>>,
): Promise<void> {
  try {
    logger.info("Fetching admin dashboard statistics");

    // Step 1: Fetch content service counts
    // Get counts of age groups, roadmaps, worlds, stories, chapters, challenges
    let contentCounts = {
      totalAgeGroups: 0,
      totalRoadmaps: 0,
      totalWorlds: 0,
      totalStories: 0,
      totalChapters: 0,
      totalChallenges: 0,
    };

    try {
      logger.debug("Fetching content inventory counts from Content Service");

      // Single endpoint call to get all content counts
      const contentStatsRes = await axios.get<
        ApiResponse<{
          ageGroupsCount: number;
          roadmapsCount: number;
          worldsCount: number;
          storiesCount: number;
          chaptersCount: number;
          challengesCount: number;
        }>
      >(`${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/stats/content-overview`, {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      });

      if (contentStatsRes.status === 200 && contentStatsRes.data?.data) {
        const data = contentStatsRes.data.data;
        contentCounts.totalAgeGroups = data.ageGroupsCount || 0;
        contentCounts.totalRoadmaps = data.roadmapsCount || 0;
        contentCounts.totalWorlds = data.worldsCount || 0;
        contentCounts.totalStories = data.storiesCount || 0;
        contentCounts.totalChapters = data.chaptersCount || 0;
        contentCounts.totalChallenges = data.challengesCount || 0;
      }

      logger.debug("Content inventory counts retrieved", contentCounts);
    } catch (contentError) {
      logger.warn("Error fetching content counts from Content Service", {
        error: String(contentError),
      });
      // Continue with 0 values
    }

    // Step 2: Fetch parent count from Auth Service
    let totalParents = 0;

    try {
      logger.debug("Fetching total parents count from Auth Service");

      const parentsRes = await axios.get<ApiResponse<{ count: number }>>(
        `${AUTH_SERVICE_URL}${API_BASE_URL_V1}/parents/count`,
        {
          params: { limit: 1, offset: 0 },
          headers: {
            "Content-Type": "application/json",
            ...(req.headers.authorization && {
              Authorization: req.headers.authorization,
            }),
          },
          validateStatus: () => true,
        },
      );

      if (parentsRes.status === 200 && parentsRes.data?.data?.count !== undefined) {
        totalParents = parentsRes.data.data.count;
      }

      logger.debug("Parent count retrieved", { totalParents });
    } catch (authError) {
      logger.warn("Error fetching parents count from Auth Service", {
        error: String(authError),
      });
    }

    // Step 3: Fetch child statistics from Progress Service
    // Gets totalChildren, activeChildren, totalStoriesCompleted, totalChallengesSolved
    let totalChildren = 0;
    let activeChildren = 0;
    let totalStoriesCompleted = 0;
    let totalChallengesSolved = 0;

    try {
      logger.debug(
        "Fetching child statistics from Progress Service",
      );

      // Fetch aggregated children stats
      const statsRes = await axios.get<
        ApiResponse<{
          totalChildren: number;
          activeChildren: number;
          totalStoriesCompleted: number;
          totalChallengesSolved: number;
        }>
      >(
        `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/stats`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(req.headers.authorization && {
              Authorization: req.headers.authorization,
            }),
          },
          validateStatus: () => true,
        },
      );

      if (statsRes.status === 200 && statsRes.data?.data) {
        const childStats = statsRes.data.data;
        totalChildren = childStats.totalChildren || 0;
        activeChildren = childStats.activeChildren || 0;
        totalStoriesCompleted = childStats.totalStoriesCompleted || 0;
        totalChallengesSolved = childStats.totalChallengesSolved || 0;
      }

      logger.debug("Child statistics retrieved", {
        totalChildren,
        activeChildren,
        totalStoriesCompleted,
        totalChallengesSolved,
      });
    } catch (progressError) {
      logger.warn("Error fetching child statistics from Progress Service", {
        error: String(progressError),
      });
    }

    // Compile final statistics
    const stats: AdminDashboardStats = {
      activeChildren,
      totalChildren,
      totalParents,
      totalAgeGroups: contentCounts.totalAgeGroups,
      totalRoadmaps: contentCounts.totalRoadmaps,
      totalWorlds: contentCounts.totalWorlds,
      totalStories: contentCounts.totalStories,
      totalChapters: contentCounts.totalChapters,
      totalChallenges: contentCounts.totalChallenges,
      totalStoriesCompleted,
      totalChallengesSolved,
    };

    logger.info("Admin dashboard statistics compiled successfully", stats);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Get dashboard stats forward error", {
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    res.status(503).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch dashboard statistics",
      },
      timestamp: new Date(),
    });
  }
}
