// Mock data types and structures for the admin dashboard

// Enums
export type StoryStatus = "draft" | "published" | "archived";
export type RiddleType = "text" | "multiple-choice";
export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type UserRole = "superadmin" | "editor" | "reviewer";
export type UserStatus = "active" | "inactive" | "suspended";

// Types
export interface Hint {
  level: 1 | 2 | 3;
  text: string;
  type: "text" | "image" | "audio";
  imageUrl?: string;
  audioUrl?: string;
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Riddle {
  id: string;
  storyId: string;
  question: string;
  type: RiddleType;
  correctAnswer: string;
  acceptableAnswers: string[];
  choices?: Choice[];
  difficulty: DifficultyLevel;
  hints: Hint[];
  successRate: number; // percentage 0-100
  totalAttempts: number;
  createdAt: Date;
  createdBy: string;
  status: ApprovalStatus;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImageUrl: string;
  content: string;
  category: string;
  difficulty: DifficultyLevel;
  ageGroup: string; // "6-7" | "8-9" | "10-11"
  readingLevel: string; // "Beginner" | "Intermediate" | "Advanced"
  riddleCount: number;
  status: StoryStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  completionRate: number; // percentage 0-100
  avgTimeToComplete: number; // minutes
  riddles: Riddle[];
  approvalStatus: ApprovalStatus;
  reviewedBy?: string;
  reviewComments?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  readingLevel: DifficultyLevel;
  parentIds: string[];
  joinedAt: Date;
  status: UserStatus;
  totalStoriesCompleted: number;
  totalRiddlesSolved: number;
  totalStarsEarned: number;
  currentStreak: number;
  lastActive: Date;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  childrenIds: string[];
  joinedAt: Date;
  status: UserStatus;
  lastLogin: Date;
  notificationPreferences: {
    emailNotifications: boolean;
    weeklyReports: boolean;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  lastActive: Date;
  status: UserStatus;
  permissions: string[];
}

export interface ApprovalItem {
  id: string;
  itemId: string;
  itemType: "story" | "riddle";
  itemTitle: string;
  submittedBy: string;
  submittedAt: Date;
  status: ApprovalStatus;
  assignedTo?: string;
  comments?: string;
  preview: Story | Riddle;
}

export interface AnalyticsMetric {
  date: Date;
  activeUsers: number;
  storiesCompleted: number;
  riddlesSolved: number;
  avgTimePerRiddle: number;
  hintUsageRate: number;
  completionRate: number;
}

export interface RiddleAnalytics {
  riddleId: string;
  riddleQuestion: string;
  successRate: number;
  avgTimeToSolve: number;
  totalAttempts: number;
  hintLevel1Usage: number;
  hintLevel2Usage: number;
  hintLevel3Usage: number;
  skipRate: number;
  difficulty: DifficultyLevel;
}

// Mock Data

export const mockStories: Story[] = [
  {
    id: "story-1",
    title: "The Lost Treasure of Pirate's Cove",
    description:
      "Join Captain Max on an exciting adventure to find the legendary treasure hidden on a mysterious island.",
    author: "Sarah Johnson",
    coverImageUrl: "/images/story-1.jpg",
    content:
      "Captain Max sailed across the vast ocean with his loyal crew... (full story content would go here)",
    category: "Adventure",
    difficulty: "Easy",
    ageGroup: "6-7",
    readingLevel: "Beginner",
    riddleCount: 3,
    status: "published",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-01"),
    publishedAt: new Date("2024-01-20"),
    completionRate: 87,
    avgTimeToComplete: 12,
    riddles: [],
    approvalStatus: "approved",
    reviewedBy: "admin-1",
  },
  {
    id: "story-2",
    title: "The Secret Garden Mystery",
    description:
      "Lily discovers a hidden garden with magical plants and uncovers its secrets through solving riddles.",
    author: "Emma Wilson",
    coverImageUrl: "/images/story-2.jpg",
    content: "Lily found a rusty key behind the old oak tree... (full story content)",
    category: "Fantasy",
    difficulty: "Medium",
    ageGroup: "8-9",
    readingLevel: "Intermediate",
    riddleCount: 4,
    status: "published",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-02-05"),
    publishedAt: new Date("2024-02-01"),
    completionRate: 75,
    avgTimeToComplete: 18,
    riddles: [],
    approvalStatus: "approved",
    reviewedBy: "admin-1",
  },
  {
    id: "story-3",
    title: "Space Explorer's Quest",
    description:
      "Take off into space with astronaut Alex and solve cosmic riddles to save the galaxy.",
    author: "Michael Chen",
    coverImageUrl: "/images/story-3.jpg",
    content: "The spacecraft hummed as Alex prepared for the mission... (full story content)",
    category: "Science Fiction",
    difficulty: "Hard",
    ageGroup: "10-11",
    readingLevel: "Advanced",
    riddleCount: 5,
    status: "draft",
    createdAt: new Date("2024-02-03"),
    updatedAt: new Date("2024-02-08"),
    completionRate: 0,
    avgTimeToComplete: 0,
    riddles: [],
    approvalStatus: "pending",
  },
  {
    id: "story-4",
    title: "The Dragon's Gold",
    description: "A classic fairytale with riddles that must be solved to claim the treasure.",
    author: "Isabella Rodriguez",
    coverImageUrl: "/images/story-4.jpg",
    content: "In the mountains high, a dragon guarded... (full story content)",
    category: "Fantasy",
    difficulty: "Medium",
    ageGroup: "8-9",
    readingLevel: "Intermediate",
    riddleCount: 3,
    status: "published",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-02-02"),
    publishedAt: new Date("2024-01-25"),
    completionRate: 92,
    avgTimeToComplete: 15,
    riddles: [],
    approvalStatus: "approved",
    reviewedBy: "admin-2",
  },
];

export const mockRiddles: Riddle[] = [
  {
    id: "riddle-1",
    storyId: "story-1",
    question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
    type: "text",
    correctAnswer: "keyboard",
    acceptableAnswers: ["a keyboard", "computer keyboard", "piano"],
    difficulty: "Easy",
    hints: [
      {
        level: 1,
        text: "Think of something you use to type on a computer.",
        type: "text",
      },
      {
        level: 2,
        text: "It has many keys that you press with your fingers.",
        type: "text",
      },
      {
        level: 3,
        text: "You can find one on most desks next to a computer.",
        type: "text",
      },
    ],
    successRate: 92,
    totalAttempts: 124,
    createdAt: new Date("2024-01-15"),
    createdBy: "Sarah Johnson",
    status: "approved",
  },
  {
    id: "riddle-2",
    storyId: "story-1",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    type: "multiple-choice",
    correctAnswer: "echo",
    acceptableAnswers: ["echo", "an echo"],
    choices: [
      { id: "choice-1", text: "Echo", isCorrect: true },
      { id: "choice-2", text: "Wind", isCorrect: false },
      { id: "choice-3", text: "Sound", isCorrect: false },
      { id: "choice-4", text: "Thunder", isCorrect: false },
    ],
    difficulty: "Medium",
    hints: [
      {
        level: 1,
        text: "It happens in caves and canyons.",
        type: "text",
      },
      {
        level: 2,
        text: "It's a copy of a sound you make.",
        type: "text",
      },
      {
        level: 3,
        text: "If you shout in a tunnel, you hear it come back.",
        type: "text",
      },
    ],
    successRate: 78,
    totalAttempts: 98,
    createdAt: new Date("2024-01-16"),
    createdBy: "Sarah Johnson",
    status: "approved",
  },
  {
    id: "riddle-3",
    storyId: "story-2",
    question: "The more you take, the more you leave behind. What am I?",
    type: "text",
    correctAnswer: "footsteps",
    acceptableAnswers: ["footsteps", "steps", "footprints", "tracks"],
    difficulty: "Medium",
    hints: [
      {
        level: 1,
        text: "Think about walking or running.",
        type: "text",
      },
      {
        level: 2,
        text: "You leave marks in snow or sand.",
        type: "text",
      },
      {
        level: 3,
        text: "This happens when you walk on a beach.",
        type: "text",
      },
    ],
    successRate: 85,
    totalAttempts: 87,
    createdAt: new Date("2024-01-26"),
    createdBy: "Emma Wilson",
    status: "approved",
  },
  {
    id: "riddle-4",
    storyId: "story-3",
    question: "What has cities but no houses, forests but no trees, and water but no fish?",
    type: "multiple-choice",
    correctAnswer: "map",
    acceptableAnswers: ["map", "a map"],
    choices: [
      { id: "choice-5", text: "Map", isCorrect: true },
      { id: "choice-6", text: "Globe", isCorrect: false },
      { id: "choice-7", text: "Canvas", isCorrect: false },
      { id: "choice-8", text: "Paper", isCorrect: false },
    ],
    difficulty: "Hard",
    hints: [
      {
        level: 1,
        text: "It's used for navigation and travel.",
        type: "text",
      },
      {
        level: 2,
        text: "You can find it in a car or on a ship.",
        type: "text",
      },
      {
        level: 3,
        text: "It shows you where places are but isn't real life.",
        type: "text",
      },
    ],
    successRate: 68,
    totalAttempts: 156,
    createdAt: new Date("2024-02-04"),
    createdBy: "Michael Chen",
    status: "approved",
  },
];

export const mockChildProfiles: ChildProfile[] = [
  {
    id: "child-1",
    name: "Emma",
    age: 7,
    avatar: "🧒",
    readingLevel: "Easy",
    parentIds: ["parent-1"],
    joinedAt: new Date("2024-01-10"),
    status: "active",
    totalStoriesCompleted: 5,
    totalRiddlesSolved: 12,
    totalStarsEarned: 45,
    currentStreak: 3,
    lastActive: new Date("2024-02-08"),
  },
  {
    id: "child-2",
    name: "Lucas",
    age: 9,
    avatar: "👦",
    readingLevel: "Medium",
    parentIds: ["parent-1"],
    joinedAt: new Date("2024-01-15"),
    status: "active",
    totalStoriesCompleted: 8,
    totalRiddlesSolved: 24,
    totalStarsEarned: 78,
    currentStreak: 5,
    lastActive: new Date("2024-02-08"),
  },
  {
    id: "child-3",
    name: "Odin",
    age: 10,
    avatar: "👨",
    readingLevel: "Hard",
    parentIds: ["parent-2"],
    joinedAt: new Date("2024-01-20"),
    status: "active",
    totalStoriesCompleted: 12,
    totalRiddlesSolved: 35,
    totalStarsEarned: 120,
    currentStreak: 7,
    lastActive: new Date("2024-02-07"),
  },
  {
    id: "child-4",
    name: "Sophia",
    age: 8,
    avatar: "👧",
    readingLevel: "Medium",
    parentIds: ["parent-2"],
    joinedAt: new Date("2024-02-01"),
    status: "active",
    totalStoriesCompleted: 2,
    totalRiddlesSolved: 4,
    totalStarsEarned: 12,
    currentStreak: 1,
    lastActive: new Date("2024-02-05"),
  },
];

export const mockParents: Parent[] = [
  {
    id: "parent-1",
    name: "John Smith",
    email: "john.smith@email.com",
    childrenIds: ["child-1", "child-2"],
    joinedAt: new Date("2024-01-10"),
    status: "active",
    lastLogin: new Date("2024-02-08"),
    notificationPreferences: {
      emailNotifications: true,
      weeklyReports: true,
    },
  },
  {
    id: "parent-2",
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    childrenIds: ["child-3", "child-4"],
    joinedAt: new Date("2024-01-20"),
    status: "active",
    lastLogin: new Date("2024-02-07"),
    notificationPreferences: {
      emailNotifications: true,
      weeklyReports: false,
    },
  },
  {
    id: "parent-3",
    name: "David Lee",
    email: "david.lee@email.com",
    childrenIds: [],
    joinedAt: new Date("2024-02-01"),
    status: "active",
    lastLogin: new Date("2024-02-06"),
    notificationPreferences: {
      emailNotifications: false,
      weeklyReports: true,
    },
  },
];

export const mockAdminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Alice Johnson",
    email: "alice@readly.com",
    role: "superadmin",
    createdAt: new Date("2024-01-01"),
    lastActive: new Date("2024-02-09"),
    status: "active",
    permissions: [
      "manage_users",
      "manage_content",
      "manage_admins",
      "view_analytics",
    ],
  },
  {
    id: "admin-2",
    name: "Robert Davis",
    email: "robert@readly.com",
    role: "editor",
    createdAt: new Date("2024-01-05"),
    lastActive: new Date("2024-02-08"),
    status: "active",
    permissions: ["manage_content", "view_analytics"],
  },
  {
    id: "admin-3",
    name: "Christine Brown",
    email: "christine@readly.com",
    role: "reviewer",
    createdAt: new Date("2024-01-10"),
    lastActive: new Date("2024-02-07"),
    status: "active",
    permissions: ["review_content", "view_analytics"],
  },
];

