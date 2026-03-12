/**
 * Global Shared Types for Microservices Architecture
 *
 * This file defines all TypeScript interfaces that are shared across:
 * - Auth Service (port 3002)
 * - Content Service (port 3003)
 * - Progress Service (port 3004)
 * - Gateway (port 3001)
 * - Web Frontend (port 3000)
 *
 * Ensures type consistency and coherence across the entire system.
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_BASE_URL_V1 = "/api/v1";

// ============================================================================
// ENUMS
// ============================================================================

export enum TranslationSourceType {
  EN_TO_FR_AR = "en_to_fr_ar", // Auto-translate from English
  FR_TO_AR_EN = "fr_to_ar_en", // Auto-translate from French
  MANUAL = "manual", // Manual translations
}

export enum RoleType {
  PARENT = "PARENT",
  ADMIN = "ADMIN",
}

export enum LanguageCode {
  EN = "EN",
  AR = "AR",
  FR = "FR",
}

export enum TTSLanguageCodes {
  ENGLISH_US = "en-us",
  ARABIC = "ar-001",
  FRENCH = "fr-fr",
};

export enum Local {
  EN = "en",
  AR = "ar",
  FR = "fr",
}

export enum ChallengeType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE", // standard quiz format with predefined answers
  TRUE_FALSE = "TRUE_FALSE", // standard true/false format
  RIDDLE = "RIDDLE", // open-ended question where child must type an answer, correctness is determined by keyword matching or manual review
  CHOOSE_ENDING = "CHOOSE_ENDING", // all anserwers are correct, see if child understandood the story
  MORAL_DECISION = "MORAL_DECISION", // all anserwers are correct, see if child understood the moral of the story
}

export enum ProgressStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum ChallengeStatus {
  SOLVED = "SOLVED",
  SKIPPED = "SKIPPED",
  INCORRECT = "INCORRECT",
  NOT_ATTEMPTED = "NOT_ATTEMPTED",
}

export enum ReadingLevel {
  BEGINNER = "BEGINNER",
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  ADVANCED = "ADVANCED",
}

export enum AgeGroupStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ============================================================================
// AUTH SERVICE TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  password?: string; // nullable for OAuth users
  name?: string;
  image?: string;
  role: RoleType;
  newUser: boolean;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  children: Child[];
  sessions?: Session[];
  accounts?: Account[];
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  loginCode?: string;
  avatar?: string;
  ageGroup: string; // References ContentService.AgeGroup.id
  favoriteThemes: string[]; // References ContentService.Theme.id
  createdAt: Date;
  updatedAt: Date;
  parent: User;
}

export interface Account {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// ============================================================================
// CONTENT SERVICE TYPES
// ============================================================================

export interface AgeGroup {
  id: string;
  name: string; // e.g., "6-7 years", "8-9 years"
  minAge: number;
  maxAge: number;
  status: AgeGroupStatus;
  createdAt: Date;
  updatedAt: Date;
  translations?: AgeGroupTranslation[];
  roadmaps: Roadmap[];
}

export interface AgeGroupTranslation {
  id: string;
  ageGroupId: string;
  languageCode: LanguageCode;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  id: string;
  name: string; // e.g., "Adventure", "Mystery", "Fantasy"
  description: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  translations?: ThemeTranslation[];
  roadmaps?: Roadmap[];
}

export interface ThemeTranslation {
  id: string;
  themeId: string;
  languageCode: LanguageCode;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Roadmap {
  id: string;
  ageGroupId: string;
  themeId: string;
  title?: string | null;
  readingLevel: ReadingLevel;
  createdAt: Date;
  updatedAt: Date;
  ageGroup: AgeGroup;
  theme: Theme;
  translations?: RoadmapTranslation[];
  worlds: World[];
}

export interface RoadmapTranslation {
  id: string;
  roadmapId: string;
  languageCode: LanguageCode;
  title?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface World {
  id: string;
  roadmapId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  roadmap: Roadmap;
  translations?: WorldTranslation[];
  stories: Story[];
}

export interface WorldTranslation {
  id: string;
  worldId: string;
  languageCode: LanguageCode;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Story {
  id: string;
  worldId: string;
  title: string;
  description?: string;
  difficulty: number; // 1-5 difficulty scale
  order: number;
  createdAt: Date;
  updatedAt: Date;
  world: World;
  translations?: StoryTranslation[];
  chapters: Chapter[];
}

export interface StoryTranslation {
  id: string;
  storyId: string;
  languageCode: LanguageCode;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  storyId: string;
  content: string; // Reading content (text)
  imageUrl?: string;
  audioUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  story: Story;
  translations?: ChapterTranslation[];
  challenge?: Challenge;
}

export interface ChapterTranslation {
  id: string;
  chapterId: string;
  languageCode: LanguageCode;
  content: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  id: string;
  chapterId: string;
  type: ChallengeType;
  question: string;
  description?: string;
  baseStars: number;
  order: number;
  hints: string[];
  createdAt: Date;
  updatedAt: Date;
  chapter: Chapter;
  translations?: ChallengeTranslation[];
  answers: Answer[];
}

export interface ChallengeTranslation {
  id: string;
  challengeId: string;
  languageCode: LanguageCode;
  question: string;
  description?: string;
  hints: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  challengeId: string;
  text: string;
  isCorrect: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  translations?: AnswerTranslation[];
}

export interface AnswerTranslation {
  id: string;
  answerId: string;
  languageCode: LanguageCode;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Level {
  id: string;
  levelNumber: number;
  requiredStars: number;
  badge?: Badge;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  levelId: string;
  createdAt: Date;
  updatedAt: Date;
  level: Level;
  translations?: BadgeTranslation[];
}

export interface BadgeTranslation {
  id: string;
  badgeId: string;
  languageCode: LanguageCode;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PROGRESS SERVICE TYPES
// ============================================================================

export interface ParentUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: RoleType;
  newUser: boolean;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  children: ChildProfile[];
}

export interface ChildProfile {
  id: string;
  name: string;
  parentId: string; // References Auth.Parent.id
  parent: User; // Parent user details
  childId: string; // References Auth.Child.id
  child: Child;
  ageGroupId: string; // References Content.AgeGroup.id
  ageGroupName: string; // Denormalized for easy access
  favoriteThemes: string[]; // References Content.Theme.id
  allocatedRoadmaps: string[]; // List of Roadmap IDs allocated to this child
  currentLevel: number;
  totalStars: number;
  createdAt: Date;
  updatedAt: Date;
  progress: Progress[];
  badges: ChildBadge[];
}

// Progress represents a child's progress through a specific roadmap , world, story, tracking status, attempts, and rewards earned
export interface Progress {
  id: string;
  childProfileId: string;
  roadmapId: string; // References Content.Roadmap.id - current roadmap being progressed through
  worldId: string; // References Content.World.id - current world being progressed through
  storyId: string; // References Content.Story.id - current story being progressed through
  status: ProgressStatus;
  totalTimeSpent: number; // Total time spent on this story across all sessions (in seconds)
  completedAt?: Date;
  gameSession?: GameSession;
  createdAt: Date;
  updatedAt: Date;
}

// GameSession represents a single playthrough of a story, tracking progress and rewards earned during that session
export interface GameSession {
  id: string;
  progressId: string;
  progress?: Progress;
  storyId: string; // References Content.Story.id
  chapterId: string | null; // References Content.Chapter.id - checkpoint for mid-story saves
  startedAt: Date;
  checkpointAt: Date | null; // Optional checkpoint time for mid-session saves (deprecated, use SessionCheckpoint.pausedAt)
  endedAt: Date | null;
  totalTimeSpent: number; // Total active time in seconds (sum of all pause-to-resume durations)
  sessionCount: number; // Number of separate sessions (pause/resume cycles)
  totalIdleTime: number; // Total time child was away between sessions (in seconds)
  starsEarned: number;
  challengeAttempts: ChallengeAttempt[];
  checkpoints: SessionCheckpoint[]; // History of all pause/resume checkpoints
  createdAt: Date;
  updatedAt: Date;
}

// SessionCheckpoint records each pause/resume event within a GameSession
// Allows tracking of when child paused, started, and calculating idle time between sessions
export interface SessionCheckpoint {
  id: string;
  gameSessionId: string;
  gameSession?: GameSession;
  firstChapterId: string; // Which chapter was the child reading when they started this session
  lastChapterId: string | null; // Which chapter was the child reading when they paused (null if not paused yet)
  pausedAt: Date | null;
  startedAt: Date;
  sessionDurationSeconds?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ChallengeAttempt represents a single attempt at answering a challenge question, tracking the answer given, correctness, hints used, and time spent
export interface ChallengeAttempt {
  id: string;
  sessionId: string;
  session?: GameSession;
  status: ChallengeStatus;
  challengeId: string; // References Content.Challenge.id
  answerId?: string | null; // For multiple choice / riddle - reference to content Answer.id
  textAnswer: string | null; // For open-ended questions
  isCorrect: boolean | null; // null for unanswered attempts or subjective questions
  attemptNumber: number;
  usedHints: number;
  timeSpentSeconds: number;
  actions: AttemptAction[]; // Detailed log of user actions during this attempt
  starEventId?: string; // References StarEvent.id - rewards earned from this attempt
  starEvent: StarEvent;
  createdAt: Date;
  updatedAt: Date;
}
export interface AttemptAction {
  id: string;
  attemptId?: string;
  attempt?: ChallengeAttempt;
  // What was selected/used in this action
  selectedAnswerId?: string;
  selectedAnswerText?: string; // Capture the full text of the answer they selected
  answerText?: string; // For open-ended questions, capture the text they entered
  // Context about this action
  attemptNumberAtAction: number; // Which attempt number they were on
  isCorrect: boolean; // Whether this action resulted in a correct answer (null for non-answer actions)
  createdAt: Date;
}

// StarEvent represents the outcome of a challenge attempt that results in star rewards, tracking details of the attempt and rewards earned
export interface StarEvent {
  id: string;
  attemptId: string;
  attempt?: ChallengeAttempt;
  challengeId: string; // References Content.Challenge.id
  baseStars: number;
  noHintBonus: number;
  firstTryBonus: number;
  totalStars: number;
  attemptNumber: number;
  usedHints: boolean;
  wasCorrect: boolean | null; // null for unanswered attempts or subjective questions
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildBadge {
  id: string;
  childProfileId: string;
  badgeId: string; // References Content.Badge.id
  earnedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================================================
// AI SERVICE TYPES
// ===========================================================================


// map LanguageCodes to ContentService LanguageCode for easy reference
export const TTSLanguageToContentLanguageMap: Record<string, LanguageCode> = {
  "en-us": LanguageCode.EN,
  "ar-001": LanguageCode.AR,
  "fr-fr": LanguageCode.FR,
};

export const ContentLanguageToTTSLanguageMap: Record<LanguageCode | string, string> = {
  [LanguageCode.EN]: TTSLanguageCodes.ENGLISH_US,
  [LanguageCode.AR]: TTSLanguageCodes.ARABIC,
  [LanguageCode.FR]: TTSLanguageCodes.FRENCH,
};

export interface TTSAudio {
  id: string;

  storyId?: string| null ; // ID of the story this audio is for
  chapterId?: string| null ; // ID of the chapter this audio is for

  // TTS metadata
  languageCode?: string | null; // e.g., "en", "fr", "ar"
  voice?: string | null; //
  prompt?: string | null;

  // Location of the stored audio file (URL or path)
  audioUrl: string;
  mimeType: string;

  // Optional technical metadata
  durationMs?: number  | null; // Duration of the audio in milliseconds
  sizeBytes?: number | null; // Size of the audio file in bytes

  // When the audio was generated and recorded
  generatedAt: Date;
  createdAt: Date;
}

// ============================================================================
// Create/Update Input Types
// ============================================================================

/**
 * Input type for creating an answer
 */
