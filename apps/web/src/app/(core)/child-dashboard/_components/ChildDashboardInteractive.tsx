/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import ActionCards from "./ActionCards";
import WelcomeBanner from "./WelcomeBanner";
import ProgressTracker from "./ProgressTracker";
import StoryRecommendations from "./StoryRecommendations";
import QuickActions from "./QuickActions";
import { Badge, ChildProfile, Level } from "@shared/types";
import { getStoriesCompleted, getTotalReadingTime } from "../../parent-dashboard/_lib/stats";

interface ChildDashboardInteractiveProps {
  continueStory: {
    id: number;
    title: string;
    coverImage: string;
    coverAlt: string;
    progress: number;
    totalPages: number;
  } | null;

  recommendedStories: Array<{
    id: number;
    title: string;
    coverImage: string;
    coverAlt: string;
    difficulty: "Easy" | "Medium" | "Hard";
    isCompleted: boolean;
    isLocked: boolean;
    starsRequired?: number;
    description: string;
  }>;
  levels: Level[];
  allBadges: Badge[];
  child: ChildProfile | undefined;
}

const ChildDashboardInteractive = ({
  continueStory,
  recommendedStories,
  levels,
  allBadges,
  child,
}: ChildDashboardInteractiveProps) => {
  const childBadges =
    child?.badges
      ?.map((childBadge) =>
        allBadges.find((badge) => badge.id === childBadge.badgeId),
      )
      .filter((badge) => badge !== undefined) || [];

  const storiesCompleted = getStoriesCompleted(child);
  const readingTimeMinutes = getTotalReadingTime(child);

  return (
    <div className="hidden md:grid md:grid-cols-4 gap-6 container mx-auto px-4">
      {/* Left Sidebar - Progress Tracker */}
      <div className="md:col-span-1 top-8">
        <ProgressTracker
          currentStars={child?.totalStars || 0}
          levels={levels}
          currentLevel={child?.currentLevel || 1}
        />
      </div>

      {/* Main Content */}
      <div className="md:col-span-3 space-y-8">
        {/* Welcome Banner */}
        <WelcomeBanner
          childName={child?.child.name || "Young Reader"}
          avatar={child?.child.avatar}
          currentLevel={child?.currentLevel || 1}
          totalStars={child?.totalStars || 0}
          recentBadges={childBadges}
          storiesCompleted={storiesCompleted}
          readingTimeMinutes={readingTimeMinutes}
        />

        {/* Action Cards */}
        <ActionCards continueStory={continueStory} />

        {/* Story Recommendations */}
        <StoryRecommendations stories={recommendedStories} />
      </div>
    </div>
  );
};

export default ChildDashboardInteractive;
