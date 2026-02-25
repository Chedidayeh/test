import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Theme } from "../types";

export class ThemeService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all themes
   */
  async getThemes(): Promise<Theme[]> {
    try {
      const themes = await this.prisma.theme.findMany({
        include: {
          roadmap: true,
        },
      });

      logger.info("Themes retrieved successfully", {
        count: themes.length,
      });

      return themes as Theme[];
    } catch (error) {
      logger.error("Error fetching themes", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single theme by ID
   */
  async getThemeById(themeId: string): Promise<Theme | null> {
    try {
      const theme = await this.prisma.theme.findUnique({
        where: { id: themeId },
        include: {
          roadmap: true,
        },
      });

      if (!theme) {
        logger.warn("Theme not found", { themeId });
        return null;
      }

      logger.info("Theme retrieved successfully", { themeId });
      return theme as Theme;
    } catch (error) {
      logger.error("Error fetching theme", { error: String(error), themeId });
      throw error;
    }
  }

  /**
   * Get theme by name (for duplicate checking)
   */
  async getThemeByName(name: string): Promise<Theme | null> {
    try {
      const theme = await this.prisma.theme.findUnique({
        where: { name },
        include: {
          roadmap: true,
        },
      });

      return theme as Theme | null;
    } catch (error) {
      logger.error("Error fetching theme by name", {
        name,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new theme
   */
  async createTheme(data: {
    name: string;
    description: string;
    imageUrl?: string | null;
  }): Promise<Theme> {
    try {
      logger.info("Creating theme", { name: data.name });

      const theme = await this.prisma.theme.create({
        data,
        include: {
          roadmap: true,
        },
      });

      logger.info("Theme created successfully", {
        themeId: theme.id,
        name: theme.name,
      });

      return theme as Theme;
    } catch (error) {
      logger.error("Error creating theme", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing theme
   */
  async updateTheme(
    themeId: string,
    data: Partial<{
      name: string;
      description: string;
      imageUrl: string | null;
    }>
  ): Promise<Theme> {
    try {
      logger.info("Updating theme", { themeId });

      const theme = await this.prisma.theme.update({
        where: { id: themeId },
        data,
        include: {
          roadmap: true,
        },
      });

      logger.info("Theme updated successfully", { themeId });
      return theme as Theme;
    } catch (error) {
      logger.error("Error updating theme", {
        themeId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a theme (cascades roadmap if it has dependent data)
   */
  async deleteTheme(themeId: string): Promise<Theme> {
    try {
      logger.info("Deleting theme", { themeId });

      const theme = await this.prisma.theme.delete({
        where: { id: themeId },
      });

      logger.info("Theme deleted successfully", {
        themeId,
        name: theme.name,
      });

      return theme as Theme;
    } catch (error) {
      logger.error("Error deleting theme", {
        themeId,
        error: String(error),
      });
      throw error;
    }
  }
}
