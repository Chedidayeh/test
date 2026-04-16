/**
 * Stats calculation utilities for ChildProfile
 * Derives dashboard statistics from ChildProfile data
 */

import {
  ProgressStatus,
  type ChildProfile,
  type Progress,
  type SessionCheckpoint,
  type ChallengeAttempt,
  ChallengeStatus,
  Local,
  LanguageCode,
  type Story,
  type Chapter,
} from "@readdly/shared-types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Challenge statistics derived from ChallengeAttempt data
 * Used for displaying challenge/riddle performance metrics
 * Includes story and chapter information for identifying context
 */
export interface ChallengeStats {
  id: string; // Challenge ID
  storyId: string; // Story ID (for fetching story name)
  chapterId: string | null; // Chapter ID (for identifying which chapter the challenge is in)
  totalAttempts: number; // Total number of attempts at this challenge
  solvedAttempts: number; // Number of successful attempts
  successRate: number; // Percentage (0-100)
  isSolved: boolean; // Whether challenge was ever solved successfully
  status: ChallengeStatus; // Status of the challenge
  lastAttemptDate?: Date; // Date of most recent attempt
  timeSpentSeconds: number; // Total time spent on this challenge
  hintsUsed: number; // Total hints used across all attempts
}

/**
 * Localized Challenge Statistics with story and chapter titles
 * Extends ChallengeStats with localized story and chapter names based on locale
 */
export interface LocalizedChallengeStats extends ChallengeStats {
  storyTitle: string; // Localized story title
  chapterIndex: number | null; // Chapter order/index within the story
}

/**
 * Daily reading time entry
 * Represents one day's reading activity aggregated from game sessions
 */
export interface TimeEntry {
  date: string; // YYYY-MM-DD format
  minutes: number; // Total reading minutes for that day
  storiesRead: number; // Number of unique stories read that day
}

// ============================================================================
// UTILITY FUNCTIONS - DATE HELPERS
// ============================================================================

/**
 * Convert a Date to YYYY-MM-DD string using LOCAL date components
 * (avoids timezone issues with toISOString which uses UTC)
 * @param date - Date to convert
 * @returns Date string in YYYY-MM-DD format
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Split a checkpoint's duration across multiple calendar days
 * Handles checkpoints that span midnight (e.g., Feb 27 10 PM → Feb 28 1 AM)
 * Distributes sessionDurationSeconds proportionally across all calendar days touched
 *
 * Example:
 *   startedAt: Feb 27 22:00, pausedAt: Feb 28 01:00, duration: 10,800 sec
 *   Result: [{date: "2026-02-27", seconds: 7200}, {date: "2026-02-28", seconds: 3600}]
 *
 * @param checkpoint - SessionCheckpoint with startedAt, pausedAt, and sessionDurationSeconds
 * @returns Array of {date, seconds} allocations, one per calendar day
 */
