/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckIcon, ChevronRightIcon, LockIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface Story {
  id: number;
  title: string;
  coverImage: string;
  coverAlt: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isCompleted: boolean;
  isLocked: boolean;
  starsRequired?: number;
  description: string;
}

interface StoryRecommendationsProps {
  stories: Story[];
}

const StoryRecommendations = ({ stories }: StoryRecommendationsProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "Hard":
        return "bg-error text-error-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-black/30 rounded-xl p-6 shadow-warm-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl md:text-3xl text-foreground">
          Stories for You
        </h2>
        <Link
          href="/story-library"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-smooth"
        >
          <span className="font-body font-semibold">See All</span>
          <ChevronRightIcon size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className={`group bg-background border border-black/30 rounded-xl overflow-hidden shadow-warm hover:shadow-warm-lg transform transition-transform duration-300 hover:-translate-y-1 hover:scale-105`}
          >
            {/* Cover Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={story.coverImage}
                alt={story.coverAlt}
                className="w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-110"
              />
              {story.isLocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <LockIcon size={25} className="text-white" />
                    <p className="font-body font-bold text-white">
                      {story.starsRequired} stars needed
                    </p>
                  </div>
                </div>
              )}
              <div
                className={`absolute bg-secondary text-white top-3 left-3 ${getDifficultyColor(story.difficulty)} rounded-full px-3 py-1 shadow-warm transition-opacity duration-300 group-hover:opacity-95`}
              >
                <span className="font-caption">
                  {story.difficulty}
                </span>
              </div>
            </div>

            {/* Story Info */}
            <div className="p-4">
              <h3 className="font-heading text-xl text-foreground mb-2 line-clamp-1">
                {story.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
                {story.description}
              </p>
              {story.isLocked ? (
                <Button
                  variant={"outline"}
                  disabled
                  className="w-full"
                >
                  Locked
                </Button>
              ) : (
                <Link href="/story-reading-interface" className="flex items-center justify-center">
                  <Button className="w-full">
                    {story.isCompleted ? "Read Again" : "Start Reading"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryRecommendations;