export const mockApprovalQueue: ApprovalItem[] = [
  {
    id: "approval-1",
    itemId: "story-3",
    itemType: "story",
    itemTitle: "Space Explorer's Quest",
    submittedBy: "Michael Chen",
    submittedAt: new Date("2024-02-03"),
    status: "pending",
    preview: mockStories[2],
  },
  {
    id: "approval-2",
    itemId: "riddle-5",
    itemType: "riddle",
    itemTitle: "What travels around the world but never leaves its corner?",
    submittedBy: "Sarah Johnson",
    submittedAt: new Date("2024-02-08"),
    status: "pending",
    preview: mockRiddles[0],
  },
];

export const mockAnalyticsMetrics: AnalyticsMetric[] = [
  {
    date: new Date("2024-02-01"),
    activeUsers: 45,
    storiesCompleted: 8,
    riddlesSolved: 24,
    avgTimePerRiddle: 3.5,
    hintUsageRate: 32,
    completionRate: 78,
  },
  {
    date: new Date("2024-02-02"),
    activeUsers: 52,
    storiesCompleted: 11,
    riddlesSolved: 28,
    avgTimePerRiddle: 3.2,
    hintUsageRate: 35,
    completionRate: 81,
  },
  {
    date: new Date("2024-02-03"),
    activeUsers: 48,
    storiesCompleted: 9,
    riddlesSolved: 22,
    avgTimePerRiddle: 3.8,
    hintUsageRate: 38,
    completionRate: 75,
  },
  {
    date: new Date("2024-02-04"),
    activeUsers: 61,
    storiesCompleted: 14,
    riddlesSolved: 35,
    avgTimePerRiddle: 3.1,
    hintUsageRate: 28,
    completionRate: 85,
  },
  {
    date: new Date("2024-02-05"),
    activeUsers: 57,
    storiesCompleted: 12,
    riddlesSolved: 30,
    avgTimePerRiddle: 3.4,
    hintUsageRate: 33,
    completionRate: 82,
  },
  {
    date: new Date("2024-02-06"),
    activeUsers: 64,
    storiesCompleted: 16,
    riddlesSolved: 40,
    avgTimePerRiddle: 2.9,
    hintUsageRate: 25,
    completionRate: 88,
  },
  {
    date: new Date("2024-02-07"),
    activeUsers: 71,
    storiesCompleted: 19,
    riddlesSolved: 48,
    avgTimePerRiddle: 3.0,
    hintUsageRate: 30,
    completionRate: 90,
  },
  {
    date: new Date("2024-02-08"),
    activeUsers: 68,
    storiesCompleted: 17,
    riddlesSolved: 42,
    avgTimePerRiddle: 3.3,
    hintUsageRate: 34,
    completionRate: 87,
  },
];

