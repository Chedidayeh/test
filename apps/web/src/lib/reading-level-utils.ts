import { ReadingLevel } from "@shared/types";

/**
 * Get the translated label for a ReadingLevel enum value
 * Uses the translation keys from RoadmapsLibrary.filterPanel.readingLevels
 * 
 * @param level - ReadingLevel enum value
 * @param t - Translation function from useTranslations("RoadmapsLibrary.filterPanel")
 * @returns Translated label for the reading level
 */
export function getReadingLevelLabel(
  level: ReadingLevel | string,
  t: (key: string) => string
): string {
  const levelKey = `readingLevels.${level}`;
  return t(levelKey);
}

/**
 * Get all reading levels with their translated labels
 * 
 * @param t - Translation function from useTranslations("RoadmapsLibrary.filterPanel")
 * @returns Array of objects with value and label for reading levels
 */
export function getReadingLevelOptions(
  t: (key: string) => string
): Array<{ value: ReadingLevel; label: string }> {
  return Object.values(ReadingLevel).map((level) => ({
    value: level as ReadingLevel,
    label: getReadingLevelLabel(level, t),
  }));
}
