/**
 * Stats calculation utilities for ChildProfile
 * Derives dashboard statistics from ChildProfile data
 */

import {
  ProgressStatus,
  type ChildProfile,
  type Progress,
  type GameSession,
  type SessionCheckpoint,
  type ChallengeAttempt,
  ChallengeStatus,
} from "@shared/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Challenge statistics derived from ChallengeAttempt data
 * Used for displaying challenge/riddle performance metrics
 */
export interface ChallengeStats {
  id: string; // Challenge ID
  totalAttempts: number; // Total number of attempts at this challenge
  solvedAttempts: number; // Number of successful attempts
  successRate: number; // Percentage (0-100)
  isSolved: boolean; // Whether challenge was ever solved successfully
  status: ChallengeStatus // Status of the challenge
  lastAttemptDate?: Date; // Date of most recent attempt
  timeSpentSeconds: number; // Total time spent on this challenge
  hintsUsed: number; // Total hints used across all attempts
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
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate daily reading time entries from child progress data
 * Groups session checkpoints by date and calculates reading duration and story count
 * Creates one TimeEntry per day with activity, sorted chronologically
 *
 * @param progressArray - Array of Progress records (from ChildProfile)
 * @returns Array of TimeEntry sorted by date (ascending)
 */
export function calculateTimeEntries(progressArray: Progress[] | undefined): TimeEntry[] {
  if (!progressArray || !Array.isArray(progressArray) || progressArray.length === 0) {
    return [];
  }

  // Group checkpoints by date (using pausedAt as the checkpoint completion date)
  const checkpointsByDate = new Map<string, SessionCheckpoint[]>();

  for (const progress of progressArray) {
    if (!progress.gameSession?.checkpoints || !Array.isArray(progress.gameSession.checkpoints)) {
      continue;
    }

    for (const checkpoint of progress.gameSession.checkpoints) {
      // Only count completed checkpoints (those with pausedAt set)
      if (!checkpoint.pausedAt) {
        continue;
      }

      // Extract date from pausedAt in YYYY-MM-DD format
      const date = new Date(checkpoint.pausedAt).toISOString().split("T")[0];

      if (!checkpointsByDate.has(date)) {
        checkpointsByDate.set(date, []);
      }
      checkpointsByDate.get(date)!.push(checkpoint);
    }
  }

  // Convert to TimeEntry array
  const timeEntries: TimeEntry[] = Array.from(checkpointsByDate.entries()).map(
    ([date, checkpoints]) => {
      // Calculate total reading time from checkpoints
      const totalSeconds = checkpoints.reduce((sum: number, checkpoint: SessionCheckpoint) => {
        let duration = 0;

        // Use sessionDurationSeconds if available, otherwise calculate from times
        if (checkpoint.sessionDurationSeconds !== null && checkpoint.sessionDurationSeconds !== undefined) {
          duration = checkpoint.sessionDurationSeconds;
        } else if (checkpoint.pausedAt) {
          // Calculate duration from startedAt to pausedAt
          const startMs = new Date(checkpoint.startedAt).getTime();
          const pauseMs = new Date(checkpoint.pausedAt).getTime();
          duration = Math.floor((pauseMs - startMs) / 1000);
        }

        return sum + Math.max(0, duration); // Ensure non-negative duration
      }, 0);

      const minutes = Math.round(totalSeconds / 60);

      // Count unique game sessions (stories) from checkpoints on this date
      const uniqueSessions = new Set(checkpoints.map((cp) => cp.gameSessionId));
      const storiesRead = uniqueSessions.size;

      return {
        date,
        minutes,
        storiesRead,
      };
    }
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
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Calculate average per day (only count days with reading)
  const daysWithReading = timeEntries.filter((entry) => entry.minutes > 0).length;
  const avgMinutesPerDay = daysWithReading > 0 ? Math.round(totalMinutes / daysWithReading) : 0;

  // Calculate total stories
  const totalStories = timeEntries.reduce((sum, entry) => sum + entry.storiesRead, 0);

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
 * Calculate per-challenge statistics from child progress data
 * Groups all challenge attempts by challengeId and calculates metrics for each
 * Filters out challenges with zero attempts
 *
 * @param progressArray - Array of Progress records (from ChildProfile)
 * @returns Array of ChallengeStats sorted by most recent attempt
 */
export function calculateChallengeStats(
  progressArray: Progress[] | undefined
): ChallengeStats[] {
  if (!progressArray || !Array.isArray(progressArray) || progressArray.length === 0) {
    return [];
  }

  // Collect all challenge attempts from all game sessions
  const allAttempts: ChallengeAttempt[] = [];
  for (const progress of progressArray) {
    if (progress.gameSession?.challengeAttempts && Array.isArray(progress.gameSession.challengeAttempts)) {
      allAttempts.push(...progress.gameSession.challengeAttempts);
    }
  }

  if (allAttempts.length === 0) {
    return [];
  }

  // Group attempts by challengeId
  const challengeMap = new Map<string, ChallengeAttempt[]>();
  for (const attempt of allAttempts) {
    const { challengeId } = attempt;
    if (!challengeMap.has(challengeId)) {
      challengeMap.set(challengeId, []);
    }
    challengeMap.get(challengeId)!.push(attempt);
  }

  // Calculate stats for each challenge
  const stats: ChallengeStats[] = [];
  for (const [challengeId, attempts] of challengeMap.entries()) {
    // Get the highest attempt number to determine total attempts
    const totalAttempts = attempts.length > 0 ? Math.max(...attempts.map((a) => a.attemptNumber)) : 0;
    const solvedAttempts = attempts.filter((a) => a.isCorrect === true).length;
    const successRate = totalAttempts > 0 ? Math.round((solvedAttempts / totalAttempts) * 100) : 0;
    const timeSpentSeconds = attempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
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
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastAttemptDate = sortedByDate.length > 0 ? new Date(sortedByDate[0].createdAt) : undefined;

    stats.push({
      id: challengeId,
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
export function getAggregatedChallengeStats(progressArray: Progress[] | undefined) {
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
    totalChallenges > 0 ? Math.round((solvedChallenges / totalChallenges) * 100) : 0;
  const totalAttempts = challengeStats.reduce((sum, c) => sum + c.totalAttempts, 0);
  const avgAttemptsPerChallenge =
    totalChallenges > 0 ? Math.round((totalAttempts / totalChallenges) * 10) / 10 : 0;

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
 * Calculated from session checkpoints - sum of sessionDurationSeconds for completed checkpoints
 * Checkpoints are accessed through Progress → GameSession → SessionCheckpoint
 * @param profile - ChildProfile data
 * @returns Total reading time in minutes
 */
export function getTotalReadingTime(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress)) {
    return 0;
  }

  // Collect all completed checkpoints from progress objects
  const allCheckpoints: SessionCheckpoint[] = [];
  for (const progress of profile.progress) {
    if (!progress.gameSession?.checkpoints || !Array.isArray(progress.gameSession.checkpoints)) {
      continue;
    }

    // Only count checkpoints that have been paused (completed)
    const completedCheckpoints = progress.gameSession.checkpoints.filter(
      (cp) => cp.pausedAt !== null
    );
    allCheckpoints.push(...completedCheckpoints);
  }

  if (allCheckpoints.length === 0) {
    return 0;
  }

  // Calculate total reading time from completed checkpoints
  const totalSeconds = allCheckpoints.reduce((sum: number, checkpoint: SessionCheckpoint) => {
    let duration = 0;

    // Use sessionDurationSeconds if available
    if (checkpoint.sessionDurationSeconds !== null && checkpoint.sessionDurationSeconds !== undefined) {
      duration = checkpoint.sessionDurationSeconds;
    } else if (checkpoint.pausedAt) {
      // Calculate from startedAt to pausedAt
      const startMs = new Date(checkpoint.startedAt).getTime();
      const pauseMs = new Date(checkpoint.pausedAt).getTime();
      duration = Math.floor((pauseMs - startMs) / 1000);
    }

    return sum + Math.max(0, duration);
  }, 0);

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
    if (progress.gameSession?.challengeAttempts && Array.isArray(progress.gameSession.challengeAttempts)) {
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
export function getAverageReadingTimePerDay(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress) || profile.progress.length === 0) {
    return 0;
  }

  // Calculate time entries to get days with reading
  const timeEntries = calculateTimeEntries(profile.progress);

  if (timeEntries.length === 0) {
    return 0;
  }

  const totalMinutes = getTotalReadingTime(profile);
  const daysWithReading = timeEntries.filter((entry) => entry.minutes > 0).length;

  if (daysWithReading === 0) {
    return 0;
  }

  return Math.round(totalMinutes / daysWithReading);
}

/**
 * Get current reading streak (consecutive days)
 * Counts consecutive days from today going backwards where child had at least one completed checkpoint
 * Checkpoints are accessed through Progress → GameSession → SessionCheckpoint
 * @param profile - ChildProfile data
 * @returns Number of consecutive days with reading activity
 */
export function getCurrentStreak(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress) || profile.progress.length === 0) {
    return 0;
  }

  // Collect all completed checkpoints from progress objects
  const allCheckpoints: SessionCheckpoint[] = [];
  for (const progress of profile.progress) {
    if (!progress.gameSession?.checkpoints || !Array.isArray(progress.gameSession.checkpoints)) {
      continue;
    }

    // Only count checkpoints that have been paused (completed)
    const completedCheckpoints = progress.gameSession.checkpoints.filter(
      (cp) => cp.pausedAt !== null
    );
    allCheckpoints.push(...completedCheckpoints);
  }

  if (allCheckpoints.length === 0) {
    return 0;
  }

  // Get unique dates from completed checkpoints using pausedAt
  const checkpointDates = new Set(
    allCheckpoints.map((checkpoint: SessionCheckpoint) => {
      const date = new Date(checkpoint.pausedAt!);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    })
  );

  // Sort dates in descending order
  const sortedDates = Array.from(checkpointDates).sort().reverse();

  if (sortedDates.length === 0) {
    return 0;
  }

  // Count consecutive days from today backwards
  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today has a checkpoint
  const todayString = currentDate.toISOString().split('T')[0];
  const checkingDate = new Date(currentDate);

  // If no checkpoint today, start from yesterday
  if (!checkpointDates.has(todayString)) {
    checkingDate.setDate(checkingDate.getDate() - 1);
  }

  // Count consecutive days
  for (const checkpointDate of sortedDates) {
    const checkingDateString = checkingDate.toISOString().split('T')[0];

    if (checkpointDate === checkingDateString) {
      streak++;
      checkingDate.setDate(checkingDate.getDate() - 1);
    } else if (new Date(checkpointDate) < checkingDate) {
      // Gap found, streak is broken
      break;
    }
  }

  return streak;
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
  };
}
