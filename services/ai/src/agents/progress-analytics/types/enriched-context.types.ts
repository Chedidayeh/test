/**
 * Enriched Context Types for Analytics
 *
 * These types combine raw data (stories, chapters, challenges, attempts)
 * into enriched structures that provide full context to the LLM for
 * generating story-specific, personalized insights.
 */

import { ChallengeType, ChallengeStatus } from "@shared/src/types";

/**
 * Enriched challenge attempt
 * Combines challenge metadata with the child's attempt and outcome
 */
export interface EnrichedChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  answer?: string | null; // One of the provided answers or text answer
  status: ChallengeStatus;
  correctAnswer?: string;
  hints: string[];
  usedHints: number;
  timeSpentSeconds: number;
  difficulty?: "easy" | "medium" | "hard";
  attemptCount: number; // How many times child tried
}

/**
 * Enriched chapter
 * Combines chapter content with challenges the child faced
 */
export interface EnrichedChapter {
  id: string;
  order: number;
  content: string; // The actual text the child read
  contentLength: number; // Length in words/characters for difficulty assessment
  challenges: EnrichedChallenge[]; // All challenges in this chapter
  successRate: number; // % of challenges solved
  totalTimeSpent: number; // Seconds spent on this chapter
  completedAt?: Date;
}

/**
 * Enriched story
 * Combines story metadata with all chapters and aggregate stats
 */
export interface EnrichedStory {
  id: string;
  title: string;
  description?: string;
  difficulty: number; // 1-5 scale
  chapters: EnrichedChapter[]; // All chapters in reading order
  worldName?: string;
  themeName?: string;
  
  // Aggregate stats for this story
  totalChallengeSolved: number;
  totalChallengesAttempted: number;
  challengeSuccessRate: number;
  totalTimeSpent: number; // Seconds
  completedAt?: Date;
  completionPercentage: number; // % of story completed
}

/**
 * Enriched reading context
 * Complete weekly overview with all stories and chapters the child engaged with
 * This is what gets passed to the LLM for generating story-specific insights
 */
export interface EnrichedReadingContext {
  weekStart: Date;
  weekEnd: Date;
  childName: string;
  childId: string;
  
  // All stories engaged with this week
  stories: EnrichedStory[];
  
  // Aggregate stats
  totalStoriesStarted: number;
  totalStoriesCompleted: number;
  totalChaptersRead: number;
  totalChallengesAttempted: number;
  totalChallengesSolved: number;
  
  // For LLM context
  summaryText: string; // Natural language summary
}

/**
 * Helper type for building enriched context
 */
export interface ChapterProgressMap {
  [chapterId: string]: {
    completionPercentage: number;
    totalTimeSpent: number;
    challenges: Map<string, EnrichedChallenge>;
  };
}