function splitCheckpointAcrossDays(
  checkpoint: SessionCheckpoint,
): { date: string; seconds: number }[] {
  // If no pausedAt, skip this checkpoint (session still in progress)
  if (!checkpoint.pausedAt) {
    return [];
  }

  const totalSeconds = checkpoint.sessionDurationSeconds;

  // Handle zero-duration sessions
  if (totalSeconds <= 0) {
    return [];
  }

  // Get start and end dates at midnight UTC
  const startDate = new Date(checkpoint.startedAt);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(checkpoint.pausedAt);
  endDate.setUTCHours(0, 0, 0, 0);

  // If same day, return single allocation
  if (startDate.getTime() === endDate.getTime()) {
    return [
      {
        date: formatDateLocal(startDate),
        seconds: totalSeconds,
      },
    ];
  }

  const allocations: { date: string; seconds: number }[] = [];
  const startTime = new Date(checkpoint.startedAt);
  const endTime = new Date(checkpoint.pausedAt);

  // Allocate time for the START day: from startTime to end of that day (23:59:59)
  const endOfStartDay = new Date(startDate);
  endOfStartDay.setUTCDate(endOfStartDay.getUTCDate() + 1);
  endOfStartDay.setUTCMilliseconds(-1); // 23:59:59.999

  const startDaySeconds = Math.floor(
    (endOfStartDay.getTime() - startTime.getTime()) / 1000,
  );
  allocations.push({
    date: formatDateLocal(startDate),
    seconds: Math.max(0, Math.round(startDaySeconds)),
  });

  // Allocate time for FULL days in between
  let dayOffset = 1;
  while (true) {
    const currentDay = new Date(startDate);
    currentDay.setUTCDate(currentDay.getUTCDate() + dayOffset);

    if (currentDay.getTime() >= endDate.getTime()) {
      break;
    }

    allocations.push({
      date: formatDateLocal(currentDay),
      seconds: 86400, // Full day in seconds
    });
    dayOffset += 1;
  }

  // Allocate time for the END day: from start of that day to endTime
  const startOfEndDay = new Date(endDate);
  const endDaySeconds = Math.floor(
    (endTime.getTime() - startOfEndDay.getTime()) / 1000,
  );
  allocations.push({
    date: formatDateLocal(endDate),
    seconds: Math.max(0, Math.round(endDaySeconds)),
  });

  return allocations;
}

// ============================================================================
// UTILITY FUNCTIONS - READING STATS
// ============================================================================

/**
 * Calculate daily reading time entries from child progress data
 * Groups session checkpoints by date and calculates reading duration and story count
 * Creates one TimeEntry per day with activity, sorted chronologically
 *
 * @param progressArray - Array of Progress records (from ChildProfile)
 * @returns Array of TimeEntry sorted by date (ascending)
 */
