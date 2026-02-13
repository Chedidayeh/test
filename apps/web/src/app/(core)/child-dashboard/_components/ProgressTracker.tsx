/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { CheckIcon, StarIcon, Zap, Flame } from "lucide-react";
import { useState } from "react";

interface Milestone {
  id: number;
  title: string;
  starsRequired: number;
  isCompleted: boolean;
  isCurrent: boolean;
  reward: string;
}

interface ProgressTrackerProps {
  currentStars: number;
  milestones: Milestone[];
}

const ProgressTracker = ({
  currentStars,
  milestones,
}: ProgressTrackerProps) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);

  const nextMilestone = milestones.find((m) => !m.isCompleted);
  const progressPercentage = nextMilestone
    ? Math.min((currentStars / nextMilestone.starsRequired) * 100, 100)
    : 100;
  const starsNeeded = nextMilestone
    ? nextMilestone.starsRequired - currentStars
    : 0;

  const completedCount = milestones.filter((m) => m.isCompleted).length;

  return (
    <div className="h-full rounded-2xl bg-gradient-to-b from-card via-card to-card/95 p-6 shadow-warm-lg border border-black/30 flex flex-col gap-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-1">
            Your Journey
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            {completedCount}/{milestones.length} milestones unlocked
          </p>
        </div>
        {nextMilestone && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-3 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground font-body">
              <span className="block text-sm font-semibold text-primary mb-1">
                You&apos;re on fire! 🌟
              </span>
              Keep reading to unlock{" "}
              <span className="font-bold text-primary">
                {nextMilestone.reward}
              </span>
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
        {nextMilestone && (
          <div className="mt-6 text-center w-full">
            <div className="bg-primary/10 rounded-xl px-4 py-3 border border-primary/20">
              <p className="text-sm text-muted-foreground font-body mb-1">
                Progress to{" "}
                <span className="font-bold text-primary">
                  {nextMilestone.title}
                </span>
              </p>
              <div className="flex items-center justify-center gap-1">
                <Zap size={16} className="text-accent animate-pulse" />
                <span className="font-bold text-lg text-foreground">
                  {starsNeeded}
                </span>
                <span className="text-muted-foreground">stars to go</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Milestones List */}
      <div className="space-y-3 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Milestones
        </p>
        {milestones.map((milestone, index) => (
          <button
            key={milestone.id}
            onClick={() =>
              setHoveredMilestone(
                hoveredMilestone === milestone.id ? null : milestone.id,
              )
            }
            onMouseEnter={() => setHoveredMilestone(milestone.id)}
            onMouseLeave={() => setHoveredMilestone(null)}
            className={`w-full text-left transition-all duration-300 group`}
          >
            <div
              className={`rounded-xl p-4 border border-black/30 transition-transform duration-300 transform will-change-transform ${
                milestone.isCompleted
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 shadow-warm"
                  : milestone.isCurrent
                    ? `bg-gradient-to-r bg-primary/40 `
                    : "bg-muted/40 border-muted/50 opacity-60 hover:opacity-80"
              } group-hover:-translate-y-1 group-hover:scale-102 group-hover:shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-transform duration-300 ${
                    milestone.isCompleted
                      ? "bg-primary text-white scale-110"
                      : milestone.isCurrent
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                  } group-hover:scale-105`}
                >
                  {milestone.isCompleted ? <CheckIcon size={15} /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold text-sm ${
                      milestone.isCompleted
                        ? "text-foreground"
                        : milestone.isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <StarIcon size={12} />
                    {milestone.starsRequired}
                  </p>
                </div>
              </div>

              {/* Expanded Reward Info */}
              {hoveredMilestone === milestone.id && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Reward</p>
                      <p className="font-semibold text-foreground">
                        {milestone.reward}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
