/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "motion/react";
import { BookOpen, Lock, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { World, ChildProfile } from "@shared/types";
import { getEnrichedStoriesForWorld } from "../../_lib/helpers";

interface StoriesRoadmapProps {
  selectedWorld: World;
  childProfile: ChildProfile;
  currentStoryId?: string;
}

export default function StoriesRoadmap({
  selectedWorld,
  childProfile,
}: StoriesRoadmapProps) {
  // Enrich all stories with progress data
  const enrichedStories = getEnrichedStoriesForWorld(
    selectedWorld,
    childProfile,
  );

  console.log("Enriched Stories for World:", {
    worldId: selectedWorld,
  });

  if (enrichedStories.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-4">
        <p className="text-muted-foreground">
          No stories available in this world.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {enrichedStories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <div
              className={`relative h-64 rounded-xl overflow-hidden group transition-all duration-300 ${
                story.status === "locked"
                  ? "opacity-60 hover:opacity-75"
                  : "hover:shadow-lg hover:scale-105"
              }`}
            >
              {/* Background Image */}
              <img
                src={
                  selectedWorld.imageUrl ||
                  "https://images.unsplash.com/photo-1507842331343-583f20270319?auto=format&fit=crop&w=1200&q=80"
                }
                alt={story.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

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
                        ? "bg-accent/20 text-accent"
                        : story.status === "in_progress"
                          ? "bg-primary/20 text-primary"
                          : story.status === "locked"
                            ? "bg-gray-500/20 text-gray-300"
                            : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {story.status === "completed" && "✓ Completed"}
                    {story.status === "in_progress" &&
                      `In Progress (${story.completionPercentage}%)`}
                    {story.status === "locked" && "🔒 Locked"}
                    {story.status === "not_started" && "Start"}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                    <div className="flex items-center gap-1 text-accent backdrop-blur-sm bg-accent/20 rounded-2xl px-3 py-1">
                      <BookOpen className="w-4 h-4" />
                      <div className="text-sm">
                        {story.chapters.length} Chapters
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-secondary backdrop-blur-sm bg-secondary/20 rounded-2xl px-3 py-1">
                      <Zap className="w-4 h-4" />
                      <div className="text-sm">
                        {story.challengeCount} Challenges
                      </div>
                    </div>
                  </div>
                </div>

                {/* Centered Buttons (Hidden until hover) */}
                <div className="max-w-max mx-auto opacity-0 scale-95 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                  {story.status === "completed" && (
                    <Link href={`/story-reading-interface/${story.id}?childId=${childProfile.id}`}>
                      <Button variant={"accent"} className="w-max">
                        Read again
                      </Button>
                    </Link>
                  )}

                  {story.status === "in_progress" && (
                    <Link href={`/story-reading-interface/${story.id}?childId=${childProfile.id}`}>
                      <Button className="w-max">Continue</Button>
                    </Link>
                  )}

                  {story.status === "not_started" && (
                    <Link href={`/story-reading-interface/${story.id}?childId=${childProfile.id}`}>
                      <Button className="w-max">Start Reading</Button>
                    </Link>
                  )}

                  {story.status === "locked" && (
                    <Button disabled className="w-max">
                      Locked
                    </Button>
                  )}
                </div>

                {/* Bottom: Title and Description */}
                <div>
                  <h3 className="font-heading text-lg font-bold text-white mb-1">
                    {story.name}
                  </h3>
                  <p className="text-sm text-gray-200 line-clamp-2">
                    {story.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
