import {
  getBadges,
  getLevels,
  getStoryById,
} from "@/src/lib/content-service/server-api";
import {
  getChildById,
  getChildProgress,
  updateChildLevel,
  assignBadgeToChild,
} from "@/src/lib/progress-service/server-api";
import React from "react";
import StoryCompetion from "./StoryCompetion";
import { analyzeLevelProgress } from "../_lib/progress-analysis";
import { getTranslations } from "next-intl/server";
import MissingDataAlert from "@/src/components/shared/MissingDataAlert";

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ storyId: string }>;
  searchParams: Promise<{ childId: string; starsEarned?: string }>;
}) {
  const t = await getTranslations("StoryCompletion");

  const { storyId } = await params;
  const { childId } = (await searchParams) as {
    childId: string;
  };

  const child = await getChildById(childId);
  if (!child) {
    return <MissingDataAlert message={t("childNotFound")} />;
  }

  const story = await getStoryById(storyId);
  if (!story) {
    return <MissingDataAlert message={t("storyNotFound")} />;
  }

  const progress = await getChildProgress(childId, storyId);
  if (!progress) {
    return <MissingDataAlert message={t("progressNotFound")} />;
  }

  if (progress.status !== "COMPLETED") {
    return <MissingDataAlert message={t("storyNotCompleted")} />;
  }

  const badges = await getBadges().catch(() => []);
  const levels = await getLevels().catch(() => []);

  // Analyze child's level and badge progression
  const levelAnalysis = analyzeLevelProgress(
    child.currentLevel,
    child.totalStars,
    child.badges!,
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