export function calculateTimeEntries(
  progressArray: Progress[] | undefined,
): TimeEntry[] {
  if (
    !progressArray ||
    !Array.isArray(progressArray) ||
    progressArray.length === 0
  ) {
    return [];
  }

  // Group time allocations and session counts by date
  // Each checkpoint may span multiple days, so we need to track allocations separately
  const timeByDate = new Map<string, number>(); // date -> total seconds
  const sessionsByDate = new Map<string, Set<string>>(); // date -> Set of gameSessionIds

  for (const progress of progressArray) {
    if (
      !progress.gameSession?.checkpoints ||
      !Array.isArray(progress.gameSession.checkpoints)
    ) {
      continue;
    }

    for (const checkpoint of progress.gameSession.checkpoints) {
      // Only count completed checkpoints (those with pausedAt set)
      if (!checkpoint.pausedAt) {
        continue;
      }

      // Split checkpoint duration across multiple calendar days if it spans midnight
      const allocations = splitCheckpointAcrossDays(checkpoint);

      // Distribute checkpoint's time and session across the allocated dates
      for (const allocation of allocations) {
        const { date, seconds } = allocation;

        // Add seconds to this date
        timeByDate.set(date, (timeByDate.get(date) || 0) + seconds);

        // Track unique sessions for this date
        if (!sessionsByDate.has(date)) {
          sessionsByDate.set(date, new Set());
        }
        sessionsByDate.get(date)!.add(checkpoint.gameSessionId);
      }
    }
  }

  // Convert to TimeEntry array
  const timeEntries: TimeEntry[] = Array.from(timeByDate.entries()).map(
    ([date, totalSeconds]) => {
      const minutes = Math.round(totalSeconds / 60);
      const storiesRead = sessionsByDate.get(date)?.size || 0;

      return {
        date,
        minutes,
        storiesRead,
      };
    },
  );

  // Sort by date (ascending - oldest first)
  return timeEntries.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate aggregated time statistics from time entries
 * @param timeEntries - Array of TimeEntry records
 * @returns Object with aggregated time statistics
 */
export function calculateDailyTimeStats(timeEntries: TimeEntry[] | undefined) {
  if (!timeEntries || !Array.isArray(timeEntries) || timeEntries.length === 0) {
    return {
      totalMinutes: 0,
      totalHours: 0,
      avgMinutesPerDay: 0,
      totalStories: 0,
      daysWithReading: 0,
      currentStreak: 0,
    };
  }

  // Calculate total reading time
  const totalMinutes = timeEntries.reduce(
    (sum, entry) => sum + entry.minutes,
    0,
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Calculate average per day (only count days with reading)
  const daysWithReading = timeEntries.filter(
    (entry) => entry.minutes > 0,
  ).length;
  const avgMinutesPerDay =
    daysWithReading > 0 ? Math.round(totalMinutes / daysWithReading) : 0;

  // Calculate total stories
  const totalStories = timeEntries.reduce(
    (sum, entry) => sum + entry.storiesRead,
    0,
  );

  // Calculate current streak (consecutive days with reading from end)
  let currentStreak = 0;
  for (let i = timeEntries.length - 1; i >= 0; i--) {
    if (timeEntries[i].minutes > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalMinutes,
    totalHours,
    avgMinutesPerDay,
    totalStories,
    daysWithReading,
    currentStreak,
  };
}

/**
 * Challenge statistics derived from ChallengeAttempt data
 * Groups all challenge attempts by challengeId and calculates metrics for each
 * Preserves story and chapter context for each challenge
 * Filters out challenges with zero attempts
 *
 * @param progressArray - Array of Progress records (from ChildProfile)
 * @returns Array of ChallengeStats sorted by most recent attempt
 */
export function calculateChallengeStats(
  progressArray: Progress[] | undefined,
): ChallengeStats[] {
  if (
    !progressArray ||
    !Array.isArray(progressArray) ||
    progressArray.length === 0
  ) {
    return [];
  }

  // Collect all challenge attempts with their story and chapter context
  interface AttemptWithContext extends ChallengeAttempt {
    _storyId: string;
    _chapterId: string | null;
  }
  const attemptMap = new Map<string, AttemptWithContext>();

  for (const progress of progressArray) {
    if (
      progress.gameSession?.challengeAttempts &&
      Array.isArray(progress.gameSession.challengeAttempts)
    ) {
      // Attach story and chapter info from parent Progress and GameSession
      for (const attempt of progress.gameSession.challengeAttempts) {
        // Deduplicate by attempt ID - only keep the first occurrence
        if (!attemptMap.has(attempt.id)) {
          (attempt as unknown as AttemptWithContext)._storyId =
            progress.storyId!;
          (attempt as unknown as AttemptWithContext)._chapterId =
            progress.gameSession.chapterId || null;
          attemptMap.set(attempt.id, attempt as unknown as AttemptWithContext);
        }
      }
    }
  }

  const allAttempts = Array.from(attemptMap.values());

  if (allAttempts.length === 0) {
    return [];
  }

  // Group attempts by challengeId, preserving story/chapter context
  interface ChallengeGrouping {
    storyId: string;
    chapterId: string | null;
    attempts: AttemptWithContext[];
  }
  const challengeMap = new Map<string, ChallengeGrouping>();
  for (const attempt of allAttempts) {
    const { challengeId } = attempt;
    if (!challengeMap.has(challengeId)) {
      challengeMap.set(challengeId, {
        storyId: attempt._storyId,
        chapterId: attempt._chapterId,
        attempts: [],
      });
    }
    challengeMap.get(challengeId)!.attempts.push(attempt);
  }

  // Calculate stats for each challenge
  const stats: ChallengeStats[] = [];
  for (const [challengeId, grouping] of challengeMap.entries()) {
    const { storyId, chapterId, attempts } = grouping;

    // Get the highest attempt number to determine total attempts
    const totalAttempts =
      attempts.length > 0
        ? Math.max(...attempts.map((a) => a.attemptNumber))
        : 0;
    const solvedAttempts = attempts.filter((a) => a.isCorrect === true).length;
    const successRate =
      totalAttempts > 0
        ? Math.round((solvedAttempts / totalAttempts) * 100)
        : 0;
    const timeSpentSeconds = attempts.reduce(
      (sum, a) => sum + a.timeSpentSeconds,
      0,
    );
    const hintsUsed = attempts.reduce((sum, a) => sum + a.usedHints, 0);

    // Determine challenge status
    let status: ChallengeStatus = ChallengeStatus.NOT_ATTEMPTED;
    if (solvedAttempts > 0) {
      status = ChallengeStatus.SOLVED;
    } else if (attempts.some((a) => a.status === ChallengeStatus.SKIPPED)) {
      status = ChallengeStatus.SKIPPED;
    } else {
      status = ChallengeStatus.NOT_ATTEMPTED;
    }

    // Get most recent attempt date
    const sortedByDate = [...attempts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const lastAttemptDate =
      sortedByDate.length > 0 ? new Date(sortedByDate[0].createdAt) : undefined;

    stats.push({
      id: challengeId,
      storyId,
      chapterId,
      totalAttempts,
      solvedAttempts,
      successRate,
      isSolved: solvedAttempts > 0,
      status,
      lastAttemptDate,
      timeSpentSeconds,
      hintsUsed,
    });
  }

  // Filter out challenges that haven't been attempted and sort by most recent attempt date (descending)
  return stats
    .filter((stat) => stat.status !== ChallengeStatus.NOT_ATTEMPTED)
    .sort((a, b) => {
      const dateA = a.lastAttemptDate?.getTime() ?? 0;
      const dateB = b.lastAttemptDate?.getTime() ?? 0;
      return dateB - dateA;
    });
}

/**
 * Get total stats for all challenges
 * @param progressArray - Array of Progress records
 * @returns Object with aggregated challenge statistics
 */
export function getAggregatedChallengeStats(
  progressArray: Progress[] | undefined,
) {
  const challengeStats = calculateChallengeStats(progressArray);

  if (challengeStats.length === 0) {
    return {
      totalChallenges: 0,
      solvedChallenges: 0,
      successRate: 0,
      avgAttemptsPerChallenge: 0,
    };
  }

  const totalChallenges = challengeStats.length;
  const solvedChallenges = challengeStats.filter((c) => c.isSolved).length;
  const successRate =
    totalChallenges > 0
      ? Math.round((solvedChallenges / totalChallenges) * 100)
      : 0;
  const totalAttempts = challengeStats.reduce(
    (sum, c) => sum + c.totalAttempts,
    0,
  );
  const avgAttemptsPerChallenge =
    totalChallenges > 0
      ? Math.round((totalAttempts / totalChallenges) * 10) / 10
      : 0;

  return {
    totalChallenges,
    solvedChallenges,
    successRate,
    avgAttemptsPerChallenge,
  };
}

/**
 * Get total stars earned by child
 * @param profile - ChildProfile data
 * @returns Total stars count
 */
export function getTotalStars(profile: ChildProfile | undefined): number {
  return profile?.totalStars || 0;
}

/**
 * Get number of stories completed by child
 * Calculated from progress array where stories have been completed
 * @param profile - ChildProfile data
 * @returns Number of completed stories
 */
export function getStoriesCompleted(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress)) {
    return 0;
  }
  // Count unique stories that have been completed (isCompleted = true)
  const completedStories = new Set(
    profile.progress
      .filter((p: Progress) => p.status === ProgressStatus.COMPLETED)
      .map((p: Progress) => p.storyId),
  );
  return completedStories.size;
}

/**
 * Get total reading time in minutes
 * Calculated by summing the totalTimeSpent field from all Progress records
 * @param profile - ChildProfile data
 * @returns Total reading time in minutes
 */
export function getTotalReadingTime(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress)) {
    return 0;
  }

  // Sum totalTimeSpent (in seconds) from all progress records
  const totalSeconds = profile.progress.reduce(
    (sum: number, progress: Progress) => sum + (progress.totalTimeSpent || 0),
    0,
  );

  return Math.round(totalSeconds / 60);
}

