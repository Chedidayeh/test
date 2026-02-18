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
}
