/**
 * Stats calculation utilities for ChildProfile
 * Derives dashboard statistics from ChildProfile data
 */

import {
  ProgressStatus,
  type ChildProfile,
  type Progress,
  type GameSession,
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
 * Groups game sessions by date and calculates reading duration and story count
 * Creates one TimeEntry per day with activity, sorted chronologically
 *
 * @param progressArray - Array of Progress records (from ChildProfile)
 * @returns Array of TimeEntry sorted by date (ascending)
 */
export function calculateTimeEntries(progressArray: Progress[] | undefined): TimeEntry[] {
  if (!progressArray || !Array.isArray(progressArray) || progressArray.length === 0) {
    return [];
  }

  // Group game sessions by date
  const sessionsByDate = new Map<string, GameSession[]>();

  for (const progress of progressArray) {
    if (progress.gameSession) {
      const session = progress.gameSession;
      // Extract date from startedAt in YYYY-MM-DD format
      const date = new Date(session.startedAt).toISOString().split("T")[0];

      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, []);
      }
      sessionsByDate.get(date)!.push(session);
    }
  }

  // Convert to TimeEntry array
  const timeEntries: TimeEntry[] = Array.from(sessionsByDate.entries()).map(
    ([date, sessions]) => {
      // Calculate total reading time for the day
      const totalMinutes = sessions.reduce((sum: number, session: GameSession) => {
        // Use endedAt if available, otherwise use checkpointAt
        const endTime = session.endedAt || session.checkpointAt;

        if (endTime) {
          const startTime = new Date(session.startedAt).getTime();
          const endTimeMs = new Date(endTime).getTime();
          const durationSeconds = Math.floor((endTimeMs - startTime) / 1000);
          const durationMinutes = Math.round(durationSeconds / 60);
          return sum + Math.max(0, durationMinutes); // Ensure positive duration
        }
        return sum;
      }, 0);

      // Count unique stories read that day
      const uniqueStories = new Set(sessions.map((session) => session.storyId));
      const storiesRead = uniqueStories.size;

      return {
        date,
        minutes: totalMinutes,
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
 * Calculated from game sessions - sum of duration between startedAt and endedAt (or checkpointAt if no endedAt)
 * Sessions are accessed through Progress → GameSession
 * @param profile - ChildProfile data
 * @returns Total reading time in minutes
 */
export function getTotalReadingTime(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress)) {
    return 0;
  }
  
  // Collect all game sessions from progress objects
  const allSessions: GameSession[] = [];
  for (const progress of profile.progress) {
    if (progress.gameSession) {
      allSessions.push(progress.gameSession);
    }
  }
  
  if (allSessions.length === 0) {
    return 0;
  }
  
  // Calculate total reading time from session start and end times
  const totalSeconds = allSessions.reduce((sum: number, session: GameSession) => {
    // Use endedAt if available, otherwise use checkpointAt
    const endTime = session.endedAt || session.checkpointAt;
    
    if (endTime) {
      const startTime = new Date(session.startedAt).getTime();
      const endTimeMs = new Date(endTime).getTime();
      const durationMs = endTimeMs - startTime;
      const durationSeconds = Math.floor(durationMs / 1000);
      return sum + Math.max(0, durationSeconds); // Ensure positive duration
    }
    // If neither endedAt nor checkpointAt exist, don't count it
    return sum;
  }, 0);
  // Convert seconds to minutes
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
 * Calculated as total reading time divided by number of days since first session
 * Sessions are accessed through Progress → GameSession
 * @param profile - ChildProfile data
 * @returns Average reading time in minutes per day
 */
export function getAverageReadingTimePerDay(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress) || profile.progress.length === 0) {
    return 0;
  }

  // Collect all game sessions from progress objects
  const allSessions: GameSession[] = [];
  for (const progress of profile.progress) {
    if (progress.gameSession) {
      allSessions.push(progress.gameSession);
    }
  }
  
  if (allSessions.length === 0) {
    return 0;
  }

  const totalMinutes = getTotalReadingTime(profile);
  
  // Get first and last session dates
  const sortedSessions = [...allSessions].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );
  
  const firstSessionDate = new Date(sortedSessions[0].startedAt);
  const lastSessionDate = new Date(sortedSessions[sortedSessions.length - 1].startedAt);
  
  // Calculate number of days between first and last session (inclusive)
  const daysDiff = Math.floor((lastSessionDate.getTime() - firstSessionDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Avoid division by zero
  if (daysDiff === 0) {
    return totalMinutes;
  }
  
  return Math.round(totalMinutes / daysDiff);
}

/**
 * Get current reading streak (consecutive days)
 * Counts consecutive days from today going backwards where child had at least one session
 * Sessions are accessed through Progress → GameSession
 * @param profile - ChildProfile data
 * @returns Number of consecutive days with reading activity
 */
export function getCurrentStreak(profile: ChildProfile | undefined): number {
  if (!profile?.progress || !Array.isArray(profile.progress) || profile.progress.length === 0) {
    return 0;
  }

  // Collect all game sessions from progress objects
  const allSessions: GameSession[] = [];
  for (const progress of profile.progress) {
    if (progress.gameSession) {
      allSessions.push(progress.gameSession);
    }
  }
  
  if (allSessions.length === 0) {
    return 0;
  }

  // Get unique dates from sessions (normalize to dates only, ignoring time)
  const sessionDates = new Set(
    allSessions.map((session: GameSession) => {
      const date = new Date(session.startedAt);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    })
  );

  // Sort dates in descending order
  const sortedDates = Array.from(sessionDates).sort().reverse();

  // Count consecutive days from today backwards
  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today has a session
  const todayString = currentDate.toISOString().split('T')[0];
  const checkingDate = new Date(currentDate);

  // If no session today, start from yesterday
  if (!sessionDates.has(todayString)) {
    checkingDate.setDate(checkingDate.getDate() - 1);
  }

  // Count consecutive days
  for (const sessionDate of sortedDates) {
    const checkingDateString = checkingDate.toISOString().split('T')[0];
    
    if (sessionDate === checkingDateString) {
      streak++;
      checkingDate.setDate(checkingDate.getDate() - 1);
    } else if (new Date(sessionDate) < checkingDate) {
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