/**
 * Get number of riddles solved/challenges completed
 * Calculated from challengeAttempts where challenges were solved correctly
 * Challenge attempts are accessed through Progress → GameSession → ChallengeAttempt
 * @param profile - ChildProfile data
 * @returns Number of solved challenges/riddles
 */
export function getRiddlesSolved(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress)) {
    return 0;
  }

  // Collect all challenge attempts from game sessions
  const allAttempts: ChallengeAttempt[] = [];
  for (const progress of profile.progress) {
    if (
      progress.gameSession?.challengeAttempts &&
      Array.isArray(progress.gameSession.challengeAttempts)
    ) {
      allAttempts.push(...progress.gameSession.challengeAttempts);
    }
  }

  if (allAttempts.length === 0) {
    return 0;
  }

  // Count unique challenges that were solved correctly (isCorrect = true)
  const solvedChallenges = new Set(
    allAttempts
      .filter((attempt: ChallengeAttempt) => attempt.isCorrect === true)
      .map((attempt: ChallengeAttempt) => attempt.challengeId),
  );
  return solvedChallenges.size;
}

/**
 * Get current reading level
 * @param profile - ChildProfile data
 * @returns Current level number
 */
export function getCurrentLevel(profile: ChildProfile | undefined): number {
  return profile?.currentLevel || 1;
}

