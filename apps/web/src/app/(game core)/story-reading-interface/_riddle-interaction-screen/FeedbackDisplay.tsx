"use client";

import { Button } from "@/src/components/ui/button";
import {
  CheckCircle,
  CircleCheck,
  CircleX,
  Lightbulb,
  SparklesIcon,
  X,
} from "lucide-react";

interface Hint {
  level: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

import { Star, type LucideIcon } from "lucide-react";

interface FeedbackDisplayProps {
  type: "solved" | "almost" | "incorrect" | null;
  message: string;
  starsEarned?: number;
  onContinue: (action: "solved" | "skipped") => void;
  onTryAgain: () => void;
  isVisible: boolean;
}

const FeedbackDisplay2 = ({
  type,
  message,
  starsEarned = 0,
  onContinue,
  onTryAgain,
  isVisible,
}: FeedbackDisplayProps) => {
  if (!isVisible || !type) return null;

  const feedbackConfig = {
    solved: {
      bgColor: "bg-secondary/80",
      title: "Amazing Work!",
    },
    almost: {
      bgColor: "bg-secondary/20",
      title: "Almost There!",
    },
    incorrect: {
      bgColor: "bg-secondary/20",
      title: "Keep Trying!",
    },
  };

  const config = feedbackConfig[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card rounded-xl shadow-warm-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 text-white bg-secondary rounded-full flex items-center justify-center">
              {type === "incorrect" && <CircleX />}
              {type === "solved" && <CircleCheck />}
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground">
                {config.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Friendly Character */}
          <div className="p-6 flex justify-center">
            <div className="relative w-60 h-60 rounded-2xl overflow-hidden">
              <img
                src={
                  type === "solved"
                    ? "/hint-avatars/great-work.png"
                    : "/hint-avatars/try-again.png"
                }
                className=" object-contain shadow-warm"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="font-body text-xl text-foreground leading-relaxed">
              {message}
            </p>
          </div>

          {/* Stars Earned (for correct answers) */}
          {type === "solved" && starsEarned > 0 && (
            <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-secondary/20 rounded-xl">
              <Star className="fill-amber-500 text-amber-500" />
              <span className="font-heading text-2xl text-foreground">
                +{starsEarned} Stars Earned!
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {type === "solved" ? (
              <div className="flex items-center justify-center">
                <Button
                  variant={"secondary"}
                  onClick={() => onContinue("solved")}
                >
                  Continue Story
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant={"outline"}
                  onClick={() => onContinue("skipped")}
                >
                  Skip This Riddle
                </Button>
                <Button variant={"secondary"} onClick={onTryAgain}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay2;
