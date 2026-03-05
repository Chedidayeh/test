/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "motion/react";
import { BookOpen, Lock, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { World, ChildProfile, Roadmap, RoleType, Local, LanguageCode } from "@shared/types";
import { useLocale } from "next-intl";
import { getEnrichedStoriesForWorld } from "../../_lib/helpers";

interface StoriesRoadmapProps {
  userRole: RoleType;
  selectedWorld: World;
  roadmap: Roadmap;
  childProfile: ChildProfile;
}

export default function StoriesRoadmap({
  userRole,
  selectedWorld,
  roadmap,
  childProfile,
}: StoriesRoadmapProps) {
  const t = useTranslations("ChildDashboard");
  const locale = useLocale();

  const getLanguageCode = () => {
    const baseLocale = (locale || Local.EN).split("-")[0].toUpperCase();
    if (baseLocale === "EN") return LanguageCode.EN;
    if (baseLocale === "AR") return LanguageCode.AR;
    if (baseLocale === "FR") return LanguageCode.FR;
    return LanguageCode.EN;
  };

  const langCode = getLanguageCode();

  const getLocalizedStory = (story: World["stories"][0]) => {
    const translation = story.translations?.find((tr: { languageCode: LanguageCode }) => tr.languageCode === langCode);
    return {
      title: translation?.title || story.title,
      description: translation?.description || story.description,
    };
  };
  // Enrich all stories with progress data (includes cross-world locking)
  const enrichedStories = getEnrichedStoriesForWorld(
    selectedWorld,
    roadmap,
    childProfile,
  );

  // Apply within-world progressive locking: lock story if previous one in same world is not completed
  const progressiveLockedStories = enrichedStories.map((story) => {
    // If already locked by cross-world logic, keep it locked
    if (story.status === "locked") {
      return story;
    }

    // If this is not the first story in the world, check if previous story is completed
    if (story.order > 1) {
      const previousStory = enrichedStories.find(
        (s) => s.order === story.order - 1,
      );
      if (previousStory && previousStory.status !== "completed") {
        // Lock this story if previous in same world is not completed
        return { ...story, status: "locked" as const };
      }
    }

    return story;
  });

  if (progressiveLockedStories.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-4">
        <p className="text-muted-foreground">
          {t("roadmapPage.storiesRoadmap.noStories")}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={selectedWorld.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Main Roadmap Container - Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 py-6">
        {progressiveLockedStories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <div
              className={`relative h-44 md:h-64 rounded-xl overflow-hidden group transition-all duration-300 ${
                story.status === "locked"
                  ? "opacity-60 hover:opacity-75"
                  : "hover:shadow-lg hover:scale-105"
              }`}
            >
              {/* Background Image */}
              <img
                src={roadmap.theme.imageUrl}
                alt={story.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

              {/* Lock Icon - if locked */}
              {story.status === "locked" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-4">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                {/* Top: Status Badge & Hover Info */}
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm px-3 py-1 rounded-full backdrop-blur-sm ${
                      story.status === "completed"
                        ? "bg-accent text-white"
                        : story.status === "in_progress"
                          ? "bg-secondary text-white"
                          : story.status === "locked"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-primary text-white"
                    }`}
                  >
                    {story.status === "completed" && t("roadmapPage.storiesRoadmap.status.completed")}
                    {story.status === "in_progress" &&
                      t("roadmapPage.storiesRoadmap.status.inProgress", { percentage: story.completionPercentage })}
                    {story.status === "locked" && t("roadmapPage.storiesRoadmap.status.locked")}
                    {story.status === "not_started" && t("roadmapPage.storiesRoadmap.status.notStarted")}
                  </span>
                  <div className="md:flex items-center hidden gap-2 scale-95 opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                    <div className="flex items-center gap-1 text-white backdrop-blur-sm bg-accent rounded-2xl px-3 py-1">
                      <BookOpen className="w-4 h-4" />
                      <div className="text-sm">
                        {story.chapters.length} {t("roadmapPage.storiesRoadmap.chapters")}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-white backdrop-blur-sm bg-secondary rounded-2xl px-3 py-1">
                      <Zap className="w-4 h-4" />
                      <div className="text-sm">
                        {story.challengeCount} {t("roadmapPage.storiesRoadmap.challenges")}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Centered Buttons (Hidden until hover) */}

                {userRole === RoleType.PARENT && (
                  <div className="max-w-max mx-auto transition-all duration-200 md:scale-95 md:translate-y-2 md:pointer-events-none opacity-100 md:group-hover:scale-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto">
                    {story.status === "completed" && (
                      <Link
                        href={`/story-replaying-interface/${story.id}?childId=${childProfile.child.id}`}
                      >
                        <Button variant={"accent"} className="w-max">
                          {t("roadmapPage.storiesRoadmap.buttons.readAgain")}
                        </Button>
                      </Link>
                    )}

                    {story.status === "in_progress" && (
                      <Link
                        href={`/story-reading-interface/${story.id}?childId=${childProfile.child.id}`}
                      >
                        <Button className="w-max">
                          {t("roadmapPage.storiesRoadmap.buttons.continueReading")}
                        </Button>
                      </Link>
                    )}

                    {story.status === "not_started" && (
                      <Link
                        href={`/story-reading-interface/${story.id}?childId=${childProfile.child.id}`}
                      >
                        <Button className="w-max">
                          {t("roadmapPage.storiesRoadmap.buttons.startReading")}
                        </Button>
                      </Link>
                    )}
                  </div>
                )}

                {/* Bottom: Title and Description */}
                <div>
                  {(() => {
                    const localized = getLocalizedStory(story);
                    return (
                      <>
                        <h3 className="font-heading text-lg font-bold text-white mb-1">
                          {localized.title}
                        </h3>
                        <p className="text-sm text-gray-200 line-clamp-2">
                          {localized.description}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
