import { Request, Response } from "express";
import { ChildrenService } from "../services/children.service";
import { ApiResponse, ChildProfile } from "@shared/types";

export class ChildrenController {
  /**
   * GET /api/children
   * Fetch all children with stats
   * Query params: limit, offset, childIds (filter by specific child IDs)
   */
  static async getAllChildren(
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

      const result = await ChildrenService.getAllChildren({
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

  /**
   * GET /api/progress/children/:id
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
}
