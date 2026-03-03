// Mock data types and structures for the admin dashboard

// Enums
export type StoryStatus = "draft" | "published" | "archived";
export type ChallengeType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "RIDDLE"
  | "CHOOSE_ENDING"
  | "MORAL_DECISION";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type UserRole = "superadmin" | "editor" | "reviewer";
export type UserStatus = "active" | "inactive" | "suspended";

// Types - Hierarchy: AgeGroup > Roadmap > World > Story > Chapter > Challenge > Answer

export interface Answer {
  id: string;
  challengeId: string;
  text: string;
  isCorrect: boolean;
  order?: number;
}

export interface Challenge {
  id: string;
  chapterId: string;
  type: ChallengeType;
  question: string;
  description?: string;
  maxAttempts: number;
  baseStars: number;
  order: number;
  hints?: string[]; // 0 to 3 hints
  answers: Answer[];
  successRate?: number;
  totalAttempts?: number;
  createdAt?: Date;
  createdBy?: string;
  status?: ApprovalStatus;
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  order: number;
  challenges: Challenge[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Story {
  id: string;
  worldId: string;
  title: string;
  description: string;
  author: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  isMandatory: boolean;
  order: number;
  status: StoryStatus;
  chapters: Chapter[];
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  reviewedBy?: string;
  reviewComments?: string;
}

export interface World {
  id: string;
  roadmapId: string;
  name: string;
  description?: string;
  theme: string; // e.g., "Fantasy", "Adventure", "Science Fiction"
  imageUrl?: string;
  order: number;
  locked: boolean;
  requiredStarCount: number;
  stories: Story[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Theme {
  id: string;
  name: string; // e.g., "Adventure", "Mystery", "Fantasy"
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Roadmap {
  id: string;
  ageGroupId: string;
  themeId: string;
  worlds: World[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  roadmap?: Roadmap;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  parentIds: string[];
  joinedAt: Date;
  status: UserStatus;
  currentAgeGroupId?: string;
  currentWorldId?: string;
  currentStoryId?: string;
  currentChapterId?: string;
  totalStoriesCompleted: number;
  totalChallengesSolved: number;
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
  itemType: "story" | "chapter" | "challenge";
  itemTitle: string;
  submittedBy: string;
  submittedAt: Date;
  status: ApprovalStatus;
  assignedTo?: string;
  comments?: string;
  preview: Story | Chapter | Challenge;
}

export interface AnalyticsMetric {
  date: Date;
  activeUsers: number;
  storiesCompleted: number;
  challengesSolved: number;
  avgTimePerChallenge: number;
  hintUsageRate: number;
  completionRate: number;
}

export interface ChallengeAnalytics {
  challengeId: string;
  challengeQuestion: string;
  successRate: number;
  avgTimeToSolve: number;
  totalAttempts: number;
  hintUsage: number;
  skipRate: number;
  type: ChallengeType;
}

// Mock Data - Full Hierarchy

// Age Groups
export const mockAgeGroups: AgeGroup[] = [
  {
    id: "age-group-1",
    name: "6-7 years",
    minAge: 6,
    maxAge: 7,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "age-group-2",
    name: "8-9 years",
    minAge: 8,
    maxAge: 9,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "age-group-3",
    name: "10-11 years",
    minAge: 10,
    maxAge: 11,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Challenges and Answers for all chapters
const challenge1_1: Challenge = {
  id: "challenge-1-1",
  chapterId: "chapter-1-1",
  type: "RIDDLE",
  question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
  maxAttempts: 4,
  baseStars: 20,
  order: 1,
  answers: [
    {
      id: "answer-1-1-1",
      challengeId: "challenge-1-1",
      text: "Keyboard",
      isCorrect: true,
      order: 1,
    },
    {
      id: "answer-1-1-2",
      challengeId: "challenge-1-1",
      text: "Door",
      isCorrect: false,
      order: 2,
    },
    {
      id: "answer-1-1-3",
      challengeId: "challenge-1-1",
      text: "Piano",
      isCorrect: false,
      order: 3,
    },
  ],
  successRate: 92,
  totalAttempts: 124,
};

const challenge1_2: Challenge = {
  id: "challenge-1-2",
  chapterId: "chapter-1-2",
  type: "MULTIPLE_CHOICE",
  question: "What treasure is Captain Max searching for?",
  maxAttempts: 4,
  baseStars: 20,
  order: 1,
  answers: [
    {
      id: "answer-1-2-1",
      challengeId: "challenge-1-2",
      text: "Gold coins and jewels",
      isCorrect: true,
      order: 1,
    },
    {
      id: "answer-1-2-2",
      challengeId: "challenge-1-2",
      text: "A secret map",
      isCorrect: false,
      order: 2,
    },
    {
      id: "answer-1-2-3",
      challengeId: "challenge-1-2",
      text: "A magical artifact",
      isCorrect: false,
      order: 3,
    },
  ],
  successRate: 88,
  totalAttempts: 98,
};

const challenge2_1: Challenge = {
  id: "challenge-2-1",
  chapterId: "chapter-2-1",
  type: "TRUE_FALSE",
  question: "The Secret Garden is hidden behind the old oak tree.",
  maxAttempts: 4,
  baseStars: 15,
  order: 1,
  answers: [
    {
      id: "answer-2-1-1",
      challengeId: "challenge-2-1",
      text: "True",
      isCorrect: true,
      order: 1,
    },
    {
      id: "answer-2-1-2",
      challengeId: "challenge-2-1",
      text: "False",
      isCorrect: false,
      order: 2,
    },
  ],
  successRate: 79,
  totalAttempts: 87,
};

const challenge2_2: Challenge = {
  id: "challenge-2-2",
  chapterId: "chapter-2-2",
  type: "RIDDLE",
  question: "The more you take, the more you leave behind. What am I?",
  maxAttempts: 4,
  baseStars: 25,
  order: 1,
  answers: [
    {
      id: "answer-2-2-1",
      challengeId: "challenge-2-2",
      text: "Footsteps",
      isCorrect: true,
      order: 1,
    },
    {
      id: "answer-2-2-2",
      challengeId: "challenge-2-2",
      text: "Time",
      isCorrect: false,
      order: 2,
    },
    {
      id: "answer-2-2-3",
      challengeId: "challenge-2-2",
      text: "Water",
      isCorrect: false,
      order: 3,
    },
  ],
  successRate: 85,
  totalAttempts: 76,
};

const challenge3_1: Challenge = {
  id: "challenge-3-1",
  chapterId: "chapter-3-1",
  type: "RIDDLE",
  question: "What is the name of the spacecraft in this story?",
  maxAttempts: 4,
  baseStars: 20,
  order: 1,
  answers: [
    {
      id: "answer-3-1-1",
      challengeId: "challenge-3-1",
      text: "Starship Explorer",
      isCorrect: true,
      order: 1,
    },
  ],
  successRate: 72,
  totalAttempts: 156,
};

const challenge3_2: Challenge = {
  id: "challenge-3-2",
  chapterId: "chapter-3-2",
  type: "MULTIPLE_CHOICE",
  question: "What has cities but no houses, forests but no trees, and water but no fish?",
  maxAttempts: 4,
  baseStars: 30,
  order: 1,
  answers: [
    {
      id: "answer-3-2-1",
      challengeId: "challenge-3-2",
      text: "A map",
      isCorrect: true,
      order: 1,
    },
    {
      id: "answer-3-2-2",
      challengeId: "challenge-3-2",
      text: "A painting",
      isCorrect: false,
      order: 2,
    },
    {
      id: "answer-3-2-3",
      challengeId: "challenge-3-2",
      text: "A globe",
      isCorrect: false,
      order: 3,
    },
  ],
  successRate: 68,
  totalAttempts: 143,
};

const challenge4_1: Challenge = {
  id: "challenge-4-1",
  chapterId: "chapter-4-1",
  type: "RIDDLE",
  question: "I am taken from a mine and shut up in a wooden case, from which I am never released yet I am used by almost everyone. What am I?",
  maxAttempts: 4,
  baseStars: 25,
  order: 1,
  answers: [
    {
      id: "answer-4-1-1",
      challengeId: "challenge-4-1",
      text: "Pencil lead",
      isCorrect: true,
      order: 1,
    },
    {
      id: "answer-4-1-2",
      challengeId: "challenge-4-1",
      text: "Gold",
      isCorrect: false,
      order: 2,
    },
  ],
  successRate: 81,
  totalAttempts: 102,
};

// Chapters - Story 1 (Pirate's Cove for 6-7 years)
const chapter1_1: Chapter = {
  id: "chapter-1-1",
  storyId: "story-1",
  title: "The Journey Begins",
  content:
    "Captain Max sailed across the vast ocean with his loyal crew. The wind was strong, and the waves crashed against the ship's hull. In the distance, they could see an island covered in mysterious forests and hidden caves. The map showed that somewhere on this island lay the legendary pirate treasure.",
  imageUrl: "/images/chapter-1-1.jpg",
  order: 1,
  challenges: [challenge1_1],
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

const chapter1_2: Chapter = {
  id: "chapter-1-2",
  storyId: "story-1",
  title: "Landing on the Island",
  content:
    "They landed their boat on a sandy beach. Captain Max and three crew members ventured into the jungle, following the clues marked on their ancient map. The path was narrow and overgrown with vines. Along the way, they found strange symbols carved into trees. Each symbol seemed to be a clue to the treasure's location.",
  imageUrl: "/images/chapter-1-2.jpg",
  order: 2,
  challenges: [challenge1_2],
  createdAt: new Date("2024-01-16"),
  updatedAt: new Date("2024-01-16"),
};

// Chapters - Story 2 (Secret Garden for 8-9 years)
const chapter2_1: Chapter = {
  id: "chapter-2-1",
  storyId: "story-2",
  title: "The Discovery",
  content:
    "Lily found a rusty key behind the old oak tree in her grandmother's garden. It was covered in moss and very old. When she cleaned it, she noticed strange patterns engraved on its handle. She wondered what this key might unlock. Could it be the entrance to the secret garden she had heard about in old stories?",
  imageUrl: "/images/chapter-2-1.jpg",
  order: 1,
  challenges: [challenge2_1],
  createdAt: new Date("2024-01-25"),
  updatedAt: new Date("2024-01-25"),
};

const chapter2_2: Chapter = {
  id: "chapter-2-2",
  storyId: "story-2",
  title: "Inside the Garden",
  content:
    "The key opened a hidden gate covered with ivy and flowers. Inside, Lily found a magical garden filled with plants she had never seen before. Flowers glowed softly in the darkness, and trees bore fruits of unusual colors. In the center of the garden stood a fountain with clear, sparkling water. A wise owl watched from a nearby branch, as if guarding the garden's secrets.",
  imageUrl: "/images/chapter-2-2.jpg",
  order: 2,
  challenges: [challenge2_2],
  createdAt: new Date("2024-01-26"),
  updatedAt: new Date("2024-01-26"),
};

// Chapters - Story 3 (Space Explorer's Quest for 10-11 years)
const chapter3_1: Chapter = {
  id: "chapter-3-1",
  storyId: "story-3",
  title: "Launch Sequence",
  content:
    "The spacecraft hummed as Alex prepared for the mission. She had trained for five years to become an astronaut. Today was the day she would finally explore the galaxy and search for an ancient space station that had been lost for centuries. The countdown began: 10, 9, 8... Her hands trembled with anticipation as she gripped the control panel.",
  imageUrl: "/images/chapter-3-1.jpg",
  audioUrl: "/audio/chapter-3-1.mp3",
  order: 1,
  challenges: [challenge3_1],
  createdAt: new Date("2024-02-03"),
  updatedAt: new Date("2024-02-03"),
};

const chapter3_2: Chapter = {
  id: "chapter-3-2",
  storyId: "story-3",
  title: "Cosmic Mystery",
  content:
    "Alex flew through asteroid fields and past distant planets. The navigation system detected strange signals coming from an uncharted region of space. Following the signals, she arrived at what appeared to be an ancient space station frozen in time. Its corridors were dark and silent. Inside, she found encrypted data that might hold the secrets of an advanced civilization.",
  imageUrl: "/images/chapter-3-2.jpg",
  audioUrl: "/audio/chapter-3-2.mp3",
  order: 2,
  challenges: [challenge3_2],
  createdAt: new Date("2024-02-04"),
  updatedAt: new Date("2024-02-04"),
};

// Chapters - Story 4 (Dragon's Gold for 8-9 years)
const chapter4_1: Chapter = {
  id: "chapter-4-1",
  storyId: "story-4",
  title: "The Dragon's Cave",
  content:
    "In the mountains high, a dragon guarded a treasure of gold and jewels. The dragon was ancient and wise, protecting the treasure that belonged to a lost kingdom. Many brave knights had tried to defeat the dragon, but none had succeeded. The dragon did not fight with strength alone; it posed riddles to test the courage and intelligence of those who sought the treasure.",
  imageUrl: "/images/chapter-4-1.jpg",
  order: 1,
  challenges: [challenge4_1],
  createdAt: new Date("2024-01-20"),
  updatedAt: new Date("2024-01-20"),
};

// Stories with Chapters
export const mockStories: Story[] = [
  {
    id: "story-1",
    worldId: "world-1-1",
    title: "The Lost Treasure of Pirate's Cove",
    description:
      "Join Captain Max on an exciting adventure to find the legendary treasure hidden on a mysterious island.",
    author: "Sarah Johnson",
    difficulty: 1,
    isMandatory: true,
    order: 1,
    status: "published",
    chapters: [chapter1_1, chapter1_2],
    approvalStatus: "approved",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-01"),
    publishedAt: new Date("2024-01-20"),
    reviewedBy: "admin-1",
  },
  {
    id: "story-2",
    worldId: "world-2-1",
    title: "The Secret Garden Mystery",
    description:
      "Lily discovers a hidden garden with magical plants and uncovers its secrets through solving riddles.",
    author: "Emma Wilson",
    difficulty: 2,
    isMandatory: true,
    order: 1,
    status: "published",
    chapters: [chapter2_1, chapter2_2],
    approvalStatus: "approved",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-02-05"),
    publishedAt: new Date("2024-02-01"),
    reviewedBy: "admin-1",
  },
  {
    id: "story-3",
    worldId: "world-3-2",
    title: "Space Explorer's Quest",
    description:
      "Take off into space with astronaut Alex and solve cosmic riddles to save the galaxy.",
    author: "Michael Chen",
    difficulty: 5,
    isMandatory: true,
    order: 1,
    status: "draft",
    chapters: [chapter3_1, chapter3_2],
    approvalStatus: "pending",
    createdAt: new Date("2024-02-03"),
    updatedAt: new Date("2024-02-08"),
  },
  {
    id: "story-4",
    worldId: "world-2-1",
    title: "The Dragon's Gold",
    description: "A classic fairytale with riddles that must be solved to claim the treasure.",
    author: "Isabella Rodriguez",
    difficulty: 3,
    isMandatory: false,
    order: 2,
    status: "published",
    chapters: [chapter4_1],
    approvalStatus: "approved",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-02-02"),
    publishedAt: new Date("2024-01-25"),
    reviewedBy: "admin-2",
  },
];


// Themes
export const mockThemes: Theme[] = [
  {
    id: "theme-1",
    name: "Adventure",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "theme-2",
    name: "Fantasy",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "theme-3",
    name: "Science Fiction",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "theme-4",
    name: "Mystery",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "theme-5",
    name: "History",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Worlds
export const mockWorlds: World[] = [
  {
    id: "world-1-1",
    roadmapId: "roadmap-1",
    name: "Enchanted Forest",
    description: "A magical forest filled with adventure and mystery",
    theme: "Fantasy",
    imageUrl: "/images/world-enchanted-forest.jpg",
    order: 1,
    locked: false,
    requiredStarCount: 0,
    stories: [mockStories[0]],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "world-1-2",
    roadmapId: "roadmap-1",
    name: "Underwater Adventure",
    description: "Dive into the depths of the ocean",
    theme: "Adventure",
    imageUrl: "/images/world-underwater.jpg",
    order: 2,
    locked: true,
    requiredStarCount: 50,
    stories: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "world-2-1",
    roadmapId: "roadmap-2",
    name: "Secret Garden",
    description: "Uncover the mysteries of a hidden garden",
    theme: "Fantasy",
    imageUrl: "/images/world-secret-garden.jpg",
    order: 1,
    locked: false,
    requiredStarCount: 0,
    stories: [mockStories[1], mockStories[3]],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "world-2-2",
    roadmapId: "roadmap-2",
    name: "Scientific Realm",
    description: "Explore the wonders of science",
    theme: "Science Fiction",
    imageUrl: "/images/world-science.jpg",
    order: 2,
    locked: true,
    requiredStarCount: 75,
    stories: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "world-3-1",
    roadmapId: "roadmap-3",
    name: "Ancient Civilizations",
    description: "Travel back in time to discover lost kingdoms",
    theme: "History",
    imageUrl: "/images/world-ancient.jpg",
    order: 1,
    locked: false,
    requiredStarCount: 0,
    stories: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "world-3-2",
    roadmapId: "roadmap-3",
    name: "Future Cities",
    description: "Explore futuristic civilizations",
    theme: "Science Fiction",
    imageUrl: "/images/world-future.jpg",
    order: 2,
    locked: true,
    requiredStarCount: 100,
    stories: [mockStories[2]],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Roadmaps
export const mockRoadmaps: Roadmap[] = [
  {
    id: "roadmap-1",
    ageGroupId: "age-group-1",
    themeId: "theme-2",
    worlds: [mockWorlds[0], mockWorlds[1]],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "roadmap-2",
    ageGroupId: "age-group-2",
    themeId: "theme-3",
    worlds: [mockWorlds[2], mockWorlds[3]],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "roadmap-3",
    ageGroupId: "age-group-3",
    themeId: "theme-4",
    worlds: [mockWorlds[4], mockWorlds[5]],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Add roadmaps to age groups
mockAgeGroups[0].roadmap = mockRoadmaps[0];
mockAgeGroups[1].roadmap = mockRoadmaps[1];
mockAgeGroups[2].roadmap = mockRoadmaps[2];

export const mockChildProfiles: ChildProfile[] = [
  {
    id: "child-1",
    name: "Emma",
    age: 7,
    avatar: "🧒",
    parentIds: ["parent-1"],
    joinedAt: new Date("2024-01-10"),
    status: "active",
    currentAgeGroupId: "age-group-1",
    currentWorldId: "world-1-1",
    currentStoryId: "story-1",
    currentChapterId: "chapter-1-2",
    totalStoriesCompleted: 5,
    totalChallengesSolved: 12,
    totalStarsEarned: 145,
    currentStreak: 3,
    lastActive: new Date("2024-02-08"),
  },
  {
    id: "child-2",
    name: "Lucas",
    age: 9,
    avatar: "👦",
    parentIds: ["parent-1"],
    joinedAt: new Date("2024-01-15"),
    status: "active",
    currentAgeGroupId: "age-group-2",
    currentWorldId: "world-2-1",
    currentStoryId: "story-2",
    currentChapterId: "chapter-2-2",
    totalStoriesCompleted: 8,
    totalChallengesSolved: 24,
    totalStarsEarned: 278,
    currentStreak: 5,
    lastActive: new Date("2024-02-08"),
  },
  {
    id: "child-3",
    name: "Odin",
    age: 10,
    avatar: "👨",
    parentIds: ["parent-2"],
    joinedAt: new Date("2024-01-20"),
    status: "active",
    currentAgeGroupId: "age-group-3",
    currentWorldId: "world-3-1",
    currentStoryId: undefined,
    totalStoriesCompleted: 12,
    totalChallengesSolved: 35,
    totalStarsEarned: 520,
    currentStreak: 7,
    lastActive: new Date("2024-02-07"),
  },
  {
    id: "child-4",
    name: "Sophia",
    age: 8,
    avatar: "👧",
    parentIds: ["parent-2"],
    joinedAt: new Date("2024-02-01"),
    status: "active",
    currentAgeGroupId: "age-group-2",
    currentWorldId: "world-2-1",
    currentStoryId: "story-2",
    currentChapterId: "chapter-2-1",
    totalStoriesCompleted: 2,
    totalChallengesSolved: 4,
    totalStarsEarned: 52,
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
    itemId: "challenge-3-1",
    itemType: "challenge",
    itemTitle: "What is the name of the spacecraft in this story?",
    submittedBy: "Michael Chen",
    submittedAt: new Date("2024-02-08"),
    status: "pending",
    preview: challenge3_1,
  },
];

export const mockAnalyticsMetrics: AnalyticsMetric[] = [
  {
    date: new Date("2024-02-01"),
    activeUsers: 45,
    storiesCompleted: 8,
    challengesSolved: 24,
    avgTimePerChallenge: 3.5,
    hintUsageRate: 32,
    completionRate: 78,
  },
  {
    date: new Date("2024-02-02"),
    activeUsers: 52,
    storiesCompleted: 11,
    challengesSolved: 28,
    avgTimePerChallenge: 3.2,
    hintUsageRate: 35,
    completionRate: 81,
  },
  {
    date: new Date("2024-02-03"),
    activeUsers: 48,
    storiesCompleted: 9,
    challengesSolved: 22,
    avgTimePerChallenge: 3.8,
    hintUsageRate: 38,
    completionRate: 75,
  },
  {
    date: new Date("2024-02-04"),
    activeUsers: 61,
    storiesCompleted: 14,
    challengesSolved: 35,
    avgTimePerChallenge: 3.1,
    hintUsageRate: 28,
    completionRate: 85,
  },
  {
    date: new Date("2024-02-05"),
    activeUsers: 57,
    storiesCompleted: 12,
    challengesSolved: 30,
    avgTimePerChallenge: 3.4,
    hintUsageRate: 33,
    completionRate: 82,
  },
  {
    date: new Date("2024-02-06"),
    activeUsers: 64,
    storiesCompleted: 16,
    challengesSolved: 40,
    avgTimePerChallenge: 2.9,
    hintUsageRate: 25,
    completionRate: 88,
  },
  {
    date: new Date("2024-02-07"),
    activeUsers: 71,
    storiesCompleted: 19,
    challengesSolved: 48,
    avgTimePerChallenge: 3.0,
    hintUsageRate: 30,
    completionRate: 90,
  },
  {
    date: new Date("2024-02-08"),
    activeUsers: 68,
    storiesCompleted: 17,
    challengesSolved: 42,
    avgTimePerChallenge: 3.3,
    hintUsageRate: 34,
    completionRate: 87,
  },
];

export const mockChallengeAnalytics: ChallengeAnalytics[] = [
  {
    challengeId: "challenge-1-1",
    challengeQuestion:
      "What has keys but no locks, space but no room, and you can enter but can't go inside?",
    successRate: 92,
    avgTimeToSolve: 2.5,
    totalAttempts: 124,
    hintUsage: 27,
    skipRate: 2,
    type: "RIDDLE",
  },
  {
    challengeId: "challenge-1-2",
    challengeQuestion: "What treasure is Captain Max searching for?",
    successRate: 88,
    avgTimeToSolve: 2.1,
    totalAttempts: 98,
    hintUsage: 15,
    skipRate: 5,
    type: "MULTIPLE_CHOICE",
  },
  {
    challengeId: "challenge-2-1",
    challengeQuestion: "The Secret Garden is hidden behind the old oak tree.",
    successRate: 79,
    avgTimeToSolve: 1.8,
    totalAttempts: 87,
    hintUsage: 12,
    skipRate: 3,
    type: "TRUE_FALSE",
  },
  {
    challengeId: "challenge-2-2",
    challengeQuestion: "The more you take, the more you leave behind. What am I?",
    successRate: 85,
    avgTimeToSolve: 3.8,
    totalAttempts: 76,
    hintUsage: 23,
    skipRate: 4,
    type: "RIDDLE",
  },
  {
    challengeId: "challenge-3-2",
    challengeQuestion: "What has cities but no houses, forests but no trees, and water but no fish?",
    successRate: 68,
    avgTimeToSolve: 5.1,
    totalAttempts: 143,
    hintUsage: 95,
    skipRate: 12,
    type: "MULTIPLE_CHOICE",
  },
];

// Helper functions for Roadmap management
export function getThemeById(themeId: string): Theme | undefined {
  return mockThemes.find((t) => t.id === themeId);
}

export function getRoadmapsByAgeGroup(
  ageGroupId: string
): (Roadmap & { theme: Theme })[] {
  return mockRoadmaps
    .filter((r) => r.ageGroupId === ageGroupId)
    .map((r) => ({
      ...r,
      theme: getThemeById(r.themeId) || mockThemes[0],
    }));
}

export function getWorldsByRoadmap(roadmapId: string): World[] {
  const roadmap = mockRoadmaps.find((r) => r.id === roadmapId);
  if (!roadmap) return [];
  return mockWorlds.filter((w) => w.roadmapId === roadmapId);
}
