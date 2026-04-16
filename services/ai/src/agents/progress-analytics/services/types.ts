/**
 * Type definitions for Analytics Service
 * Used internally for LLM prompting, metrics calculation, and database persistence
 */

// ============================================================================
// BEHAVIORAL ANALYSIS TYPES
// ============================================================================

/**
 * Captures the full behavioral pattern of a child during a single challenge attempt.
 * Derived from the ChallengeAttempt.actions (AttemptAction[]) array.
 *
 * Tracks HOW the child answered, not just whether they were right or wrong:
 * - Answer selection sequence (what did they pick each time?)
 * - Hint-usage timing (did they ask for help early or after struggling?)
 * - Self-correction behavior (did they fix their own mistake?)
 * - Give-up pattern (did they skip after trying?)
 */
export interface AttemptBehaviorMetrics {
  challengeId: string;
  challengeType: string; // RIDDLE, MULTIPLE_CHOICE, TRUE_FALSE, CHOOSE_ENDING, MORAL_DECISION
  totalActionCount: number; // Total actions (selections/inputs) before challenge resolved
  solvedOnFirstTry: boolean; // True if first recorded action was correct
  selfCorrected: boolean; // True if child went incorrect → correct without using hints
  gaveUp: boolean; // True if challenge ended as SKIPPED after 1+ actions
  hintsRequestedAtAttempt: number[]; // After which attempt number(s) hint was used (e.g. [2,3] = hinted after 2nd and 3rd try)
  attemptSequence: Array<{
    attemptNumber: number; // Which attempt this action was on (1-based)
    isCorrect: boolean | null; // Whether this action was correct (null for non-answer actions)
    selectedAnswerText: string | null; // What multiple-choice answer was picked
    answerText: string | null; // What free-text was entered (for RIDDLE)
  }>;
}

/**
 * Aggregated behavioral summary for all challenges of a specific type.
 * Built by grouping AttemptBehaviorMetrics by challengeType.
 *
 * Gives the LLM a pattern-level view:
 * - "Child persists on RIDDLE challenges" vs "Child gives up quickly on TRUE_FALSE"
 * - "Child uses hints strategically (after failure)" vs "Child asks for hints immediately"
 */
export interface ChallengeTypeBehaviorSummary {
  type: string; // Challenge type (RIDDLE, MULTIPLE_CHOICE, etc.)
  totalChallenges: number; // Total challenges of this type attempted
  successRate: number; // % of challenges of this type answered correctly
  firstTrySolveRate: number; // % solved correctly on the very first action
  averageActionsBeforeSolve: number; // Average actions taken before solving (only solved challenges)
  selfCorrectionRate: number; // % where child self-corrected (no hints, went wrong → right)
  giveUpRate: number; // % where child skipped after 1+ failed attempts
  hintEarlyRate: number; // % where hint was requested on attempt 1 or 2 (before persisting)
  hintAfterFailureRate: number; // % where hint was requested only after 2+ failed attempts
}

// ============================================================================
// PER-CHALLENGE DETAIL (granular drill-down for each challenge)
// ============================================================================

/**
 * Full context for a single challenge the child encountered this week.
 * Joins content metadata (from storiesData) with attempt data (from childProfile).
 *
 * Gives the LLM a case-by-case view:
 * - What was the question and answer options?
 * - Which story/chapter was it in?
 * - What did the child do on each attempt (pick, type, skip)?
 * - How long did they spend, did they use hints?
 */
export interface ChallengeDetail {
  // --- Content context (from storiesData) ---
  storyTitle: string;
  storyDifficulty: number | null;
  chapterOrder: number; // 1-based chapter position in the story
  challengeId: string;
  challengeType: string; // RIDDLE, MULTIPLE_CHOICE, TRUE_FALSE, CHOOSE_ENDING, MORAL_DECISION
  question: string; // The actual question text shown to the child
  answers: Array<{ text: string; isCorrect: boolean }>; // All answer options (empty for RIDDLE)
  hints: string[]; // Available hint texts for this challenge

  // --- Attempt data (from childProfile.progress) ---
  attempts: Array<{
    attemptNumber: number; // 1-based
    status: string; // SOLVED, SKIPPED, INCORRECT, NOT_ATTEMPTED
    isCorrect: boolean | null;
    usedHints: number;
    timeSpentSeconds: number;
    selectedAnswer: string | null; // Text of what they picked (MC/TF) or typed (RIDDLE)
  }>;

  // --- Derived ---
  finalStatus: string; // Final outcome: SOLVED, SKIPPED, INCORRECT
  totalTimeSpent: number; // Sum of all attempt timeSpentSeconds
}

// ============================================================================
// METRICS SNAPSHOTS
// ============================================================================

/**
 * Raw metrics extracted from a single week of child data
 * Used as input to LLM for generating insights
 */
