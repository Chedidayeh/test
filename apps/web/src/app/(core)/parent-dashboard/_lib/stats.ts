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
} from "@shared/types";

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
 * Calculated from sessions array - sum of duration between startedAt and endedAt (or checkpointAt if no endedAt)
 * @param profile - ChildProfile data
 * @returns Total reading time in minutes
 */
export function getTotalReadingTime(profile: ChildProfile | undefined): number {
  if (!profile?.sessions || !Array.isArray(profile.sessions)) {
    return 0;
  }
  // Calculate total reading time from session start and end times
  const totalSeconds = profile.sessions.reduce((sum: number, session: GameSession) => {
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
 * Calculated from challengeAttempts array where challenges were solved correctly
 * @param profile - ChildProfile data
 * @returns Number of solved challenges/riddles
 */
export function getRiddlesSolved(profile: ChildProfile | undefined): number {
  if (
    !profile?.challengeAttempts ||
    !Array.isArray(profile.challengeAttempts)
  ) {
    return 0;
  }
  // Count unique challenges that were solved correctly (isCorrect = true)
  const solvedChallenges = new Set(
    profile.challengeAttempts
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
 * @param profile - ChildProfile data
 * @returns Average reading time in minutes per day
 */
export function getAverageReadingTimePerDay(profile: ChildProfile | undefined): number {
  if (!profile?.sessions || !Array.isArray(profile.sessions) || profile.sessions.length === 0) {
    return 0;
  }

  const totalMinutes = getTotalReadingTime(profile);
  
  // Get first and last session dates
  const sortedSessions = [...profile.sessions].sort(
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
 * @param profile - ChildProfile data
 * @returns Number of consecutive days with reading activity
 */
export function getCurrentStreak(profile: ChildProfile | undefined): number {
  if (!profile?.sessions || !Array.isArray(profile.sessions) || profile.sessions.length === 0) {
    return 0;
  }

  // Get unique dates from sessions (normalize to dates only, ignoring time)
  const sessionDates = new Set(
    profile.sessions.map((session: GameSession) => {
      const date = new Date(session.startedAt);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    })
  );

  // Sort dates in descending order
  const sortedDates = Array.from(sessionDates).sort().reverse();

  // Count consecutive days from today backwards
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today has a session
  const todayString = currentDate.toISOString().split('T')[0];
  let checkingDate = new Date(currentDate);

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
