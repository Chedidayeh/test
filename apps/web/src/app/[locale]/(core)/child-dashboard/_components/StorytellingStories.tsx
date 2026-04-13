"use client";

import { ChildProfile, ProgressStatus, StorytellingStory } from "@readdly/shared-types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { useLocale } from "@/src/contexts/LocaleContext";

interface StorytellingStoriesProps {
  childProfile: ChildProfile;
}

const StorytellingStories = ({ childProfile }: StorytellingStoriesProps) => {
  const t = useTranslations("ChildDashboard");
  const { isRTL } = useLocale();

  // Return null if no storytelling profile or no stories
  if (!childProfile.storytelling || !childProfile.storytelling.stories || childProfile.storytelling.stories.length === 0) {
    return null;
  }

  const stories = childProfile.storytelling.stories;
  console.log("Rendering StorytellingStories with stories:", stories);

  const getStatusBadgeColor = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case ProgressStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case ProgressStatus.NOT_STARTED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: ProgressStatus): string => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return t("storytelling.status.completed");
      case ProgressStatus.IN_PROGRESS:
        return t("storytelling.status.inProgress");
      case ProgressStatus.NOT_STARTED:
        return t("storytelling.status.notStarted");
      default:
        return status;
    }
  };

  const shouldShowReadingInterface = (status: ProgressStatus): boolean => {
    return status === ProgressStatus.NOT_STARTED || status === ProgressStatus.IN_PROGRESS;
  };

  const getStoryHref = (story: StorytellingStory): string => {
    if (shouldShowReadingInterface(story.status)) {
      return `/story-reading-interface/${story.storyId}?childId=${childProfile.child!.id}`;
    }
    // For completed stories, link to story detail/summary page
    return `/storytelling/${story.storyId}`;
  };

  return (
    <div className="bg-card border border-black/30 rounded-xl p-4 md:p-6 shadow-warm-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-xl md:text-2xl lg:text-3xl text-foreground">
            {t("storytelling.title")}
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {stories.map((story: StorytellingStory) => (
          <Link
            key={story.id}
            href={getStoryHref(story)}
            className="group block"
          >
            <div className="bg-background border border-black/20 rounded-lg p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-warm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Story Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base md:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("storytelling.generatedDate")} {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(story.status)}`}>
                    {getStatusLabel(story.progress?.status || story.status)}
                  </span>
                  {isRTL ? (
                    <ChevronRightIcon size={18} className="rotate-180 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  ) : (
                    <ChevronRightIcon size={18} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show more stories link if available */}
      {stories.length > 0 && (
        <Link
          href="/storytelling"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth mt-4"
        >
          <span className="font-body font-medium text-sm">
            {t("storytelling.viewAll")}
          </span>
          {isRTL ? (
            <ChevronRightIcon size={18} className="rotate-180" />
          ) : (
            <ChevronRightIcon size={18} />
          )}
        </Link>
      )}
    </div>
  );
};

export default StorytellingStories;

