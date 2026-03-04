"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  ChevronRight,
  Award,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ChildProfile, Progress, Story } from "@shared/types";
import { LevelProgressAnalysis } from "../_lib/progress-analysis";
import { useLocale } from "@/src/contexts/LocaleContext";

interface StoryCompletionProps {
  child: ChildProfile;
  story: Story;
  progress: Progress;
  levelAnalysis: LevelProgressAnalysis;
}

export default function StoryCompletion({
  child,
  story,
  progress,
  levelAnalysis,
}: StoryCompletionProps) {
  const router = useRouter();
  const t = useTranslations("StoryCompletion");
  const {isRTL} = useLocale();
  const starsEarned = progress.gameSession?.starsEarned || 0;

  const handleReturnToDashboard = () => {
    router.push(`/child-dashboard/${child.child.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        {/* Completion Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center">
            <div className="rounded-full  p-2">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold  mb-2">{t("completionHeader.title")}</h1>
          <p className="text-lg text-gray-500">
            {t("completionHeader.subtitle", { childName: child.name, storyTitle: story.title })}
          </p>
        </motion.div>

        {/* Level Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border">
            <CardHeader className="border-b">
              <CardTitle className="text-xl text-center">
                <div className="flex items-center justify-center text-xl gap-2">
                  {t("progressCard.starsEarned")}
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <span className="text-3xl font-bold ">{starsEarned}</span>
                </div>{" "}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Current Level */}
              <div className="flex items-center text-xl justify-between">
                <span className="text-gray-500">{t("progressCard.currentLevel")}</span>
                <span className="text-2xl font-bold text-primary">
                  {levelAnalysis.currentLevel}
                </span>
              </div>

              {/* Total Stars */}
              <div className="flex items-center  text-xl justify-between">
                <span className="text-gray-500">{t("progressCard.totalStars")}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-2xl">
                    {levelAnalysis.totalStarsEarned}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between  text-xl">
                  <span className="text-gray-500">
                    {t("progressCard.progressToLevel", { nextLevel: levelAnalysis.nextLevelNumber })}
                  </span>
                  <span className="font-semibold text-2xl">
                    {t("progressCard.progressPercentage", { percentage: Math.min(100, Math.round(levelAnalysis.progressPercentage)) })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, levelAnalysis.progressPercentage)}%`,
                    }}
                  />
                </div>
                <div className=" text-gray-500 text-lg text-center">
                  {levelAnalysis.willReachNextLevel
                    ? 
                    t("progressCard.levelUnlocked", { nextLevel: levelAnalysis.nextLevelNumber })
                    : 
                    <span className="text-primary text-xl mt-2">{t("progressCard.starsNeeded", { count: levelAnalysis.starsNeededForNextLevel })}</span>}
                </div>
              </div>

              {/* Badge Info */}
              {levelAnalysis.willEarnNextBadge && levelAnalysis.nextBadge && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                  <Award className="w-7 h-7 text-yellow-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900">
                      {t("badgeInfo.unlocked", { badgeName: levelAnalysis.nextBadge.name })}
                    </p>
                    {levelAnalysis.nextBadge.description && (
                      <p className="text-yellow-700 mt-1">
                        {levelAnalysis.nextBadge.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="gap-3 flex items-center justify-center"
        >
          <Button className="max-w-max " onClick={handleReturnToDashboard}>
            {t("buttons.returnToDashboard")}
            {isRTL ? <ChevronLeft className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
