import { ChildProfile } from "@readdly/shared-types";

export interface DailySessionData {
  date: string;
  boys: number;
  girls: number;
}

export interface DailySessionSummary {
  date: string;
  totalChildren: number;
}

/**
 * Determine if a child is male based on gender value
 * Handles various gender formats: boy, male, m
 */
function isMale(gender: string | null | undefined): boolean {
  if (!gender) return false;
  const normalized = gender.toLowerCase();
  return normalized === "m" || normalized === "male" || normalized === "boy";
}

/**
 * Determine if a child is female based on gender value
 * Handles various gender formats: girl, female, f
 */
function isFemale(gender: string | null | undefined): boolean {
  if (!gender) return false;
  const normalized = gender.toLowerCase();
  return normalized === "f" || normalized === "female" || normalized === "girl";
}

/**
 * Transform children profiles into daily session insights grouped by gender
 * Groups active game sessions by date and counts unique children per gender
 *
 * @param childrenProfiles - Array of child profiles with progress/sessions
 * @returns Array of daily aggregated data { date, boys, girls }
 */
export function transformChildrenToSessionData(
  childrenProfiles: ChildProfile[]
): DailySessionData[] {
  // Map to track unique children per day by gender
  const sessionsByDate = new Map<string, { boys: Set<string>; girls: Set<string> }>();

  // Process each child's progress records
  childrenProfiles.forEach((child) => {
    if (!child.progress || child.progress.length === 0) return;

    child.progress.forEach((progress) => {
      if (!progress.gameSession) return;

      // Get the session start date
      const sessionDate = progress.gameSession.startedAt
        ? new Date(progress.gameSession.startedAt)
        : null;

      if (!sessionDate) return;

      // Format date as YYYY-MM-DD
      const dateKey = sessionDate.toISOString().split("T")[0];

      // Initialize date entry if not exists
      if (!sessionsByDate.has(dateKey)) {
        sessionsByDate.set(dateKey, { boys: new Set(), girls: new Set() });
      }

      // Determine gender and add to set (Set prevents duplicates)
      const genderEntry = sessionsByDate.get(dateKey)!;

      if (isMale(child.gender)) {
        genderEntry.boys.add(child.id);
      } else if (isFemale(child.gender)) {
        genderEntry.girls.add(child.id);
      }
    });
  });

  // Convert map to sorted array of DailySessionData
  const result: DailySessionData[] = Array.from(sessionsByDate.entries())
    .map(([date, genders]) => ({
      date,
      boys: genders.boys.size,
      girls: genders.girls.size,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
}

/**
 * Transform daily session data by combining boys and girls into total children count
 *
 * @param data - Daily session data array with gender separation
 * @returns Array of daily summaries with combined children count
 */
export function combinedGenderData(data: DailySessionData[]): DailySessionSummary[] {
  return data.map((item) => ({
    date: item.date,
    totalChildren: item.boys + item.girls,
  }));
}

/**
 * Filter session data by time range (days back from today)
 * Generates all dates in the range and fills missing dates with 0s
 *
 * @param data - Daily session summary array
 * @param daysBack - Number of days to include (7, 30, or 90)
 * @returns Filtered data for the specified range with all dates included
 */
export function filterByTimeRange(
  data: DailySessionSummary[],
  daysBack: number
): DailySessionSummary[] {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysBack);
  startDate.setHours(0, 0, 0, 0);

  // Create a map of existing data by date for quick lookup
  const dataMap = new Map(data.map((item) => [item.date, item]));

  // Generate all dates in the range
  const allDates: DailySessionSummary[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split("T")[0];
    
    // Use existing data if available, otherwise create entry with 0
    allDates.push(
      dataMap.get(dateKey) || {
        date: dateKey,
        totalChildren: 0,
      }
    );

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return allDates;
}
