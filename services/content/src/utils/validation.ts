import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";
import { AgeGroupContentValidationResult, MissingContent } from "@shared/types";


/**
 * Validates that all roadmaps under an age group have complete content
 * (worlds, stories, chapters)
 *
 * Requirements:
 * - Age group must have at least one roadmap
 * - Each roadmap must have at least one world
 * - Each world must have at least one story
 * - Each story must have at least one chapter
 *
 * @param ageGroupId - The ID of the age group to validate
 * @param prisma - The Prisma client instance
 * @returns Validation result with details about missing content
 */
export async function validateAgeGroupContentCompleteness(
  ageGroupId: string,
  prisma: PrismaClient
): Promise<AgeGroupContentValidationResult> {
  const result: AgeGroupContentValidationResult = {
    isComplete: true,
    ageGroupId,
    roadmapsCount: 0,
    completeRoadmapsCount: 0,
    missingContent: [],
    errors: [],
  };

  try {
    // Get age group with all nested relationships
    const ageGroup = await prisma.ageGroup.findUnique({
      where: { id: ageGroupId },
      include: {
        roadmaps: {
          include: {
            theme: true,
            worlds: {
              include: {
                stories: {
                  include: {
                    chapters: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ageGroup) {
      result.isComplete = false;
      result.errors.push("Age group not found");
      return result;
    }

    // Check if age group has at least one roadmap
    if (!ageGroup.roadmaps || ageGroup.roadmaps.length === 0) {
      result.isComplete = false;
      result.errors.push("Age group must have at least one roadmap");
      return result;
    }

    result.roadmapsCount = ageGroup.roadmaps.length;

    // Validate each roadmap
    for (const roadmap of ageGroup.roadmaps) {
      const missing: MissingContent = {
        roadmapId: roadmap.id,
        themeName: roadmap.theme?.name,
        readings: {
          worldsCount: 0,
          storiesCount: 0,
          chaptersCount: 0,
        },
        missingItems: [],
      };

      // Check if roadmap has worlds
      if (!roadmap.worlds || roadmap.worlds.length === 0) {
        result.isComplete = false;
        missing.missingItems.push("No worlds found");
      } else {
        missing.readings.worldsCount = roadmap.worlds.length;

        // Check stories in worlds
        const allStories = roadmap.worlds.flatMap((w) => w.stories);
        if (allStories.length === 0) {
          result.isComplete = false;
          missing.missingItems.push("No stories found in worlds");
        } else {
          missing.readings.storiesCount = allStories.length;

          // Check chapters in stories
          const allChapters = allStories.flatMap((s) => s.chapters);
          if (allChapters.length === 0) {
            result.isComplete = false;
            missing.missingItems.push("No chapters found in stories");
          } else {
            missing.readings.chaptersCount = allChapters.length;
          }
        }
      }

      // Add to missing content if this roadmap is incomplete
      if (missing.missingItems.length > 0) {
        result.missingContent.push(missing);
      } else {
        result.completeRoadmapsCount++;
      }
    }

    return result;
  } catch (error) {
    logger.error("Error validating age group content completeness", {
      ageGroupId,
      error: String(error),
    });
    result.isComplete = false;
    result.errors.push("An error occurred while validating content");
    throw error;
  }
}
