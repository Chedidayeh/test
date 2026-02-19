import type { Metadata } from "next";
import ChildDashboardInteractive from "../_components/ChildDashboardInteractive";
import { getChildById } from "@/src/lib/progress-service/server-api";
import {
  getBadgeById,
  getBadges,
  getLevels,
} from "@/src/lib/content-service/server-api";

export const metadata: Metadata = {
  title: "My Dashboard - Readly",
  description:
    "Track your reading progress, discover new stories, and celebrate your achievements in your personalized learning hub.",
};

const mockChildData = {
  name: "Emma",
  avatarUrl: "https://images.unsplash.com/photo-1663229048021-4fa9c1bf074d",
  avatarAlt:
    "Young girl with brown hair wearing yellow shirt smiling at camera",
  totalStars: 127,
  recentBadges: [
    {
      id: 1,
      name: "Speed Reader",
      icon: "⚡",
      unlockedAt: "2026-02-01T10:30:00Z",
    },
    {
      id: 2,
      name: "Riddle Master",
      icon: "🧩",
      unlockedAt: "2026-01-30T15:45:00Z",
    },
    {
      id: 3,
      name: "Story Explorer",
      icon: "🗺️",
      unlockedAt: "2026-01-28T09:20:00Z",
    },
  ],
};

const mockContinueStory = {
  id: 1,
  title: "The Magical Forest Adventure",
  coverImage: "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",
  coverAlt:
    "Enchanted forest with tall trees and glowing magical lights in misty atmosphere",
  progress: 8,
  totalPages: 15,
};

const mockMilestones = [
  {
    id: 1,
    title: "Beginner",
    starsRequired: 50,
    isCompleted: true,
    isCurrent: false,
    reward: "Reading Badge",
  },
  {
    id: 2,
    title: "Explorer",
    starsRequired: 100,
    isCompleted: true,
    isCurrent: false,
    reward: "Explorer Trophy",
  },
  {
    id: 3,
    title: "Champion",
    starsRequired: 150,
    isCompleted: false,
    isCurrent: true,
    reward: "Golden Book",
  },
  {
    id: 4,
    title: "Master",
    starsRequired: 250,
    isCompleted: false,
    isCurrent: false,
    reward: "Master Crown",
  },
  {
    id: 5,
    title: "Legend",
    starsRequired: 500,
    isCompleted: false,
    isCurrent: false,
    reward: "Legend Medal",
  },
];

const mockRecommendedStories = [
  {
    id: 2,
    title: "The Dragon\'s Secret",
    coverImage:
      "https://img.rocket.new/generatedImages/rocket_gen_img_1a024d051-1767778920701.png",
    coverAlt:
      "Majestic dragon with red scales flying over mountain peaks at sunset",
    difficulty: "Medium" as const,
    isCompleted: false,
    isLocked: false,
    description:
      "Join a brave knight on a quest to discover what the ancient dragon is hiding in the mountain caves.",
  },
  {
    id: 3,
    title: "Space Explorers",
    coverImage: "https://images.unsplash.com/photo-1700173318258-3c0134576743",
    coverAlt:
      "Colorful view of Earth from space with stars and galaxies in background",
    difficulty: "Easy" as const,
    isCompleted: true,
    isLocked: false,
    description:
      "Travel through the galaxy with Captain Luna and discover amazing planets and friendly aliens.",
  },
  {
    id: 4,
    title: "The Underwater Kingdom",
    coverImage: "https://images.unsplash.com/photo-1724257454938-569ee2228430",
    coverAlt:
      "Vibrant coral reef underwater scene with colorful fish swimming through clear blue water",
    difficulty: "Hard" as const,
    isCompleted: false,
    isLocked: true,
    starsRequired: 200,
    description:
      "Dive deep into the ocean to help the mermaid princess solve the mystery of the missing pearls.",
  },
];

export default async function ChildDashboardPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const childData = await getChildById(childId);
  const levels = await getLevels().catch(() => []);
  const badges = await getBadges().catch(() => []);
  
  
  return (
    <>
      <div className="min-h-screen p-4 ">
        <ChildDashboardInteractive
          continueStory={mockContinueStory}
          recommendedStories={mockRecommendedStories}
          levels={levels}
          allBadges={badges}
          child={childData}
        />
      </div>
    </>
  );
}