/**
 * Get number of badges earned
 * @param profile - ChildProfile data
 * @returns Number of badges
 */
export function getBadgesCount(profile: ChildProfile | undefined): number {
  if (!profile?.badges || !Array.isArray(profile.badges)) {
    return 0;
  }
  return profile.badges.length;
}

/**
 * Get average reading time per day
 * Calculated as total reading time divided by number of calendar days with checkpoints
 * Checkpoints are accessed through Progress → GameSession → SessionCheckpoint
 * @param profile - ChildProfile data
 * @returns Average reading time in minutes per day
 */
export function getAverageReadingTimePerDay(
  profile: ChildProfile | undefined,
): number {
  if (
    !profile?.progress ||
    !Array.isArray(profile.progress) ||
    profile.progress.length === 0
  ) {
    return 0;
  }

  // Calculate time entries to get days with reading
  const timeEntries = calculateTimeEntries(profile.progress);

  if (timeEntries.length === 0) {
    return 0;
  }

  const totalMinutes = getTotalReadingTime(profile);
  const daysWithReading = timeEntries.filter(
    (entry) => entry.minutes > 0,
  ).length;

  if (daysWithReading === 0) {
    return 0;
  }

  return Math.round(totalMinutes / daysWithReading);
}

/**
 * Get current reading streak (consecutive days)
 * Counts consecutive days from end of time entries backwards where child had reading activity
 * Uses same logic as calculateDailyTimeStats for consistency
 * @param profile - ChildProfile data
 * @returns Number of consecutive days with reading activity
 */
