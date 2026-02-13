/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import ActionCards from "./ActionCards";
import WelcomeBanner from "./WelcomeBanner";
import ProgressTracker from "./ProgressTracker";
import StoryRecommendations from "./StoryRecommendations";
import QuickActions from "./QuickActions";

interface ChildDashboardInteractiveProps {
  childData: {
    name: string;
    avatarUrl: string;
    avatarAlt: string;
    totalStars: number;
    recentBadges: Array<{
      id: number;
      name: string;
      icon: string;
      unlockedAt: string;
    }>;
  };
  continueStory: {
    id: number;
    title: string;
    coverImage: string;
    coverAlt: string;
    progress: number;
    totalPages: number;
  } | null;
  milestones: Array<{
    id: number;
    title: string;
    starsRequired: number;
    isCompleted: boolean;
    isCurrent: boolean;
    reward: string;
  }>;
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
}

const ChildDashboardInteractive = ({
  childData,
  continueStory,
  milestones,
  recommendedStories,
}: ChildDashboardInteractiveProps) => {
  return (
      <div className="hidden md:grid md:grid-cols-4 gap-6 container mx-auto px-4">
        {/* Left Sidebar - Progress Tracker */}
        <div className="md:col-span-1 top-8">
          <ProgressTracker
            currentStars={childData.totalStars}
            milestones={milestones}
          />
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          {/* Welcome Banner */}
          <WelcomeBanner
            childName={childData.name}
            avatarUrl={childData.avatarUrl}
            avatarAlt={childData.avatarAlt}
            totalStars={childData.totalStars}
            recentBadges={childData.recentBadges}
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