export const mockRiddleAnalytics: RiddleAnalytics[] = [
  {
    riddleId: "riddle-1",
    riddleQuestion:
      "What has keys but no locks, space but no room, and you can enter but can't go inside?",
    successRate: 92,
    avgTimeToSolve: 2.5,
    totalAttempts: 124,
    hintLevel1Usage: 15,
    hintLevel2Usage: 8,
    hintLevel3Usage: 4,
    skipRate: 2,
    difficulty: "Easy",
  },
  {
    riddleId: "riddle-2",
    riddleQuestion:
      "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    successRate: 78,
    avgTimeToSolve: 4.2,
    totalAttempts: 98,
    hintLevel1Usage: 22,
    hintLevel2Usage: 15,
    hintLevel3Usage: 8,
    skipRate: 5,
    difficulty: "Medium",
  },
  {
    riddleId: "riddle-3",
    riddleQuestion: "The more you take, the more you leave behind. What am I?",
    successRate: 85,
    avgTimeToSolve: 3.8,
    totalAttempts: 87,
    hintLevel1Usage: 12,
    hintLevel2Usage: 8,
    hintLevel3Usage: 3,
    skipRate: 3,
    difficulty: "Medium",
  },
  {
    riddleId: "riddle-4",
    riddleQuestion:
      "What has cities but no houses, forests but no trees, and water but no fish?",
    successRate: 68,
    avgTimeToSolve: 5.1,
    totalAttempts: 156,
    hintLevel1Usage: 45,
    hintLevel2Usage: 32,
    hintLevel3Usage: 18,
    skipRate: 12,
    difficulty: "Hard",
  },
];
