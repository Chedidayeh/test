import { Request, Response } from "express";
import { ThemeService } from "../services/theme.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const themeService = new ThemeService(prisma);

export class ThemeController {
  /**
   * Get all themes
   * GET /api/themes
   */
  async getThemes(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get themes request");

      const themes = await themeService.getThemes();

      sendSuccess(res, themes, 200);
    } catch (error) {
      logger.error("Error in getThemes controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch themes");
    }
  }

  /**
   * Get a single theme by ID
   * GET /api/themes/:id
   */
  async getThemeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get theme by ID request", { themeId: id });

      if (!id) {
        sendError(res, "Theme ID is required", 400);
        return;
      }

      const theme = await themeService.getThemeById(id);

      if (!theme) {
        sendError(res, "Theme not found", 404, `Theme with ID ${id} not found`);
        return;
      }

      sendSuccess(res, theme, 200);
    } catch (error) {
      logger.error("Error in getThemeById controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch theme");
    }
  }
}

export const themeController = new ThemeController();
