import { Request, Response } from "express";
import { ApiResponse, Chapter, ChapterTranslation, LanguageCode } from "@shared/types";
import { logger } from "src/utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function updateChapterAudio(req: Request, 
    res: Response<ApiResponse<any>>
) {
  try {
    const { chapterId } = req.params;
    const { audioUrl, languageCode } = req.body;

    if (!chapterId || typeof chapterId !== "string") {
      logger.warn("Missing or invalid chapterId param");
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAM",
          message: "Missing or invalid 'chapterId' param",
        },
        timestamp: new Date(),
      });
    }

    if (!audioUrl || typeof audioUrl !== "string") {
      logger.warn("Missing or invalid audioUrl in body");
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAM",
          message: "Missing or invalid 'audioUrl' in body",
        },
        timestamp: new Date(),
      });
    }

    // Update translation-specific audio if languageCode is provided
    if (languageCode && Object.values(LanguageCode).includes(languageCode)) {
      logger.info("Updating chapter translation audio", {
        chapterId,
        languageCode,
      });

      const translation = await prisma.chapterTranslation.update({
        where: {
          chapterId_languageCode: {
            chapterId,
            languageCode: languageCode as LanguageCode,
          },
        },
        data: {
          audioUrl,
        },
      });
      

      if (!translation) {
        logger.error(
          "Chapter translation not found for given chapterId and languageCode",
          {
            chapterId,
            languageCode,
          },
        );
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message:
              "Chapter translation not found for given chapterId and languageCode",
          },
          timestamp: new Date(),
        });
      }
      

      return res.status(200).json({
        success: true,
        data: translation,
        timestamp: new Date(),
      });
    } else {
      // Update base chapter audio if no languageCode provided
      logger.info("Updating chapter base audio", {
        chapterId,
      });

      const chapter = await prisma.chapter.update({
        where: { id: chapterId },
        data: {
          audioUrl,
        },
      });

      return res.status(200).json({
        success: true,
        data: chapter,
        timestamp: new Date(),
      });
    }
  } catch (err: any) {
    logger.error("Error updating chapter audio", { error: err });
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err?.message || "Internal error",
      },
      timestamp: new Date(),
    });
  }
}
