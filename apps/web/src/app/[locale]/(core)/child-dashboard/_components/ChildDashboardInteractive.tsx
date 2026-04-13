"use client";

import ActionCards from "./ActionCards";
import WelcomeBanner from "./WelcomeBanner";
import ProgressTracker from "./ProgressTracker";
import {
  Badge,
  ChildProfile,
  Level,
  Progress,
  Roadmap,
  ProgressStatus,
  RoleType,
} from "@readdly/shared-types";
import {
  getStoriesCompleted,
  getTotalReadingTime,
} from "../../parent-dashboard/_lib/stats";
import Roadmaps from "./Roadmaps";
import StorytellingStories from "./StorytellingStories";
import { useState } from "react";
import RoadmapPage from "../_roadmap_progress/RoadmapPage";

interface ChildDashboardInteractiveProps {
  levels: Level[];
  allBadges: Badge[];
  child: ChildProfile;
  roadmaps: Roadmap[];
  currentProgresses: Progress[];
  userRole: RoleType;
}

const ChildDashboardInteractive = ({
  levels,
  allBadges,
  child,
  roadmaps,
  currentProgresses,
  userRole,
}: ChildDashboardInteractiveProps) => {
  const childBadges =
    child.badges
      ?.map((childBadge) =>
        allBadges.find((badge) => badge.id === childBadge.badgeId),
      )
      .filter((badge) => badge !== undefined) || [];

  const storiesCompleted = getStoriesCompleted(child);
  const readingTimeMinutes = getTotalReadingTime(child);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap>(roadmaps[0]);
  const [seeRoadmap, setSeeRoadmap] = useState(false);

  // Filter to only include roadmap progress (exclude storytelling progress)
  const roadmapProgresses = currentProgresses.filter(
    (progress) => !progress.storytellingStoryId
  );

  // Check if child has any in-progress roadmap stories
  const hasInProgressStories = roadmapProgresses.some(
    (progress) => progress.status === ProgressStatus.IN_PROGRESS
  );

  console.log(roadmapProgresses, "Roadmap Progresses");

  const hours = Math.floor(readingTimeMinutes / 60);
  const minutes = readingTimeMinutes % 60;
  const readingTimeSubtitle =
    minutes > 0 ? `(${hours}h ${minutes}m)` : `(${hours}h)`;
  return (
    <>
      {seeRoadmap ? (
        <RoadmapPage
          userRole={userRole}
          child={child}
          roadmap={selectedRoadmap}
          setSeeRoadmap={setSeeRoadmap}
        />
      ) : (
        <>
          {/* Mobile View */}
          <div className="lg:hidden space-y-4 container mx-auto px-4 py-4">
            {/* Welcome Banner */}
            <WelcomeBanner
              childName={child.child!.name || "Young Reader"}
              avatar={child.child!.avatar!}
              currentLevel={child.currentLevel || 1}
              totalStars={child.totalStars || 0}
              recentBadges={childBadges}
              storiesCompleted={storiesCompleted}
              readingTimeMinutes={readingTimeMinutes}
              readingTimeSubtitle={readingTimeSubtitle}
            />

            {/* Action Cards */}
            {hasInProgressStories && userRole === RoleType.PARENT && (
              <ActionCards
                currentProgresses={roadmapProgresses}
                roadmaps={roadmaps}
                childProfile={child}
              />
            )}

            {/* Roadmaps */}
            <Roadmaps
              roadmaps={roadmaps}
              setSelectedRoadmap={setSelectedRoadmap}
              setSeeRoadmap={setSeeRoadmap}
            />

            {/* Storytelling Weekly Stories */}
            <StorytellingStories childProfile={child} />

            {/* Progress Tracker */}
            <ProgressTracker
              currentStars={child.totalStars || 0}
              levels={levels}
              currentLevel={child.currentLevel || 1}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6  mx-auto px-4 py-4">
            {/* Left Sidebar - Progress Tracker */}
            <div className="lg:col-span-1 sticky top-8 h-fit">
              <ProgressTracker
                currentStars={child.totalStars || 0}
                levels={levels}
                currentLevel={child.currentLevel || 1}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Welcome Banner */}
              <WelcomeBanner
                childName={child.child!.name || "Young Reader"}
                avatar={child.child!.avatar!}
                currentLevel={child.currentLevel || 1}
                totalStars={child.totalStars || 0}
                recentBadges={childBadges}
                storiesCompleted={storiesCompleted}
                readingTimeMinutes={readingTimeMinutes}
                readingTimeSubtitle={readingTimeSubtitle}
              />

              {/* Action Cards */}
              {hasInProgressStories && userRole === RoleType.PARENT && (
                <ActionCards
                  currentProgresses={roadmapProgresses}
                  roadmaps={roadmaps}
                  childProfile={child}
                />
              )}

              {/* Roadmaps */}
              <Roadmaps
                roadmaps={roadmaps}
                setSelectedRoadmap={setSelectedRoadmap}
                setSeeRoadmap={setSeeRoadmap}
              />

              {/* Storytelling Weekly Stories */}
              <StorytellingStories childProfile={child} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChildDashboardInteractive;
