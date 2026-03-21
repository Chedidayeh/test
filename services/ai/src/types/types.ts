// ============================================================================
// AGGREGATED METRICS TYPES
// ============================================================================

import {
  AggregatedMetrics,
  ChildProfile,
  ImprovementTrend,
  InsightsReport,
  PerformanceByDifficulty,
  PerformanceByType,
  ReadingLevel,
  Recommendation,
  Story,
} from "@shared/src/types";

// ============================================================================
// CHALLENGE REPORT TYPES
// ============================================================================

export interface ChallengeReport {
  challengeId: string;
  challengeType: string;
  challengeQuestion: string;
  correctAnswer: string;
  childAnswer: string | null;
  totalAttempts: number;
  success: boolean;
  hintsUsed: number;
  timeSpent: number; // milliseconds
  starsEarned: number;
  baseStar: number;
  // TIER 1 Enhancements
  learningObjective?: string; // Learning goal/objective for the challenge
  storyContent?: string; // Full story chapter text for context
  availableHints?: string[]; // All hints available for this challenge
  answerOptions?: string[]; // All answer options (for analyze choice patterns)
  errorSequence?: string[]; // Progression of answer attempts (shows learning behavior)
}

// ============================================================================
// LLM CONTEXT TYPES
// ============================================================================

export interface ReadingPattern {
  averageTimePerStory: number;
  readingSpeed: string; // "fast" | "moderate" | "slow"
  difficultyProgression: string; // narrative description
  frequencyOfReading: string; // "daily" | "weekly" | "sporadic"
}

export interface ChallengePattern {
  strongTypes: string[];
  weakTypes: string[];
  overallChallengeSuccessRate: number;
  favoriteThemes: string[];
}

export interface EngagementSignal {
  hintDependency: string; // "low" | "medium" | "high"
  persistence: string; // "high" | "medium" | "low"
  retryPatterns: string; // narrative description
  sessionConsistency: string; // "consistent" | "sporadic"
}

export interface StoryJourney {
  storiesRead: Story[];
  totalProgressRecords: number;
  narrativeJourney: string; // comprehensive narrative of reading journey
  themes: string[];
}

export interface LLMContext {
  childId: string;
  childName: string;
  childProfile: ChildProfile;
  storyJourney: StoryJourney;
  metrics: AggregatedMetrics;
  readingPattern: ReadingPattern;
  challengePattern: ChallengePattern;
  engagementSignal: EngagementSignal;
  topChallengeReports: ChallengeReport[]; // top 5-10 most relevant challenges
  consolidatedNarrative: string; // entire context as single narrative for LLM
  // TIER 2 Enhancements
  sessionAnalysis?: any; // SessionAnalysis from session-pattern-analyzer
  actionSequenceAnalysis?: any; // ActionSequenceAnalysis from attempt-action-analyzer
  contentAnalysis?: any; // ContentAnalysis from content-readability-analyzer
  // TIER 3 Enhancements
  nextStorySequences?: any; // StorySequence[] from curriculum-mapper
  interventions?: any; // Intervention[] from intervention-recommender
  cognitiveStyle?: any; // CognitiveStyleProfile from cognitive-style-detector
  microlearningModules?: any; // MicrolearningModule[] from microlearning-recommender
}

// ============================================================================
// INSIGHTS TYPES
// ============================================================================

export interface MetricsData {
  totalStories: number;
  totalChallenges: number;
  successRate: number;
  averageAttempts: number;
  totalTimeSpent: number;
  hintUsageRate: number;
  starAchievementRate: number;
  performanceByType: Record<string, PerformanceByType>;
  performanceByDifficulty: Record<string, PerformanceByDifficulty>;
  improvementTrend: ImprovementTrend;
}

// ============================================================================
// EMBEDDINGS TYPES
// ============================================================================

export interface ChildEmbeddingInput {
  childId: string;
  readingLevel: ReadingLevel;
  engagementLevel: number; // 0-100
  themes: string[];
  strengths: string[];
  weaknesses: string[];
  averageTimePerStory: number;
  successRate: number;
  preferredChallengeTypes: string[];
  narrativeProfile: string; // text to embed
}

export interface ChildEmbeddingProfile {
  childId: string;
  embedding: number[]; // vector from GEMINI embeddings
  pineconeId: string; // ID in Pinecone
  metadata: {
    readingLevel: ReadingLevel;
    engagementScore: number;
    themes: string[];
    strengths: string[];
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SERVICE RESPONSE TYPES
// ============================================================================

export interface AnalyticsResponse {
  success: boolean;
  childId: string;
  insights: InsightsReport;
  metadata: {
    generatedAt: Date;
    processingTime: number; // milliseconds
  };
}

export interface AnalyticsError {
  success: false;
  error: {
    phase: string; // which phase failed (extraction, metrics, context, LLM, embeddings)
    message: string;
    code:
      | "VALIDATION_ERROR"
      | "SERVICE_ERROR"
      | "TIMEOUT_ERROR"
      | "UNKNOWN_ERROR";
  };
}
