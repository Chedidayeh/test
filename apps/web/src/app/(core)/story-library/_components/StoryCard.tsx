"use client";

import { Button } from "@/src/components/ui/button";
import {
  CircleCheck,
  CircleCheckIcon,
  ClockIcon,
  HeartIcon,
  LockIcon,
  StarIcon,
} from "lucide-react";
import { useState } from "react";

interface StoryCardProps {
  story: {
    id: number;
    title: string;
    coverImage: string;
    coverAlt: string;
    category: string;
    readingLevel: string;
    readingTime: number;
    stars: number;
    isLocked: boolean;
    isCompleted: boolean;
    progress: number;
    isFavorite: boolean;
  };
  onStoryClick: (id: number) => void;
  onFavoriteToggle: (id: number) => void;
}

const StoryCard = ({
  story,
  onStoryClick,
  onFavoriteToggle,
}: StoryCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-foreground/10 shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-300 overflow-hidden group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={story.coverImage}
          alt={story.coverAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Lock Overlay */}
        {story.isLocked && (
          <div className="absolute inset-0 bg-foreground/85 dark:bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <LockIcon className="w-8 h-8 text-white mb-2 mx-auto" />
              <span className="font-heading text-white text-sm font-semibold">
                Unlock with 50 stars
              </span>
            </div>
          </div>
        )}

        {/* Completion Badge */}
        {story.isCompleted && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-md border border-primary/20">
            <CircleCheckIcon className="w-4 h-4" />
            <span className="font-caption text-xs font-bold">Completed</span>
          </div>
        )}
      </div>

      {/* Story Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-heading text-base font-bold text-foreground line-clamp-2 flex-1">
            {story.title}
          </h3>
          {story.stars > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0 bg-primary/10 px-2 py-1 rounded-lg">
              <StarIcon className="w-4 h-4 text-primary fill-primary" />
              <span className="font-data text-xs font-bold text-primary">
                {story.stars}
              </span>
            </div>
          )}
        </div>

        {/* Category & Level */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-caption font-semibold">
            {story.category}
          </span>
          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-caption font-semibold">
            {story.readingLevel}
          </span>
        </div>

        {/* Reading Time */}
        <div className="flex items-center gap-2 text-foreground/60 mb-4">
          <ClockIcon className="w-4 h-4 text-primary/70" />
          <span className="font-body text-xs">
            {story.readingTime} min read
          </span>
        </div>

        {/* Progress Bar */}
        {/* {story.progress > 0 && !story.isCompleted && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-caption text-xs text-foreground/60">Progress</span>
              <span className="font-data text-xs font-bold text-primary">{story.progress}%</span>
            </div>
            <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${story.progress}%` }}
              />
            </div>
          </div>
        )} */}

        {/* Action Button */}
        <Button
          onClick={() => onStoryClick(story.id)}
          variant={
            story.isLocked
              ? "outline"
              : story.progress > 0 && !story.isCompleted
                ? "accent"
                : "default"
          }
          disabled={story.isLocked}
          className={`w-full py-3 rounded-xl font-heading font-bold transition-smooth`}
        >
          {story.isLocked
            ? "Locked"
            : story.progress > 0 && !story.isCompleted
              ? "Continue Reading"
              : story.isCompleted
                ? "Read Again"
                : "Start Reading"}
        </Button>
      </div>
    </div>
  );
};

export default StoryCard;
