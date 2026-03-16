import { Request, Response } from "express";
import {
  ApiResponse,
  Chapter,
  ChapterTranslation,
  LanguageCode,
} from "@shared/src/types";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function updateChapterAudio(
  req: Request,
  res: Response<ApiResponse<any>>,
) {
  try {
    const { chapterId } = req.params;
    const { audioUrl, challengeAudioUrl, languageCode } = req.body;

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
      logger.info("Checking if chapter translation exists", {
        chapterId,
        languageCode,
      });

      // Check if translation record exists
      const existingTranslation = await prisma.chapterTranslation.findUnique({
        where: {
          chapterId_languageCode: {
            chapterId,
            languageCode: languageCode as LanguageCode,
          },
        },
      });

      if (existingTranslation) {
        // Translation record exists, update it
        logger.info("Updating existing chapter translation audio", {
          chapterId,
          languageCode,
        });

        const updatedTranslation = await prisma.chapterTranslation.update({
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

        if (challengeAudioUrl) {
          const challenge = await prisma.challenge.findUnique({
            where: {
              chapterId: chapterId,
            },
          });
          if (challenge) {
            const existingChallengeTranslation =
              await prisma.challengeTranslation.findUnique({
                where: {
                  challengeId_languageCode: {
                    challengeId: challenge.id,
                    languageCode: languageCode as LanguageCode,
                  },
                },
              });

            if (existingChallengeTranslation) {
              await prisma.challengeTranslation.update({
                where: {
                  challengeId_languageCode: {
                    challengeId: challenge.id,
                    languageCode: languageCode as LanguageCode,
                  },
                },
                data: {
                  audioUrl: challengeAudioUrl,
                },
              });
            }
          }
        }

        return res.status(200).json({
          success: true,
          data: updatedTranslation,
          timestamp: new Date(),
        });
      } else {
        // No translation record exists, update base chapter instead
        logger.info(
          "No translation record found for languageCode, updating base chapter audio",
          {
            chapterId,
            languageCode,
          },
        );

        const chapter = await prisma.chapter.update({
          where: { id: chapterId },
          data: {
            audioUrl,
          },
        });

        if (challengeAudioUrl) {
          const challenge = await prisma.challenge.update({
            where: {
              chapterId: chapterId,
            },
            data: {
              audioUrl: challengeAudioUrl,
            },
          });
        }

        return res.status(200).json({
          success: true,
          data: chapter,
          timestamp: new Date(),
        });
      }
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

      if (challengeAudioUrl) {
        const challenge = await prisma.challenge.update({
          where: {
            chapterId: chapterId,
          },
          data: {
            audioUrl: challengeAudioUrl,
          },
        });
      }

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
