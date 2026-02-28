import { getBadges, getLevels, getStoryById } from "@/src/lib/content-service/server-api";
import { getChildById, getChildProgress, updateChildLevel, assignBadgeToChild } from "@/src/lib/progress-service/server-api";
import React from "react";
import StoryCompetion from "./StoryCompetion";
import { analyzeLevelProgress } from "../_lib/progress-analysis";

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ storyId: string }>;
  searchParams: Promise<{ childId: string; starsEarned?: string }>;
}) {
  const { storyId } = await params;
  const { childId } = (await searchParams) as {
    childId: string;
  };

  const child = await getChildById(childId);
  if (!child) {
    return (
      <div className="p-4 text-red-500">
        Child not found for childId: {childId}
      </div>
    );
  }

  const story = await getStoryById(storyId);
  if (!story) {
    return (
      <div className="p-4 text-red-500">Story not found for id: {storyId}</div>
    );
  }

  const progress = await getChildProgress(childId, storyId);
  if (!progress) {
    return (
      <div className="p-4 text-red-500">
        Progress not found for childId: {childId}, storyId: {storyId}
      </div>
    );
  }

  if(progress.status !== "COMPLETED") {
    return (
      <div className="p-4 text-red-500">
        Story is not marked as completed. Current status: {progress.status}
      </div>
    );
  }

  const badges = await getBadges().catch(() => []);
  const levels = await getLevels().catch(() => []);

  // Analyze child's level and badge progression
  const levelAnalysis = analyzeLevelProgress(
    child.currentLevel,
    child.totalStars,
    child.badges,
    levels,
    badges,
  );

  // Update child profile if new level is unlocked
  if (levelAnalysis.willReachNextLevel) {
    console.log(
      `[Story Completion] Child ${childId} unlocked Level ${levelAnalysis.nextLevelNumber}`,
    );
    await updateChildLevel(childId, levelAnalysis.nextLevelNumber);
  }

  // Assign badge if child earned one
  if (levelAnalysis.willEarnNextBadge && levelAnalysis.nextBadge) {
    console.log(
      `[Story Completion] Child ${childId} earned badge: ${levelAnalysis.nextBadge.name}`,
    );
    await assignBadgeToChild(childId, levelAnalysis.nextBadge.id);
  }

  return (
    <StoryCompetion
      child={child}
      story={story}
      progress={progress}
      levelAnalysis={levelAnalysis}
    />
  );
}
