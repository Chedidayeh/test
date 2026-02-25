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
// ENUMS
// ============================================================================

export enum RoleType {
  PARENT = "PARENT",
  ADMIN = "ADMIN",
}

export enum ChallengeType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  RIDDLE = "RIDDLE",
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
  createdAt: Date;
  updatedAt: Date;
  roadmaps: Roadmap[];
}

export interface Theme {
  id: string;
  name: string; // e.g., "Adventure", "Mystery", "Fantasy"
  description: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  roadmap?: Roadmap;
}

export interface Roadmap {
  id: string;
  ageGroupId: string;
  themeId: string;
  createdAt: Date;
  updatedAt: Date;
  ageGroup: AgeGroup;
  theme: Theme;
  readingLevel: ReadingLevel;
  worlds: World[];
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
  stories: Story[];
}

export interface Story {
  id: string;
  worldId: string;
  title: string;
  description?: string;
  difficulty: number; // 1-5 difficulty scale
  isMandatory: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  world: World;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string; // Reading content (text)
  imageUrl?: string;
  audioUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  story: Story;
  challenge?: Challenge;
}

export interface Challenge {
  id: string;
  chapterId: string;
  type: ChallengeType;
  question: string;
  description?: string;
  maxAttempts?: number;
  baseStars: number;
  order: number;
  hints: string[];
  createdAt: Date;
  updatedAt: Date;
  chapter: Chapter;
  answers: Answer[];
}

export interface Answer {
  id: string;
  challengeId: string;
  text: string;
  isCorrect: boolean;
  order?: number;
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
  favoriteThemes: string[]; // References Content.Theme.id
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
  startedAt: Date
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
  starEventId?: string; // References StarEvent.id - rewards earned from this attempt
  starEvent: StarEvent;
  createdAt: Date;
  updatedAt: Date;
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
 * Generic type for ID-based entity lookups
 */
export type EntityById<T> = Record<string, T>;

/**
 * Type for service response with optional error details
 */
export type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Partial type for update operations
 */
export type PartialEntity<T> = Partial<T>;
