"use client";

import { Milestone } from "../_data/mockData";
import { Progress } from "@/src/components/ui/progress";
import { motion } from "framer-motion";

interface LearningRoadmapProps {
  milestones: Milestone[];
  currentStars: number;
}

export default function LearningRoadmap({
  milestones,
  currentStars,
}: LearningRoadmapProps) {
  const nextMilestone = milestones.find((m) => !m.isCompleted);
  const progressPercentage = nextMilestone
    ? Math.min((currentStars / nextMilestone.starsRequired) * 100, 100)
    : 100;
  const starsNeeded = nextMilestone
    ? nextMilestone.starsRequired - currentStars
    : 0;

  const completedCount = milestones.filter((m) => m.isCompleted).length;

  return (
    <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg">
      <div className="mb-8">
        <h2 className="font-heading text-2xl text-foreground mb-2">
          Learning Roadmap
        </h2>
        <p className="text-muted-foreground">
          {completedCount} of {milestones.length} milestones completed
        </p>
      </div>

      {nextMilestone && (
        <div className="mb-8 p-4 bg-linear-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Current Progress
              </p>
              <h3 className="font-heading text-lg text-foreground mt-1">
                {nextMilestone.title}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-data font-bold text-primary">
                {currentStars}
              </p>
              <p className="text-xs text-muted-foreground">
                / {nextMilestone.starsRequired} stars
              </p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">
            {starsNeeded} stars needed to unlock {nextMilestone.reward}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border transition-all ${
              milestone.isCompleted
                  ? "bg-linear-to-r from-green-50 to-emerald-50 border-green-200"
                  : milestone.isCurrent
                    ? "bg-linear-to-r from-primary/10 to-secondary/10 border-primary/30"
                  : "bg-muted/30 border-black/10"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {milestone.isCompleted && (
                    <span className="text-lg">✅</span>
                  )}
                  {milestone.isCurrent && !milestone.isCompleted && (
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                  <h4
                    className={`font-semibold ${
                      milestone.isCompleted
                        ? "text-green-900"
                        : milestone.isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {milestone.title}
                  </h4>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">
                  {milestone.starsRequired} stars required
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl text-center">{milestone.reward.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {milestone.reward.split(" ").slice(1).join(" ")}
                </p>
                {milestone.isCompleted && milestone.unlockedAt && (
                  <p className="text-xs text-green-600 font-medium mt-2">
                    {new Date(milestone.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
