import { Request, Response } from "express";
import { ThemeService } from "../services/theme.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, Theme, TranslationSourceType, ManualTranslationEdit } from "@shared/src/types";

const prisma = new PrismaClient();
const themeService = new ThemeService(prisma);

export class ThemeController {
  /**
   * Get all themes
   */
  async getThemes(
    req: Request,
    res: Response<ApiResponse<Theme[]>>,
  ): Promise<void> {
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
   */
  async getThemeById(
    req: Request,
    res: Response<ApiResponse<Theme>>,
  ): Promise<void> {
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

  /**
   * Create a new theme
   */
  async createTheme(
    req: Request,
    res: Response<ApiResponse<Theme>>,
  ): Promise<void> {
    try {
      const { name, description, imageUrl, translationSource, translations } = req.body;

      logger.info("Create theme request", { name, translationSource });

      // Validate required fields
      if (!name || name.trim() === "") {
        sendError(res, "Theme name is required and cannot be empty", 400);
        return;
      }

      if (!description || description.trim() === "") {
        sendError(
          res,
          "Theme description is required and cannot be empty",
          400,
        );
        return;
      }

      if (description.trim().length < 5) {
        sendError(
          res,
          "Theme description must be at least 5 characters long",
          400,
        );
        return;
      }

      // Validate imageUrl if provided
      if (imageUrl && imageUrl.trim() !== "") {
        try {
          new URL(imageUrl);
        } catch {
          sendError(res, "Invalid image URL format", 400);
          return;
        }
      }

      // Check for duplicate name
      const existingTheme = await themeService.getThemeByName(name.trim());
      if (existingTheme) {
        sendError(
          res,
          `Theme name '${name}' already exists`,
          409,
          "DUPLICATE_NAME",
        );
        return;
      }

      // Validate translation source if provided
      let validTranslationSource = translationSource;
      if (translationSource && !Object.values(TranslationSourceType).includes(translationSource)) {
        sendError(
          res,
          `Invalid translation source. Must be one of: ${Object.values(TranslationSourceType).join(", ")}`,
          400,
        );
        return;
      }

      // Validate translations array if provided
      let validTranslations: ManualTranslationEdit[] = [];
      if (translations && Array.isArray(translations)) {
        // Validate each translation has both name and description
        for (const translation of translations) {
          if (!translation.languageCode) {
            sendError(res, "Each translation must have a languageCode", 400);
            return;
          }
          if (!translation.name || translation.name.trim() === "") {
            sendError(res, "Each translation must have a non-empty name field", 400);
            return;
          }
          if (!translation.description || translation.description.trim() === "") {
            sendError(res, "Each translation must have a non-empty description field", 400);
            return;
          }
        }
        validTranslations = translations;
      }

      const theme = await themeService.createTheme({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl.trim() : null,
        translationSource: validTranslationSource,
        translations: validTranslations,
      });

      sendSuccess(res, theme, 201);
    } catch (error) {
      logger.error("Error in createTheme controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create theme");
    }
  }

  /**
   * Update a theme
   */
  async updateTheme(
    req: Request,
    res: Response<ApiResponse<Theme>>,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, imageUrl, translationSource, translations } = req.body;

      logger.info("Update theme request", { themeId: id, translationSource });

      if (!id) {
        sendError(res, "Theme ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (!name && !description && imageUrl === undefined && !translationSource && !translations) {
        sendError(
          res,
          "At least one field (name, description, imageUrl, translationSource, translations) must be provided",
          400,
        );
        return;
      }

      // Check if theme exists
      const existingTheme = await themeService.getThemeById(id);
      if (!existingTheme) {
        sendError(res, "Theme not found", 404, `Theme with ID ${id} not found`);
        return;
      }

      // Build update data
      const updateData: any = {};

      if (name !== undefined) {
        if (name.trim() === "") {
          sendError(res, "Theme name cannot be empty", 400);
          return;
        }
        updateData.name = name.trim();

        // Check for duplicate name (if changing)
        if (name.trim() !== existingTheme.name) {
          const duplicateTheme = await themeService.getThemeByName(name.trim());
          if (duplicateTheme) {
            sendError(
              res,
              `Theme name '${name}' already exists`,
              409,
              "DUPLICATE_NAME",
            );
            return;
          }
        }
      }

      if (description !== undefined) {
        if (description.trim() === "") {
          sendError(res, "Theme description cannot be empty", 400);
          return;
        }
        if (description.trim().length < 5) {
          sendError(
            res,
            "Theme description must be at least 5 characters long",
            400,
          );
          return;
        }
        updateData.description = description.trim();
      }

      if (imageUrl !== undefined) {
        if (imageUrl && imageUrl.trim() !== "") {
          try {
            new URL(imageUrl);
          } catch {
            sendError(res, "Invalid image URL format", 400);
            return;
          }
          updateData.imageUrl = imageUrl.trim();
        } else {
          updateData.imageUrl = null;
        }
      }

      // Validate translation source if provided
      let validTranslationSource = translationSource;
      if (translationSource && !Object.values(TranslationSourceType).includes(translationSource)) {
        sendError(
          res,
          `Invalid translation source. Must be one of: ${Object.values(TranslationSourceType).join(", ")}`,
          400,
        );
        return;
      }

      // Validate translations array if provided
      let validTranslations: ManualTranslationEdit[] = [];
      if (translations && Array.isArray(translations)) {
        // Validate each translation has both name and description
        for (const translation of translations) {
          if (!translation.languageCode) {
            sendError(res, "Each translation must have a languageCode", 400);
            return;
          }
          if (!translation.name || translation.name.trim() === "") {
            sendError(res, "Each translation must have a non-empty name field", 400);
            return;
          }
          if (!translation.description || translation.description.trim() === "") {
            sendError(res, "Each translation must have a non-empty description field", 400);
            return;
          }
        }
        validTranslations = translations;
      }

      const updatedTheme = await themeService.updateTheme(
        id,
        updateData,
        validTranslationSource,
        validTranslations,
      );

      sendSuccess(res, updatedTheme, 200);
    } catch (error) {
      logger.error("Error in updateTheme controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update theme");
    }
  }

  /**
   * Delete a theme
   */
  async deleteTheme(
    req: Request,
    res: Response<ApiResponse<{ id: string }>>,
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete theme request", { themeId: id });

      if (!id) {
        sendError(res, "Theme ID is required", 400);
        return;
      }

      // Check if theme exists
      const theme = await themeService.getThemeById(id);
      if (!theme) {
        sendError(res, "Theme not found", 404, `Theme with ID ${id} not found`);
        return;
      }

      const deletedTheme = await themeService.deleteTheme(id);

      sendSuccess(res, { id: deletedTheme.id }, 200);
    } catch (error) {
      logger.error("Error in deleteTheme controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete theme");
    }
  }
}

export const themeController = new ThemeController();
