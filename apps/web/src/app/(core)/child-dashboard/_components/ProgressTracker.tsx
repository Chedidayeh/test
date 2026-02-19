/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Badge, Level } from "@shared/types";
import { CheckIcon, Star, StarIcon, Zap } from "lucide-react";
import { useState } from "react";

interface ProgressTrackerProps {
  currentStars: number;
  levels: Level[];
  currentLevel: number;
}

const ProgressTracker = ({
  currentStars,
  levels,
  currentLevel,
}: ProgressTrackerProps) => {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  // Level motivation messages
  const getLevelMessage = (levelNumber: number): string => {
    const messages: Record<number, string> = {
      1: "Welcome to your reading adventure",
      2: "You're building momentum! Keep going 🚀",
      3: "Wow, you're doing amazing 🌟",
      4: "You're on fire! You're unstoppable 🔥",
      5: "You're a reading champion 👑",
    };
    return messages[levelNumber] || "Keep reading and you'll reach new heights! ⭐";
  };

  // Sort levels by requiredStars
  const sortedLevels = [...levels].sort((a, b) => a.requiredStars - b.requiredStars);

  // Find current level based on levelNumber
  const currentLevelData = sortedLevels.find(
    (level) => level.levelNumber === currentLevel
  );

  // Determine which levels are completed and find next level
  const completedLevels = sortedLevels.filter(
    (level) => currentStars >= level.requiredStars
  );
  const nextLevel = sortedLevels.find(
    (level) => currentStars < level.requiredStars
  );

  const progressPercentage = nextLevel
    ? Math.min((currentStars / nextLevel.requiredStars) * 100, 100)
    : 100;
  const starsNeeded = nextLevel
    ? nextLevel.requiredStars - currentStars
    : 0;

  const completedCount = completedLevels.length;
  const totalLevels = sortedLevels.length;

  return (
    <div className="h-full rounded-2xl bg-gradient-to-b from-card via-card to-card/95 p-6 shadow-warm-lg border border-black/30 flex flex-col gap-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-1">
            Your Journey
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            {completedCount}/{totalLevels} levels unlocked
          </p>
        </div>
        {nextLevel && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-3 border border-primary/20 text-center">
            <p className=" text-sm text-muted-foreground font-medium">
              <span className="block text-base text-primary mb-1">
                {getLevelMessage(currentLevel)}
              </span>
              {currentLevel === 1
                ? "Start reading to unlock your first badge!"
                : "Great work! Keep it up to reach the next level."}
              <br />
            </p>
          </div>
        )}
      </div>

      {/* Progress Circle */}
      <div className="flex flex-col items-center">
        <div className="relative bg-primary rounded-full w-24 h-24 flex items-center justify-center">
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-white">
              {currentStars}
            </span>
            <span className="text-xs text-gray-100 font-data">Total Stars</span>
          </div>
        </div>

        {/* Current Progress */}
        {nextLevel && (
          <div className="mt-6 text-center w-full">
            <div className="bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              <p className="text-sm text-muted-foreground font-body mb-1">
                Progress to{" "}
                <span className="font-bold text-primary">
                  Level {nextLevel.levelNumber}
                </span>
              </p>
              <div className="flex items-center justify-center gap-1">
                <Star size={16} className="text-primary animate-pulse" />
                <span className="font-bold text-lg text-foreground">
                  {starsNeeded}
                </span>
                <span className="text-muted-foreground">stars to go</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Levels List */}
      <div className="space-y-3 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Levels
        </p>
        {sortedLevels.map((level, index) => {
          const isCompleted = currentStars >= level.requiredStars;
          const isCurrent = currentLevelData?.id === level.id;
          const badge = level.badge;

          return (
            <button
              key={level.id}
              onClick={() =>
                setHoveredLevel(
                  hoveredLevel === level.id ? null : level.id,
                )
              }
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`w-full text-left transition-all duration-300 group`}
            >
              <div
                className={`rounded-xl p-4 border border-black/30 transition-transform duration-300 transform will-change-transform ${
                  isCompleted
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 shadow-warm"
                    : isCurrent
                      ? `bg-gradient-to-r bg-primary/40 `
                      : "bg-muted/40 border-muted/50 opacity-60 hover:opacity-80"
                } group-hover:-translate-y-1 group-hover:scale-102 group-hover:shadow-lg`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-transform duration-300 ${
                      isCompleted
                        ? "bg-primary text-white scale-110"
                        : isCurrent
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                    } group-hover:scale-105`}
                  >
                    {isCompleted ? <CheckIcon size={15} /> : level.levelNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-sm ${
                        isCompleted
                          ? "text-foreground"
                          : isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      Level {level.levelNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <StarIcon size={12} />
                      {level.requiredStars} stars
                    </p>
                  </div>
                </div>

                {/* Expanded Badge Info */}
                {hoveredLevel === level.id && badge && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-sm">
                      {badge.iconUrl ? (
                        <img
                          src={badge.iconUrl}
                          alt={badge.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-2xl">🏆</span>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Badge</p>
                        <p className="font-semibold text-foreground">
                          {badge.name}
                        </p>
                        {badge.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {badge.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
