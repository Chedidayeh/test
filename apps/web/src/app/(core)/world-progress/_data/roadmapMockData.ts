// Mock data for roadmap worlds, stories, and child progress

export type StoryStatus = "locked" | "in-progress" | "completed";

export interface Story {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  chapters: number;
  challenges: number;
  starsRequired: number;
  starsEarned: number;
  status: StoryStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  order: number;
}

export interface World {
  id: string;
  name: string;
  theme: string;
  description: string;
  unlockLevel: number;
  icon: string; // emoji
  color: string; // Tailwind color class
  stories: Story[];
}

export interface ChildProgress {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  starsEarned: number;
  completedStories: string[]; // story IDs
  completedWorlds: string[]; // world IDs
}

// ======================
// WORLD 1: ENCHANTED FOREST
// ======================
export const WORLD_1: World = {
  id: "world-1",
  name: "Enchanted Forest",
  theme: "Magic & Mystique",
  description:
    "Begin your adventure in a magical forest filled with mystical creatures and ancient secrets.",
  unlockLevel: 1,
  icon: "🌲",
  color: "emerald",
  stories: [
    {
      id: "story-1-1",
      name: "The Lost Fairy",
      description: "Help a lost fairy find her way home.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",
      chapters: 3,
      challenges: 4,
      starsRequired: 0,
      starsEarned: 3,
      status: "completed",
      difficulty: 1,
      order: 1,
    },
    {
      id: "story-1-2",
      name: "Whispers of the Woods",
      description: "Discover the secrets hidden in the ancient trees.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 4,
      challenges: 5,
      starsRequired: 2,
      starsEarned: 2,
      status: "in-progress",
      difficulty: 2,
      order: 2,
    },
    {
      id: "story-1-3",
      name: "The Enchanted Bridge",
      description: "Cross the magical bridge to reach the Crystal Palace.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 4,
      challenges: 6,
      starsRequired: 4,
      starsEarned: 0,
      status: "locked",
      difficulty: 2,
      order: 3,
    },
    {
      id: "story-1-4",
      name: "Shadow of the Curse",
      description: "Break an ancient curse that haunts the forest.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 5,
      challenges: 7,
      starsRequired: 6,
      starsEarned: 0,
      status: "locked",
      difficulty: 3,
      order: 4,
    },
    {
      id: "story-1-5",
      name: "Rise of the Phoenix",
      description: "Witness the rebirth of a legendary creature.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 5,
      challenges: 8,
      starsRequired: 10,
      starsEarned: 0,
      status: "locked",
      difficulty: 3,
      order: 5,
    },
    {
      id: "story-1-6",
      name: "Guard of the Ancient Heart",
      description: "Protect the heart of the forest from dark forces.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 6,
      challenges: 10,
      starsRequired: 14,
      starsEarned: 0,
      status: "locked",
      difficulty: 4,
      order: 6,
    },
  ],
};

// ======================
// WORLD 2: OCEAN QUEST
// ======================
export const WORLD_2: World = {
  id: "world-2",
  name: "Ocean Quest",
  theme: "Adventure & Discovery",
  description:
    "Dive into the vast ocean to explore underwater kingdoms and marine mysteries.",
  unlockLevel: 3,
  icon: "🌊",
  color: "blue",
  stories: [
    {
      id: "story-2-1",
      name: "The Mermaid's Secret",
      description: "Uncover the mysterious tale of a hidden mermaid kingdom.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 4,
      challenges: 5,
      starsRequired: 0,
      starsEarned: 0,
      status: "locked",
      difficulty: 2,
      order: 1,
    },
    {
      id: "story-2-2",
      name: "Coral Castle Quest",
      description: "Explore the magnificent castle made of living coral.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 4,
      challenges: 6,
      starsRequired: 3,
      starsEarned: 0,
      status: "locked",
      difficulty: 2,
      order: 2,
    },
    {
      id: "story-2-3",
      name: "The Kraken's Treasure",
      description:
        "Search for the legendary treasure guarded by the great Kraken.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 5,
      challenges: 7,
      starsRequired: 8,
      starsEarned: 0,
      status: "locked",
      difficulty: 3,
      order: 3,
    },
    {
      id: "story-2-4",
      name: "Lighthouse Guardian",
      description: "Help the keeper restore light to guide lost ships home.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 4,
      challenges: 6,
      starsRequired: 12,
      starsEarned: 0,
      status: "locked",
      difficulty: 3,
      order: 4,
    },
    {
      id: "story-2-5",
      name: "Deep Sea Wonders",
      description: "Discover bioluminescent creatures of the deepest trenches.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 5,
      challenges: 8,
      starsRequired: 16,
      starsEarned: 0,
      status: "locked",
      difficulty: 4,
      order: 5,
    },
    {
      id: "story-2-6",
      name: "The Ocean's Heart",
      description: "Journey to the sacred center of all ocean magic.",
      coverImage:
        "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",

      chapters: 6,
      challenges: 10,
      starsRequired: 20,
      starsEarned: 0,
      status: "locked",
      difficulty: 4,
      order: 6,
    },
  ],
};

// ======================
// CHILD PROGRESS
// ======================
export const MOCK_CHILD_PROGRESS: ChildProgress = {
  currentLevel: 2,
  currentXP: 85,
  xpToNextLevel: 150,
  totalXP: 185,
  starsEarned: 5,
  completedStories: ["story-1-1"],
  completedWorlds: [],
};

// All worlds collection
export const ALL_WORLDS = [WORLD_1, WORLD_2];
