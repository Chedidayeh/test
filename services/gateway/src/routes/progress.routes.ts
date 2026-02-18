import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { ChildProfileMatcher } from "../services";
import { ApiResponse, ChildProfile, Child } from "@shared/types";

const router = Router();

const PROGRESS_SERVICE_URL =
  process.env.PROGRESS_SERVICE_URL || "http://localhost:3004";
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3002";
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

router.use("/children", (req: Request, res: Response) => {
  forwardToProgressService(req, res, `/api/children${req.path}`);
});

export default router;
