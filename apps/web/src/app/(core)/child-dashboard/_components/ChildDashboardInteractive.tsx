
"use client";

import ActionCards from "./ActionCards";
import WelcomeBanner from "./WelcomeBanner";
import ProgressTracker from "./ProgressTracker";
import { Badge, ChildProfile, Level, Progress, Roadmap, ProgressStatus } from "@shared/types";
import {
  getStoriesCompleted,
  getTotalReadingTime,
} from "../../parent-dashboard/_lib/stats";
import Roadmaps from "./Roadmaps";
import { useState } from "react";
import RoadmapPage from "../_roadmap_progress/RoadmapPage";

interface ChildDashboardInteractiveProps {
  levels: Level[];
  allBadges: Badge[];
  child: ChildProfile;
  roadmaps: Roadmap[];
  currentProgresses: Progress[];
}

const ChildDashboardInteractive = ({
  levels,
  allBadges,
  child,
  roadmaps,
  currentProgresses,
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

  // Check if child has any in-progress stories
  const hasInProgressStories = currentProgresses.some(
    (progress) => progress.status === ProgressStatus.IN_PROGRESS
  );

  const hours = Math.floor(readingTimeMinutes / 60);
  const minutes = readingTimeMinutes % 60;
  const readingTimeSubtitle =
    minutes > 0 ? `(${hours}h ${minutes}m)` : `(${hours}h)`;


  return (
    <>
      {seeRoadmap ? (
        <RoadmapPage child={child} roadmap={selectedRoadmap} setSeeRoadmap={setSeeRoadmap} />
      ) : (
        <div className="hidden md:grid md:grid-cols-4 gap-6 container mx-auto px-4">
          {/* Left Sidebar - Progress Tracker */}
          <div className="md:col-span-1 top-8">
            <ProgressTracker
              currentStars={child.totalStars || 0}
              levels={levels}
              currentLevel={child.currentLevel || 1}
            />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-4">
            {/* Welcome Banner */}
            <WelcomeBanner
              childName={child.child.name || "Young Reader"}
              avatar={child.child.avatar}
              currentLevel={child.currentLevel || 1}
              totalStars={child.totalStars || 0}
              recentBadges={childBadges}
              storiesCompleted={storiesCompleted}
              readingTimeMinutes={readingTimeMinutes}
              readingTimeSubtitle={readingTimeSubtitle}
            />

            {/* Action Cards */}
            {hasInProgressStories && (
              <ActionCards currentProgresses={currentProgresses} roadmaps={roadmaps} childProfile={child} />
            )}

            <Roadmaps roadmaps={roadmaps} setSelectedRoadmap={setSelectedRoadmap} setSeeRoadmap={setSeeRoadmap} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChildDashboardInteractive;