export interface CreateAnswerInput {
  text: string;
  isCorrect: boolean;
  order?: number | null;
  translations?: Array<{
    languageCode: string;
    text?: string;
  }>;
}

/**
 * Input type for creating a challenge with answers
 */
export interface CreateChallengeInput {
  type: ChallengeType;
  question: string;
  baseStars?: number;
  order: number;
  hints?: string[];
  answers: CreateAnswerInput[];
  translations?: Array<{
    languageCode: string;
    question?: string;
    hints?: string[];
  }>;
}

/**
 * Input type for creating a chapter with challenge
 */
export interface CreateChapterInput {
  content: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  order: number;
  challenge?: CreateChallengeInput;
  translations?: Array<{
    languageCode: string;
    content?: string;
    audioUrl?: string;
  }>;
}

/**
 * Input type for creating a complete story with chapters
 */
export interface CreateStoryWithChaptersInput {
  worldId: string;
  title: string;
  description?: string | null;
  difficulty: number;
  order: number;
  generateAudio: boolean;
  translationSource: TranslationSourceType;
  translations?: Array<{
    languageCode: string;
    title?: string;
    description?: string;
  }>;

  chapters: CreateChapterInput[];
}

export interface ManualTranslationEdit {
  languageCode: string;
  name?: string;
  description?: string;
  title?: string;
  content?: string;
  question?: string;
  text?: string;
  hints?: string[];
}

