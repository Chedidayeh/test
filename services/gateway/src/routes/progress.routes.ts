import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { ChildProfileMatcher, ParentProfileMatcher } from "../services";
import { ApiResponse, ChildProfile, Child, User, ParentUser } from "@shared/types";

const router = Router();

const PROGRESS_SERVICE_URL =
  process.env.PROGRESS_SERVICE_URL || "http://localhost:3004";
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3002";
/**
 * Helper function to fetch a specific child by ID
 * Orchestrates Progress Service (child profile) and Auth Service (child data)
 * TODO: Extend to fetch related content service data (stories, progress, etc.)
 */
async function forwardGetChildById(
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
      `${PROGRESS_SERVICE_URL}/api/children/${childId}`,
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
        `${AUTH_SERVICE_URL}/children/${profile.childId}`,
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
async function forwardToProgressService(
  req: Request,
  res: Response,
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

    // If requesting /api/children endpoints, enhance with Auth Service data
    if (basePath.includes("/api/children") && profileResponse.status === 200) {
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
          `${AUTH_SERVICE_URL}/children`,
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
          const matchedProfiles = ChildProfileMatcher.match(
            profiles,
            children,
          );

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
    res.status(503).json({ error: "Progress service unavailable" });
  }
}

/**
 * Helper function to fetch parent with matched child profiles
 * Orchestrates Auth Service (parent + children) and Progress Service (profiles)
 */
async function forwardParentWithProfiles(
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
      `${AUTH_SERVICE_URL}/parent/${parentId}`,
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
      `${PROGRESS_SERVICE_URL}/api/children/parent/${parentId}`,
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

// Get specific child by ID (must be before the generic /children middleware)
router.get("/children/:id", (req: Request, res: Response) => {
  forwardGetChildById(req, res);
});

router.use("/children", (req: Request, res: Response) => {
  forwardToProgressService(req, res, `/api/children${req.path}`);
});

// Get parent with child profiles
router.get("/parent-data/:parentId", (req: Request, res: Response) => {
  forwardParentWithProfiles(req, res);
});

export default router;
