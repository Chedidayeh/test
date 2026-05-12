"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronRight, Award, ChevronLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChildProfile,
  LanguageCode,
  Progress,
  Story,
} from "@readdly/shared-types";
import { LevelProgressAnalysis } from "../_lib/progress-analysis";
import { useLocale } from "@/src/contexts/LocaleContext";
import { getLanguageCode } from "@/src/lib/translation-utils";
import { Badge } from "@/src/components/ui/badge";

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
  const { isRTL, locale } = useLocale();
  const langCode = getLanguageCode(locale);
  const audioRef = useRef<HTMLAudioElement>(null);
  const levelUpAudioRef = useRef<HTMLAudioElement>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  const localizeStory = (() => {
    const translation = story.translations?.find(
      (tr: { languageCode: LanguageCode }) => tr.languageCode === langCode,
    );
    return {
      name: translation?.title || story.title,
    };
  })();

  const localizeBadge = (() => {
    if (!levelAnalysis.nextBadge) {
      return {
        name: "",
        description: "",
      };
    }
    const translation = levelAnalysis.nextBadge.translations?.find(
      (tr: { languageCode: LanguageCode }) => tr.languageCode === langCode,
    );
    return {
      name: translation?.name || levelAnalysis.nextBadge.name,
      description:
        translation?.description || levelAnalysis.nextBadge.description,
    };
  })();

  const starsEarned = progress.gameSession?.starsEarned || 0;

  // Calculate old progress percentage (before this story)
  const oldTotalStars = levelAnalysis.totalStarsEarned - starsEarned;
  const oldProgressPercentage =
    levelAnalysis.nextLevelStarsRequired > 0
      ? Math.min(
          100,
          (oldTotalStars / levelAnalysis.nextLevelStarsRequired) * 100,
        )
      : 100;

  const handleShowProgress = () => {
    setShowProgress(true);
    // Start progress bar animation after message exits (0.5s)
    setTimeout(() => {
      setAnimationStarted(true);
      // Play audio when animation starts
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn("Audio playback failed:", err);
        });
      }

      // Play level-up sound after progress animation completes (3s) if level unlocked
      if (levelAnalysis.willReachNextLevel) {
        setTimeout(() => {
          if (levelUpAudioRef.current) {
            levelUpAudioRef.current.currentTime = 0;
            levelUpAudioRef.current.play().catch((err) => {
              console.warn("Level up audio playback failed:", err);
            });
          }
        }, 3000);
      }
    }, 500);
  };

  const handleReturnToDashboard = () => {
    router.push(`/child-dashboard/${child.child!.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        {/* Hidden Audio Elements */}
        <audio
          ref={audioRef}
          preload="auto"
          src="/soundtracks/progress-sound.mp3"
        />
        <audio
          ref={levelUpAudioRef}
          preload="auto"
          src="/soundtracks/story-completed.mp3"
        />

        <AnimatePresence mode="wait">
          {!showProgress ? (
            /* ========== COMPLETION MESSAGE PHASE ========== */
            <motion.div
              key="completion-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center"
            >
              {/* Header with Celebration */}
              <motion.div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center justify-center mb-6"
                >
                  <div className="text-6xl">🎉</div>
                </motion.div>
                <h1 className="text-5xl font-semibold mb-4">
                  {t("completionMessage.title")}
                </h1>
                <p className="text-xl text-gray-400 mb-8">
                  {t("completionMessage.subtitle", {
                    childName: child.name,
                    storyTitle: localizeStory.name,
                  })}
                </p>

                {/* Stars Earned Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-flex items-center gap-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full px-6 py-3"
                >
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-medium ">
                    {t("completionMessage.starsEarned", {
                      count: starsEarned,
                    })}
                  </span>
                </motion.div>
              </motion.div>

              {/* Show Progress Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  onClick={handleShowProgress}
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  {t("buttons.showProgressButton")}
                  {isRTL ? (
                    <ChevronLeft className="w-5 h-5 ml-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 ml-2" />
                  )}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* ========== ANIMATED PROGRESS PHASE ========== */
            <motion.div
              key="progress-phase"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="border">
                <CardContent className="pt-6 space-y-4">
                  {/* Current Level */}
                  <div className="flex items-center text-xl justify-between">
                    <span className="">{t("progressCard.currentLevel")}</span>
                    <span className="text-2xl font-bold text-primary">
                      {levelAnalysis.currentLevel}
                    </span>
                  </div>

                  {/* Total Stars */}
                  <div className="flex items-center text-xl justify-between">
                    <span className="">{t("progressCard.totalStars")}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-2xl">
                        {levelAnalysis.totalStarsEarned}
                      </span>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xl">
                      <span className="">
                        {t("progressCard.progressToLevel", {
                          nextLevel: levelAnalysis.nextLevelNumber,
                        })}
                      </span>
                      <motion.span className="font-semibold text-2xl">
                        {animationStarted ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {t("progressCard.progressPercentage", {
                              percentage: Math.min(
                                100,
                                Math.round(levelAnalysis.progressPercentage),
                              ),
                            })}
                          </motion.span>
                        ) : (
                          t("progressCard.progressPercentage", {
                            percentage: Math.min(
                              100,
                              Math.round(oldProgressPercentage),
                            ),
                          })
                        )}
                      </motion.span>
                    </div>

                    {/* Progress Bar with Animation */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-linear-to-r from-primary to-primary/80 h-3 rounded-full"
                        initial={{
                          width: `${Math.min(100, oldProgressPercentage)}%`,
                        }}
                        animate={
                          animationStarted
                            ? {
                                width: `${Math.min(100, levelAnalysis.progressPercentage)}%`,
                              }
                            : {}
                        }
                        transition={
                          animationStarted
                            ? {
                                duration: 3,
                                ease: "easeInOut",
                              }
                            : {}
                        }
                      />
                    </div>

                    <div className="  text-lg text-center">
                      {levelAnalysis.willReachNextLevel ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: animationStarted ? 2.5 : 0,
                          }}
                          className="text-primary text-xl font-medium"
                        >
                          {t("progressCard.levelUnlocked", {
                            nextLevel: levelAnalysis.nextLevelNumber,
                          })}
                        </motion.span>
                      ) : (
                        <span className="text-xl mt-2 flex items-center justify-center gap-1 inline-flex">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {t("progressCard.starsNeeded", {
                            count: levelAnalysis.starsNeededForNextLevel,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge Info - Revealed after animation */}
                  {levelAnalysis.willEarnNextBadge &&
                    levelAnalysis.nextBadge &&
                    animationStarted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 2.8 }}
                        className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-200/10 border border-yellow-200 dark:border-yellow-50/10 rounded-lg flex items-center gap-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium dark:text-yellow-500 flex items-center gap-1  text-yellow-700">
                            <Award className="w-5 h-5 text-yellow-500" />
                            {t("badgeInfo.unlocked")}
                          </p>
                          <div className="flex items-center justify-center gap-1 flex-col">
                            <Badge className="font-medium text-base px-5 mt-3">
                              <Award className="w-8 h-8 " />
                              {localizeBadge.name}
                            </Badge>
                            {localizeBadge.description && (
                              <p className="dark:text-yellow-500 text-yellow-800">
                                {localizeBadge.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                </CardContent>
              </Card>

              {/* Continue Button - Appears after animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={animationStarted ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 3.2,
                }}
                className="gap-3 flex items-center justify-center mt-8"
              >
                <Button className="max-w-max" onClick={handleReturnToDashboard}>
                  {t("buttons.continueReading")}
                  {isRTL ? (
                    <ChevronLeft className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronRight className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
