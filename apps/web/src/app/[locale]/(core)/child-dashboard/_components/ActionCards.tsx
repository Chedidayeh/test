/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { BookMarked, MapPlus } from "lucide-react";
import { Progress, Roadmap, ProgressStatus, ChildProfile, Story, Chapter, LanguageCode } from "@readdly/shared-types";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
import { getLanguageCode } from "@/src/lib/translation-utils";

interface StoryCardData {
  storyId: string;
  title: string;
  coverImage: string;
  coverAlt: string;
  totalChapters: number;
  chapters: Chapter[];
}

interface ActionCardsProps {
  currentProgresses: Progress[];
  roadmaps: Roadmap[];
  childProfile: ChildProfile;
}

const ActionCards = ({
  currentProgresses,
  roadmaps,
  childProfile,
}: ActionCardsProps) => {
    const t = useTranslations("ChildDashboard");
      const { isRTL, locale } = useLocale();
      const langCode = getLanguageCode(locale);
  
  // Helper function to find story details from roadmaps
  const findStoryDetails = (storyId: string): StoryCardData | null => {
    for (const roadmap of roadmaps) {
      for (const world of roadmap.worlds) {
        const story = world.stories.find((s) => s.id === storyId);
        if (story) {
          const totalChapters = story.chapters?.length || 1;
          const translation = story.translations?.find(
            (tr: { languageCode: LanguageCode }) => tr.languageCode === langCode,
          );
          const title = translation?.title || story.title;

          return {
            storyId: story.id,
            title,
            coverImage: roadmap.theme.imageUrl!,
            coverAlt: title,
            totalChapters,
            chapters: story.chapters || [],
          };
        }
      }
    }
    return null;
  };

  // Filter stories that are in progress
  const inProgressStories = currentProgresses
    .filter((progress) => progress.status === ProgressStatus.IN_PROGRESS)
    .map((progress) => ({
      progressId: progress.id,
      storyData: findStoryDetails(progress.storyId!),
      progress: progress,
    }))
    .filter((item) => item.storyData !== null) as Array<{
    progressId: string;
    storyData: StoryCardData;
    progress: Progress;
  }>;

  return (
    <div className="bg-card border border-black/30 rounded-xl p-6 shadow-warm-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl md:text-3xl text-foreground">
          {t("continueReading")}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* In Progress Stories Cards */}
        {inProgressStories.length > 0 &&
          inProgressStories.map(({ progressId, storyData, progress }) => {
            // Calculate progress chapters using the chapter's order property
            let progressChapters = 0;
            const gameSession = progress.gameSession;
            
            if (gameSession?.chapterId) {
              const lastChapter = storyData.chapters.find(
                (chapter) => chapter.id === gameSession.chapterId
              );
              if (lastChapter) {
                progressChapters = lastChapter.order;
              }
            }

            return (
              <Link
                key={progressId}
                href={`/story-reading-interface/${storyData.storyId}?childId=${childProfile.child.id}`}
                className="bg-black/90 text-white rounded-xl h-52 p-4 shadow-warm-lg group relative overflow-hidden transform-gpu transition-transform duration-300 hover:scale-105  hover:z-20"
              >
                <div className="absolute inset-0 opacity-20">
                  <img
                    src={storyData.coverImage}
                    alt={storyData.coverAlt}
                    className="w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="bg-primary/80 rounded-full px-3 py-1">
                        <BookMarked size={20} className="text-white" />
                      </div>
                      <div className="bg-primary/80 rounded-full px-3 py-1">
                        <span className="font-data text-sm font-medium">
                          {progressChapters}/{storyData.totalChapters}
                        </span>
                      </div>
                    </div>
                    <div className="max-w-max mx-auto rounded-xl opacity-90">
                      <h2 className="font-heading text-xl text-center">
                        {storyData.title}
                      </h2>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-smooth"
                      style={{
                        width: `${(progressChapters / storyData.totalChapters) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default ActionCards;
