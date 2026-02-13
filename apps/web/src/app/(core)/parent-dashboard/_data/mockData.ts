// Mock data for parent dashboard - single source of truth for all dashboard data

export interface Child {
  id: number;
  name: string;
  avatarUrl: string;
  avatarAlt: string;
  totalStars: number;
  storiesCompleted: number;
  totalReadingTime: number; // in minutes
  currentLevel: string;
  lastActive: string; // ISO date
}

export interface Milestone {
  id: number;
  title: string;
  starsRequired: number;
  isCompleted: boolean;
  isCurrent: boolean;
  reward: string;
  unlockedAt?: string; // ISO date when completed
}

export interface Badge {
  id: number;
  name: string;
  icon: string; // emoji
  description: string;
  unlockedAt: string; // ISO date
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface Riddle {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  solved: boolean;
  attempts: number;
  successRate: number; // 0-100
  solvedAt?: string; // ISO date
  category: string;
}

export interface TimeEntry {
  date: string; // YYYY-MM-DD
  minutes: number;
  storiesRead: number;
}

export interface AIInsight {
  id: number;
  type: "achievement" | "progress" | "area-for-growth" | "motivation";
  title: string;
  message: string;
  icon: string; // emoji
}

export interface ChildDashboardData {
  child: Child;
  milestones: Milestone[];
  badges: Badge[];
  riddles: Riddle[];
  timeData: TimeEntry[];
  insights: AIInsight[];
}

// Mock children data
export const mockChildren: Child[] = [
  {
    id: 1,
    name: "Emma",
    avatarUrl: "https://images.unsplash.com/photo-1663229048021-4fa9c1bf074d",
    avatarAlt: "Young girl with brown hair wearing yellow shirt",
    totalStars: 256,
    storiesCompleted: 18,
    totalReadingTime: 1224, // ~20 hours
    currentLevel: "Advanced Reader",
    lastActive: "2026-02-07T14:30:00Z",
  },
  {
    id: 2,
    name: "Noah",
    avatarUrl: "https://images.unsplash.com/photo-1535569387b8-9b38f1e72c3c",
    avatarAlt: "Young boy with blonde hair laughing",
    totalStars: 128,
    storiesCompleted: 9,
    totalReadingTime: 612, // ~10 hours
    currentLevel: "Curious Explorer",
    lastActive: "2026-02-06T18:45:00Z",
  },
  {
    id: 3,
    name: "Sophie",
    avatarUrl: "https://images.unsplash.com/photo-1518479768818-6b05fb1edda0",
    avatarAlt: "Young girl with curly hair smiling",
    totalStars: 89,
    storiesCompleted: 5,
    totalReadingTime: 380, // ~6 hours
    currentLevel: "Story Enthusiast",
    lastActive: "2026-02-08T10:15:00Z",
  },
];

// Mock milestones for Emma (advanced)
export const mockMilestonesEmma: Milestone[] = [
  {
    id: 1,
    title: "First Steps",
    starsRequired: 10,
    isCompleted: true,
    isCurrent: false,
    reward: "🎓 Beginner Badge",
    unlockedAt: "2025-12-01T09:00:00Z",
  },
  {
    id: 2,
    title: "Story Explorer",
    starsRequired: 50,
    isCompleted: true,
    isCurrent: false,
    reward: "🗺️ Explorer Badge",
    unlockedAt: "2026-01-05T14:00:00Z",
  },
  {
    id: 3,
    title: "Speed Reader",
    starsRequired: 100,
    isCompleted: true,
    isCurrent: false,
    reward: "⚡ Speed Reader Badge",
    unlockedAt: "2026-01-20T10:30:00Z",
  },
  {
    id: 4,
    title: "Master Reader",
    starsRequired: 200,
    isCompleted: true,
    isCurrent: false,
    reward: "👑 Master Badge",
    unlockedAt: "2026-02-05T15:20:00Z",
  },
  {
    id: 5,
    title: "Legend",
    starsRequired: 400,
    isCompleted: false,
    isCurrent: true,
    reward: "⭐ Legend Badge",
  },
];

// Mock milestones for Noah (intermediate)
export const mockMilestonesNoah: Milestone[] = [
  {
    id: 1,
    title: "First Steps",
    starsRequired: 10,
    isCompleted: true,
    isCurrent: false,
    reward: "🎓 Beginner Badge",
    unlockedAt: "2025-12-15T09:00:00Z",
  },
  {
    id: 2,
    title: "Story Explorer",
    starsRequired: 50,
    isCompleted: true,
    isCurrent: false,
    reward: "🗺️ Explorer Badge",
    unlockedAt: "2026-01-10T14:00:00Z",
  },
  {
    id: 3,
    title: "Speed Reader",
    starsRequired: 100,
    isCompleted: false,
    isCurrent: true,
    reward: "⚡ Speed Reader Badge",
  },
  {
    id: 4,
    title: "Master Reader",
    starsRequired: 200,
    isCompleted: false,
    isCurrent: false,
    reward: "👑 Master Badge",
  },
  {
    id: 5,
    title: "Legend",
    starsRequired: 400,
    isCompleted: false,
    isCurrent: false,
    reward: "⭐ Legend Badge",
  },
];

// Mock milestones for Sophie (beginner)
export const mockMilestonesSophie: Milestone[] = [
  {
    id: 1,
    title: "First Steps",
    starsRequired: 10,
    isCompleted: true,
    isCurrent: false,
    reward: "🎓 Beginner Badge",
    unlockedAt: "2026-01-20T09:00:00Z",
  },
  {
    id: 2,
    title: "Story Explorer",
    starsRequired: 50,
    isCompleted: false,
    isCurrent: true,
    reward: "🗺️ Explorer Badge",
  },
  {
    id: 3,
    title: "Speed Reader",
    starsRequired: 100,
    isCompleted: false,
    isCurrent: false,
    reward: "⚡ Speed Reader Badge",
  },
  {
    id: 4,
    title: "Master Reader",
    starsRequired: 200,
    isCompleted: false,
    isCurrent: false,
    reward: "👑 Master Badge",
  },
  {
    id: 5,
    title: "Legend",
    starsRequired: 400,
    isCompleted: false,
    isCurrent: false,
    reward: "⭐ Legend Badge",
  },
];

// Mock badges for Emma (advanced)
export const mockBadgesEmma: Badge[] = [
  {
    id: 1,
    name: "Speed Reader",
    icon: "⚡",
    description: "Completed a story in record time",
    unlockedAt: "2026-02-01T10:30:00Z",
    rarity: "uncommon",
  },
  {
    id: 2,
    name: "Riddle Master",
    icon: "🧩",
    description: "Solved 10 riddles correctly",
    unlockedAt: "2026-01-30T15:45:00Z",
    rarity: "rare",
  },
  {
    id: 3,
    name: "Story Explorer",
    icon: "🗺️",
    description: "Completed stories from 5 different categories",
    unlockedAt: "2026-01-28T09:20:00Z",
    rarity: "uncommon",
  },
  {
    id: 4,
    name: "Night Owl",
    icon: "🌙",
    description: "Read a story after 8 PM",
    unlockedAt: "2026-01-25T20:15:00Z",
    rarity: "common",
  },
  {
    id: 5,
    name: "Perfect Score",
    icon: "💯",
    description: "Solved a riddle on first attempt",
    unlockedAt: "2026-01-22T12:00:00Z",
    rarity: "rare",
  },
  {
    id: 6,
    name: "Consistent Reader",
    icon: "📚",
    description: "Read for 7 consecutive days",
    unlockedAt: "2026-01-15T18:30:00Z",
    rarity: "uncommon",
  },
];

// Mock badges for Noah (intermediate)
export const mockBadgesNoah: Badge[] = [
  {
    id: 1,
    name: "Story Explorer",
    icon: "🗺️",
    description: "Completed stories from 5 different categories",
    unlockedAt: "2026-01-28T09:20:00Z",
    rarity: "uncommon",
  },
  {
    id: 2,
    name: "Night Owl",
    icon: "🌙",
    description: "Read a story after 8 PM",
    unlockedAt: "2026-01-25T20:15:00Z",
    rarity: "common",
  },
  {
    id: 3,
    name: "Curious Mind",
    icon: "🤔",
    description: "Solved 5 riddles correctly",
    unlockedAt: "2026-01-18T14:00:00Z",
    rarity: "common",
  },
];

// Mock badges for Sophie (beginner)
export const mockBadgesSophie: Badge[] = [
  {
    id: 1,
    name: "First Story",
    icon: "📖",
    description: "Completed your first story",
    unlockedAt: "2026-01-28T10:00:00Z",
    rarity: "common",
  },
];

// Mock riddles for Emma
export const mockRiddlesEmma: Riddle[] = [
  {
    id: 1,
    title: "The River Riddle",
    difficulty: "Easy",
    solved: true,
    attempts: 1,
    successRate: 100,
    solvedAt: "2026-02-06T14:30:00Z",
    category: "Nature",
  },
  {
    id: 2,
    title: "Logic Chain",
    difficulty: "Medium",
    solved: true,
    attempts: 2,
    successRate: 50,
    solvedAt: "2026-02-05T16:45:00Z",
    category: "Logic",
  },
  {
    id: 3,
    title: "Mystery Box",
    difficulty: "Hard",
    solved: true,
    attempts: 3,
    successRate: 33,
    solvedAt: "2026-02-03T11:20:00Z",
    category: "Mystery",
  },
  {
    id: 4,
    title: "Word Play",
    difficulty: "Medium",
    solved: true,
    attempts: 1,
    successRate: 100,
    solvedAt: "2026-02-01T09:15:00Z",
    category: "Words",
  },
  {
    id: 5,
    title: "The Ancient Temple",
    difficulty: "Hard",
    solved: true,
    attempts: 4,
    successRate: 25,
    solvedAt: "2026-01-28T15:00:00Z",
    category: "Adventure",
  },
  {
    id: 6,
    title: "Number Secret",
    difficulty: "Medium",
    solved: false,
    attempts: 2,
    successRate: 0,
    category: "Math",
  },
];

// Mock riddles for Noah
export const mockRiddlesNoah: Riddle[] = [
  {
    id: 1,
    title: "The River Riddle",
    difficulty: "Easy",
    solved: true,
    attempts: 1,
    successRate: 100,
    solvedAt: "2026-02-04T14:30:00Z",
    category: "Nature",
  },
  {
    id: 2,
    title: "Logic Chain",
    difficulty: "Medium",
    solved: true,
    attempts: 3,
    successRate: 33,
    solvedAt: "2026-02-02T16:45:00Z",
    category: "Logic",
  },
  {
    id: 3,
    title: "Mystery Box",
    difficulty: "Hard",
    solved: false,
    attempts: 1,
    successRate: 0,
    category: "Mystery",
  },
];

// Mock riddles for Sophie
export const mockRiddlesSophie: Riddle[] = [
  {
    id: 1,
    title: "The River Riddle",
    difficulty: "Easy",
    solved: true,
    attempts: 2,
    successRate: 50,
    solvedAt: "2026-02-05T14:30:00Z",
    category: "Nature",
  },
];

// Mock time data for Emma (past 14 days)
export const mockTimeDataEmma: TimeEntry[] = [
  { date: "2026-01-26", minutes: 45, storiesRead: 1 },
  { date: "2026-01-27", minutes: 60, storiesRead: 1 },
  { date: "2026-01-28", minutes: 90, storiesRead: 2 },
  { date: "2026-01-29", minutes: 30, storiesRead: 1 },
  { date: "2026-01-30", minutes: 75, storiesRead: 1 },
  { date: "2026-01-31", minutes: 120, storiesRead: 2 },
  { date: "2026-02-01", minutes: 45, storiesRead: 1 },
  { date: "2026-02-02", minutes: 60, storiesRead: 1 },
  { date: "2026-02-03", minutes: 90, storiesRead: 2 },
  { date: "2026-02-04", minutes: 75, storiesRead: 1 },
  { date: "2026-02-05", minutes: 105, storiesRead: 2 },
  { date: "2026-02-06", minutes: 60, storiesRead: 1 },
  { date: "2026-02-07", minutes: 45, storiesRead: 1 },
  { date: "2026-02-08", minutes: 30, storiesRead: 1 },
];

// Mock time data for Noah
export const mockTimeDataNoah: TimeEntry[] = [
  { date: "2026-01-26", minutes: 30, storiesRead: 1 },
  { date: "2026-01-27", minutes: 45, storiesRead: 1 },
  { date: "2026-01-28", minutes: 0, storiesRead: 0 },
  { date: "2026-01-29", minutes: 60, storiesRead: 1 },
  { date: "2026-01-30", minutes: 30, storiesRead: 1 },
  { date: "2026-01-31", minutes: 0, storiesRead: 0 },
  { date: "2026-02-01", minutes: 45, storiesRead: 1 },
  { date: "2026-02-02", minutes: 60, storiesRead: 1 },
  { date: "2026-02-03", minutes: 30, storiesRead: 1 },
  { date: "2026-02-04", minutes: 0, storiesRead: 0 },
  { date: "2026-02-05", minutes: 45, storiesRead: 1 },
  { date: "2026-02-06", minutes: 60, storiesRead: 1 },
  { date: "2026-02-07", minutes: 30, storiesRead: 1 },
  { date: "2026-02-08", minutes: 0, storiesRead: 0 },
];

// Mock time data for Sophie
export const mockTimeDataSophie: TimeEntry[] = [
  { date: "2026-01-26", minutes: 20, storiesRead: 1 },
  { date: "2026-01-27", minutes: 30, storiesRead: 1 },
  { date: "2026-01-28", minutes: 45, storiesRead: 1 },
  { date: "2026-01-29", minutes: 0, storiesRead: 0 },
  { date: "2026-01-30", minutes: 25, storiesRead: 1 },
  { date: "2026-01-31", minutes: 0, storiesRead: 0 },
  { date: "2026-02-01", minutes: 30, storiesRead: 1 },
  { date: "2026-02-02", minutes: 20, storiesRead: 1 },
  { date: "2026-02-03", minutes: 35, storiesRead: 1 },
  { date: "2026-02-04", minutes: 0, storiesRead: 0 },
  { date: "2026-02-05", minutes: 40, storiesRead: 1 },
  { date: "2026-02-06", minutes: 30, storiesRead: 1 },
  { date: "2026-02-07", minutes: 25, storiesRead: 1 },
  { date: "2026-02-08", minutes: 20, storiesRead: 1 },
];

// Mock AI insights for Emma
export const mockInsightsEmma: AIInsight[] = [
  {
    id: 1,
    type: "achievement",
    title: "Exceptional Consistency",
    message:
      "Emma has read every day this week! This consistency is key to building strong reading habits and improving comprehension.",
    icon: "🌟",
  },
  {
    id: 2,
    type: "progress",
    title: "Rapid Progress",
    message:
      "Emma has earned 256 stars in just 2 months. She's in the top 10% of young readers in her age group.",
    icon: "🚀",
  },
  {
    id: 3,
    type: "area-for-growth",
    title: "Challenge Yourself",
    message:
      "Emma is mastering Easy and Medium difficulty riddles. Try recommending Hard riddles to further develop problem-solving skills.",
    icon: "💡",
  },
];

// Mock AI insights for Noah
export const mockInsightsNoah: AIInsight[] = [
  {
    id: 1,
    type: "motivation",
    title: "Almost There!",
    message:
      "Noah is 72 stars away from the Speed Reader badge. Encourage 2-3 more stories this week to reach this milestone.",
    icon: "💪",
  },
  {
    id: 2,
    type: "area-for-growth",
    title: "Reading Frequency",
    message:
      "Noah reads on average 4 days per week. Consistent daily reading would help accelerate progress by 43%.",
    icon: "📈",
  },
];

// Mock AI insights for Sophie
export const mockInsightsSophie: AIInsight[] = [
  {
    id: 1,
    type: "motivation",
    title: "Great Start!",
    message:
      "Sophie has unlocked her first badge! Continue encouraging reading sessions to maintain this positive momentum.",
    icon: "🎉",
  },
  {
    id: 2,
    type: "progress",
    title: "Next Milestone",
    message:
      "Sophie needs 41 more stars to reach the Story Explorer badge. She's making excellent progress for a new reader.",
    icon: "🎯",
  },
];

// Function to get complete dashboard data for a specific child
export function getChildDashboardData(childId: number): ChildDashboardData {
  const child = mockChildren.find((c) => c.id === childId) || mockChildren[0];

  let milestones: Milestone[];
  let badges: Badge[];
  let riddles: Riddle[];
  let timeData: TimeEntry[];
  let insights: AIInsight[];

  switch (childId) {
    case 1: // Emma
      milestones = mockMilestonesEmma;
      badges = mockBadgesEmma;
      riddles = mockRiddlesEmma;
      timeData = mockTimeDataEmma;
      insights = mockInsightsEmma;
      break;
    case 2: // Noah
      milestones = mockMilestonesNoah;
      badges = mockBadgesNoah;
      riddles = mockRiddlesNoah;
      timeData = mockTimeDataNoah;
      insights = mockInsightsNoah;
      break;
    case 3: // Sophie
      milestones = mockMilestonesSophie;
      badges = mockBadgesSophie;
      riddles = mockRiddlesSophie;
      timeData = mockTimeDataSophie;
      insights = mockInsightsSophie;
      break;
    default:
      milestones = mockMilestonesEmma;
      badges = mockBadgesEmma;
      riddles = mockRiddlesEmma;
      timeData = mockTimeDataEmma;
      insights = mockInsightsEmma;
  }

  return {
    child,
    milestones,
    badges,
    riddles,
    timeData,
    insights,
  };
}