export function getCurrentStreak(profile: ChildProfile | undefined): number {
  if (
    !profile?.progress ||
    !Array.isArray(profile.progress) ||
    profile.progress.length === 0
  ) {
    return 0;
  }

  // Calculate time entries from progress (same as other stats functions)
  const timeEntries = calculateTimeEntries(profile.progress);

  if (!timeEntries || timeEntries.length === 0) {
    return 0;
  }

  // Count consecutive days with reading from end backwards
  let streak = 0;
  for (let i = timeEntries.length - 1; i >= 0; i--) {
    if (timeEntries[i].minutes > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get total number of unique calendar days child has been reading since joining platform
 * Counts days where child had at least 1 second of reading time (sessionDurationSeconds > 0)
 * Includes all historical data across entire profile
 * @param profile - ChildProfile data
 * @returns Number of days with reading activity (all-time)
 */
export function getTotalDaysReadAllTime(
  profile: ChildProfile | undefined,
): number {
  if (
    !profile?.progress ||
    !Array.isArray(profile.progress) ||
    profile.progress.length === 0
  ) {
    return 0;
  }

  // Calculate all time entries across entire history
  const timeEntries = calculateTimeEntries(profile.progress);

  if (timeEntries.length === 0) {
    return 0;
  }

  // Count days where child had at least 1 minute of reading (minutes > 0)
  const daysWithReading = timeEntries.filter(
    (entry) => entry.minutes > 0,
  ).length;

  return daysWithReading;
}

/**
 * Get total number of calendar days since child joined platform (inclusive)
 * Calculates from profile.createdAt to today
 * Example: If joined 100 days ago, returns 100 (inclusive)
 * @param profile - ChildProfile data
 * @returns Total calendar days since joining (including today)
 */
export function getTotalDaysSinceJoining(
  profile: ChildProfile | undefined,
): number {
  if (!profile?.createdAt) {
    return 0;
  }

  // Get creation date and set to start of day (00:00:00)
  const createdDate = new Date(profile.createdAt);
  createdDate.setHours(0, 0, 0, 0);

  // Get today's date at start of day (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days difference in milliseconds, convert to days, add 1 for inclusive count
  const daysDifference = Math.floor(
    (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Add 1 to make inclusive (if joined today, it's day 1, not day 0)
  return daysDifference + 1;
}

/**
 * Get reading activity rate as ratio and percentage
 * Shows how many days child has read out of total days since joining platform
 * Useful metric for engagement tracking
 * @param profile - ChildProfile data
 * @returns Object with daysRead, totalDays, and percentage
 */
export function getReadingActivityRate(profile: ChildProfile | undefined): {
  daysRead: number;
  totalDays: number;
  percentage: number;
} {
  const daysRead = getTotalDaysReadAllTime(profile);
  const totalDays = getTotalDaysSinceJoining(profile);

  // Avoid division by zero
  const percentage =
    totalDays > 0 ? Math.round((daysRead / totalDays) * 100) : 0;

  return {
    daysRead,
    totalDays,
    percentage,
  };
}

/**
 * Format reading time from minutes to human-readable format
 * Examples: "30 mins", "1 hr 33 mins", "2 hrs 15 mins"
 * @param minutes - Total reading time in minutes
 * @returns Formatted time string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  const hourLabel = hours === 1 ? "hr" : "hrs";

  if (remainingMins === 0) {
    return `${hours} ${hourLabel}`;
  }

  return `${hours} ${hourLabel} ${remainingMins} mins`;
}

// ============================================================================
// DATE RANGE FILTERING
// ============================================================================

/**
 * Time range selection type
 * Used for filtering daily reading time entries
 */
export interface TimeRange {
  startDate: Date;
  endDate: Date;
  label?: string;
}

/**
 * Preset date range options for quick selection
 * All ranges include TODAY as the end date
 * Examples (if today is March 1, 2026):
 *   - Last 3 Days:  Feb 27 → Mar 1 (3 days including today)
 *   - Last 7 Days:  Feb 23 → Mar 1 (7 days including today)
 *   - Last 30 Days: Feb 1 → Mar 1 (30 days including today)
 * @returns Object with preset ranges keyed by label
 */
export function getDateRangePresets(): Record<string, TimeRange> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Last 3 Days: Today and 2 days before = 3 days total
  const last3Days = new Date(today);
  last3Days.setDate(today.getDate() - 2);

  // Last 7 Days: Today and 6 days before = 7 days total
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 6);

  // Last 30 Days: Today and 29 days before = 30 days total
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 29);

  return {
    last3Days: {
      startDate: last3Days,
      endDate: today,
      label: "Last 3 Days",
    },
    last7Days: {
      startDate: last7Days,
      endDate: today,
      label: "Last 7 Days",
    },
    last30Days: {
      startDate: last30Days,
      endDate: today,
      label: "Last 30 Days",
    },
  };
}

/**
 * Filter time entries by date range (inclusive)
 * @param timeEntries - Array of TimeEntry records
 * @param startDate - Range start date (inclusive)
 * @param endDate - Range end date (inclusive)
 * @returns Filtered TimeEntry array
 */
export function filterTimeEntriesByRange(
  timeEntries: TimeEntry[],
  startDate: Date,
  endDate: Date,
): TimeEntry[] {
  const startStr = formatDateLocal(startDate);
  const endStr = formatDateLocal(endDate);

  return timeEntries.filter(
    (entry) => entry.date >= startStr && entry.date <= endStr,
  );
}

/**
 * Generate array of all dates in a range (YYYY-MM-DD format)
 * Used to fill gaps in the daily reading table
 * Uses LOCAL date components to avoid timezone issues
 * @param startDate - Range start date
 * @param endDate - Range end date
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function generateDateRangeArray(
  startDate: Date,
  endDate: Date,
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(formatDateLocal(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Fill time entries with all dates in range, using "-" for data-less days
 * @param timeEntries - Array of actual TimeEntry records
 * @param startDate - Range start date
 * @param endDate - Range end date
 * @returns Array of TimeEntry with all dates in range (gaps filled)
 */
export function fillTimeEntriesGaps(
  timeEntries: TimeEntry[],
  startDate: Date,
  endDate: Date,
): TimeEntry[] {
  const allDates = generateDateRangeArray(startDate, endDate);
  const entriesByDate = new Map(
    timeEntries.map((entry) => [entry.date, entry]),
  );

  return allDates.map((date) => {
    if (entriesByDate.has(date)) {
      return entriesByDate.get(date)!;
    }
    return {
      date,
      minutes: 0, // 0 represents no data for this day
      storiesRead: 0,
    };
  });
}

/**
 * Get all dashboard stats in one call
 * @param profile - ChildProfile data
 * @returns Object with all calculated stats
 */
export function getAllStats(profile: ChildProfile | undefined) {
  return {
    totalStars: getTotalStars(profile),
    storiesCompleted: getStoriesCompleted(profile),
    totalReadingTime: getTotalReadingTime(profile),
    averageReadingTimePerDay: getAverageReadingTimePerDay(profile),
    currentStreak: getCurrentStreak(profile),
    riddlesSolved: getRiddlesSolved(profile),
    currentLevel: getCurrentLevel(profile),
    badgesCount: getBadgesCount(profile),
    readingActivityRate: getReadingActivityRate(profile),
  };
}

// ============================================================================
// LOCALIZATION HELPERS
// ============================================================================

/**
 * Get localized story title based on locale
 * Falls back to original title if translation not found
 *
 * @param story - Story object with optional translations
 * @param locale - Locale string (e.g., 'en', 'ar', 'fr')
 * @returns Localized story title
 */
export function getLocalizedStoryTitle(
  story: Story | undefined,
  locale?: string,
): string {
  if (!story) return "Unknown Story";

  // Convert locale to language code (en → EN, ar → AR, fr → FR)
  const baseLocale = (locale || Local.EN).split("-")[0].toUpperCase();
  const langCode = baseLocale as keyof typeof LanguageCode;

  // Try to find translation for current locale
  const translation = story.translations?.find(
    (t) => t.languageCode === langCode,
  );
  return translation?.title || story.title;
}

/**
 * Localize challenge statistics with story and chapter titles
 * Merges ChallengeStats with localized story/chapter information
 *
 * @param challengeStats - Array of ChallengeStats without localized titles
 * @param stories - Array of Story objects (for lookup)
 * @param locale - Current locale string (e.g., 'en', 'ar', 'fr')
 * @returns Array of LocalizedChallengeStats with story/chapter titles
 */
export function localizeChallengStats(
  challengeStats: ChallengeStats[],
  stories: Story[],
  locale?: string,
): LocalizedChallengeStats[] {
  return challengeStats.map((stat) => {
    // Find the story for this challenge
    const story = stories.find((s) => s.id === stat.storyId);
    const storyTitle = getLocalizedStoryTitle(story, locale);

    // Determine chapter index (order) if available
    let chapterIndex: number | null = null;
    if (story?.chapters) {
      const chapter = story.chapters.find(
        (c) => c.id === stat.chapterId || c.challenge?.id === stat.id,
      );
      if (chapter) chapterIndex = chapter.order ?? null;
    }

    return {
      ...stat,
      storyTitle,
      chapterIndex,
    };
  });
}

/**
 * Batch localize challenge statistics for efficient rendering
 * Useful for tables/lists of challenges with locale-aware names
 *
 * @param challengeStats - Array of ChallengeStats
 * @param storiesMap - Map of story ID → Story object (for fast lookup)
 * @param chaptersMap - Map of chapter ID → Chapter object (for fast lookup)
 * @param locale - Current locale string
 * @returns Array of LocalizedChallengeStats with localized titles
 */
export function localizeChallengStatsWithMaps(
  challengeStats: ChallengeStats[],
  storiesMap: Map<string, Story>,
  locale?: string,
): LocalizedChallengeStats[] {
  return challengeStats.map((stat) => {
    const story = storiesMap.get(stat.storyId);
    const storyTitle = getLocalizedStoryTitle(story, locale);

    let chapterIndex: number | null = null;
    if (story?.chapters) {
      const chapter = story.chapters.find(
        (c) => c.id === stat.chapterId || c.challenge?.id === stat.id,
      );
      if (chapter) chapterIndex = chapter.order ?? null;
    }

    return {
      ...stat,
      storyTitle,
      chapterIndex,
    };
  });
}

// ============================================================================
// INACTIVITY REMINDER HELPERS
// ============================================================================

/**
 * Calculate days since child's last reading activity
 * @param profile - ChildProfile data
 * @returns Number of days since lastActiveAt, or null if no activity data
 */
export function getDaysSinceLastRead(
  profile: ChildProfile | undefined,
): number | null {
  if (!profile?.dailyActivity?.lastActiveAt) {
    return null;
  }

  const lastActive = new Date(profile.dailyActivity.lastActiveAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastActive.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Determine if inactivity reminder should be displayed
 * Shows when child hasn't read for more than their ideal session frequency
 * @param profile - ChildProfile data
 * @returns true if reminder should display, false otherwise
 */
export function shouldShowInactivityReminder(
  profile: ChildProfile | undefined,
): boolean {
  if (!profile) return false;

  const daysSince = getDaysSinceLastRead(profile);
  if (daysSince === null) return false;

  // Calculate expected interval: 7 days / sessionsPerWeek
  const sessionsPerWeek = profile.sessionsPerWeek || 3;
  const expectedIntervalDays = 7 / sessionsPerWeek;

  return daysSince > expectedIntervalDays;
}

/**
 * Calculate weekly reading session progress
 * @param profile - ChildProfile data
 * @returns Object with sessionsThisWeek, sessionsNeeded, and percentage
 */
export function getWeeklySessionProgress(
  profile: ChildProfile | undefined,
): { sessionsThisWeek: number; sessionsNeeded: number; percentage: number } {
  if (!profile?.progress || !Array.isArray(profile.progress)) {
    return {
      sessionsThisWeek: 0,
      sessionsNeeded: profile?.sessionsPerWeek || 3,
      percentage: 0,
    };
  }

  // Get current week's date range (Monday to Sunday)
  const today = new Date();
  const currentDay = today.getDay();
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  // Count unique days with reading activity in current week
  const daysWithReading = new Set<string>();

  for (const progress of profile.progress) {
    if (
      progress.gameSession?.checkpoints &&
      Array.isArray(progress.gameSession.checkpoints)
    ) {
      for (const checkpoint of progress.gameSession.checkpoints) {
        if (checkpoint.pausedAt) {
          const pausedDate = new Date(checkpoint.pausedAt);
          pausedDate.setHours(0, 0, 0, 0);

          if (pausedDate >= weekStart && pausedDate <= today) {
            daysWithReading.add(formatDateLocal(pausedDate));
          }
        }
      }
    }
  }

  const sessionsThisWeek = daysWithReading.size;
  const sessionsNeeded = profile.sessionsPerWeek || 3;
  const percentage =
    sessionsNeeded > 0
      ? Math.round((sessionsThisWeek / sessionsNeeded) * 100)
      : 0;

  return { sessionsThisWeek, sessionsNeeded, percentage };
}