// =============================================================================
// Age Group Content Validation Types
// =============================================================================
/**
 * Represents missing content for a specific roadmap
 */
export interface MissingContent {
  roadmapId: string;
  themeName?: string;
  readings: {
    worldsCount: number;
    storiesCount: number;
    chaptersCount: number;
  };
  missingItems: string[];
}

/**
 * Represents the result of age group content validation
 */
export interface AgeGroupContentValidationResult {
  isComplete: boolean;
  ageGroupId: string;
  roadmapsCount: number;
  completeRoadmapsCount: number;
  missingContent: MissingContent[];
  errors: string[];
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Standard API Response wrapper for all endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: PaginationMeta;
  timestamp?: Date;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Admin Dashboard Statistics
 * Aggregates key metrics from across all services for admin overview
 */
export interface AdminDashboardStats {
  activeChildren: number; // Children with activity in the last 7 days
  totalChildren: number; // Total child profiles in the system
  totalParents: number; // Total parent users in the system
  totalAgeGroups: number; // Total age groups configured
  totalRoadmaps: number; // Total roadmaps across all age groups
  totalWorlds: number; // Total worlds across all roadmaps
  totalStories: number; // Total stories across all worlds
  totalChapters: number; // Total chapters across all stories
  totalChallenges: number; // Total challenges across all chapters
  totalStoriesCompleted: number; // Total story completions across all children
  totalChallengesSolved: number; // Total correctly solved challenges across all children
}

// ============================================================================
// GATEWAY/AUTH TYPES
// ============================================================================

/**
 * JWT Payload decoded from token
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: RoleType;
  iat: number;
  exp: number;
}

/**
 * Request context with user information (injected by gateway)
 */
export interface RequestContext {
  userId?: string;
  userRole?: RoleType;
  userEmail?: string;
  token?: string;
}

/**
 * Token verification response from auth service
 */
export interface TokenVerificationResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  role?: RoleType;
  error?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Type for service response with optional error details
 */
export type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