export interface MetricsSnapshot {
  storiesCount: number; // Total stories completed this week
  challenges: {
    [type: string]: number; // Breakdown by challenge type (RIDDLE, MULTIPLE_CHOICE, etc.)
  };
  successRate: number; // Percentage (0-100) of correct answers
  hintUsagePattern: {
    totalHintsUsed: number;
    averageHintsPerChallenge: number;
  };
  timeSpent: {
    totalSeconds: number; // Total active time in seconds
    averagePerStory: number; // Average seconds per story
  };
  skillsExercised: string[]; // Skill categories worked on (logic, vocabulary, comprehension, etc.)
  difficultiesHandled: number[]; // Array of difficulty levels (1-5) encountered
  challengeResultBreakdown?: {
    correct: number;
    incorrect: number;
    skipped: number;
  };

  // -------------------------------------------------------------------------
  // Action-level behavioral fields (populated when AttemptAction data is available)
  // All optional for backward compatibility with reports that predate action tracking
  // -------------------------------------------------------------------------

  /** Per-challenge-type behavioral summaries (answer patterns, persistence, hint timing) */
  behaviorByType?: { [challengeType: string]: ChallengeTypeBehaviorSummary };

  /** % of all challenges abandoned (SKIPPED) after at least one failed attempt */
  giveUpRate?: number;

  /** Challenge types where child retried 2+ times despite errors (persistence indicators) */
  persistenceAreas?: string[];

  /** Challenge types solved on first try more than 70% of the time */
  quickWinAreas?: string[];

  /** % of challenges where child self-corrected (fixed own error without hints) */
  selfCorrectionRate?: number;
}

/**
 * Trend analysis comparing two weeks
 * Used in LLM prompt for progress narrative
 */
export interface TrendAnalysis {
  successRateChange: number | null; // Percentage change, null if no previous week
  hintUsageImprovement: number | null; // Negative means fewer hints (improvement)
  speedImprovement: number | null; // Percentage faster, null if no previous week
  difficultyProgression: number | null; // Highest difficulty this week - highest prev week
  newSkillsIntroduced: string[]; // Skills not exercised previous week
  strugglingAreas: string[]; // Skills with lower performance
  improvementAreas: string[]; // Skills with improved performance
  velocityChange: "improving" | "consistent" | "regressing" | null;
}

// ============================================================================
// LLM INPUT/OUTPUT
// ============================================================================

/**
 * Input prepared for the LLM to generate analytics
 * Combines all context needed for comprehensive analysis
 */
export interface AnalyticsInput {
  childName: string;
  childAge: string; // "6", "7", "8", etc.
  favoriteThemes: string[];
  // learningObjectives: string[];
  currentSkillScores: {
    [skillName: string]: {
      score: number; // 0.0-1.0
      confidence: number;
    };
  };
  thisWeekMetrics: MetricsSnapshot;
  previousWeekMetrics?: MetricsSnapshot;
  trendAnalysis?: TrendAnalysis;

  /**
   * Action-level behavioral insights derived from ChallengeAttempt.actions.
   * Optional — only present when AttemptAction data was available for this week.
   * Gives the LLM visibility into HOW the child answered:
   * - Which challenge types they struggle with vs. win quickly
   * - Whether they use hints proactively or as a last resort
   * - Whether they self-correct or give up after failures
   * - Learning velocity patterns within single challenges
   */
  behaviorInsights?: {
    /** Full behavioral breakdown per challenge type */
    byType: { [challengeType: string]: ChallengeTypeBehaviorSummary };
    /** % of all challenges that were abandoned after at least one failed attempt */
    giveUpRate: number;
    /** Challenge types where child shows persistence (retries despite errors) */
    persistenceAreas: string[];
    /** Challenge types the child consistently wins on first try */
    quickWinAreas: string[];
    /** % of challenges where child self-corrected without needing hints */
    selfCorrectionRate: number;
  };

  /**
   * Per-challenge granular detail: question text, answer options, story/chapter
   * context, and what the child did on each attempt.
   * Lets the LLM reference specific challenges by name in its narrative.
   * Optional — only present when storiesData→challengeAttempt join succeeds.
   */
  challengeDetails?: ChallengeDetail[];
}

/**
 * Output generated by the LLM
 * Structured narrative with executive summary, trends, and recommendations
 */
export interface AnalyticsOutput {
  executiveSummary: string; // TL;DR: max ~150 words
  progressTrends: string; // Comparison with previous week: max ~200 words
  recommendations: string[]; // Actionable parent suggestions: max 5 items
}

// ============================================================================
// DATABASE MODEL (mirrors Prisma WeeklyAnalyticsReport)
// ============================================================================

/**
 * Complete weekly analytics report saved to database
 * Structure mirrors WeeklyAnalyticsReport Prisma model
 */
export interface WeeklyAnalyticsReportData {
  id?: string; // Generated by database
  childProfileId: string;
  week: number;
  executiveSummary: string;
  progressTrends: string;
  recommendations: string[];
  metricsSnapshot: MetricsSnapshot; // Store raw metrics for debugging
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// SERVICE RESPONSES
// ============================================================================

/**
 * Response from generateWeeklyReport service
 * Used by controller to return to client
 */
export interface GenerateReportResponse {
  success: boolean;
  reportId?: string;
  childProfileId: string;
  week: number;
  executiveSummary: string;
  progressTrends: string;
  recommendations: string[];
  generatedAt: Date;
  error?: string;
}
