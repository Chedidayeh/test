"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, Star } from "lucide-react";
import { motion } from "framer-motion";
import { ChallengeAttempt, ChallengeStatus } from "@shared/types";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
interface StoryFlowNavigationProps {
  storyTitle?: string;
  currentPage?: number;
  riddleMode: boolean;
  showRiddle: boolean;
  setShowRiddle: (value: boolean) => void;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  currentChallengeAttemptState: ChallengeAttempt | undefined;
  totalStarsEarned?: number;
}

const StoryFlowNavigation = ({
  storyTitle = "Story Title",
  currentPage = 1,
  riddleMode = false,
  showRiddle,
  setShowRiddle,
  totalPages = 10,
  onPageChange,
  currentChallengeAttemptState,
  totalStarsEarned = 0,
}: StoryFlowNavigationProps) => {
  const t = useTranslations("StoryReadingInterface");
  const { isRTL } = useLocale();
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  const router = useRouter();
  const handleBack = () => {
    if (showRiddle) {
      setShowRiddle(false);
      return;
    }
    router.push("/admin-dashboard/stories");
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
      // Timer will automatically disable since we're no longer on the checkpointed page
    }
  };

  const handleNextPage = () => {
    // Check if this is the last page
    const isLastPage = currentPage === totalPages;

    // Handle story completion when on the last page
    if (isLastPage) {
      setIsStoryComplete(true);
      router.push("/admin-dashboard/stories");
    }

    // Navigate to next page if not on last page
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const progressPercentage = (currentPage / totalPages) * 100;

  return (
    <div className={`fixed inset-0 pointer-events-none z-50`}>
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className={`absolute top-0 left-0 right-0 border-b bg-card shadow-warm-md transition-smooth pointer-events-auto`}
      >
        <div className="relative flex items-center justify-center px-4 md:px-8 py-4 md:py-4 h-20">
          {/* Back Button */}
          <Button
            variant={"outline"}
            onClick={handleBack}
            aria-label="Back"
            className="absolute left-4 md:left-8"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {showRiddle ? (
              <span className="ml-2">
                {t("storyFlowNavigation.returnToStory")}
              </span>
            ) : (
              <span className="ml-2">
                {t("storyFlowNavigation.backButton")}
              </span>
            )}
          </Button>

          {/* Story Title */}
          {riddleMode ? (
            <motion.div
              layout
              className="flex flex-col items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shrink-0">
                  <span className="text-2xl text-white">
                    <Lightbulb />
                  </span>
                </div>
                <div>
                  <p className="font-heading text-secondary font-semibold">
                    {t("storyFlowNavigation.riddleTime")}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {t("storyFlowNavigation.riddleTimeText")}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <h1 className="font-heading text-lg md:text-xl text-foreground truncate max-w-50 md:max-w-md">
              {storyTitle}
            </h1>
          )}

          {/* Stars earned display */}
          <div className="absolute right-4 md:right-8 flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1">
              <Star size={20} className="text-primary" fill="currentColor" />
              <span className="font-heading font-semibold text-foreground">
                {totalStarsEarned}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Bottom Navigation Controls */}
      {!showRiddle && !isStoryComplete && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className={`absolute bottom-0 left-0 border-t right-0 bg-card shadow-warm-lg transition-smooth pointer-events-auto`}
        >
          <div className="relative flex items-center justify-between px-4 md:px-32 py-4 md:py-6 h-20">
            {/* Previous Button */}
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}{" "}
              <span className="hidden md:inline">
                {t("storyFlowNavigation.previousButton")}
              </span>
            </Button>

            {/* Page Counter */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none">
              <span className="font-data text-2xl md:text-3xl font-bold text-primary">
                {currentPage}
              </span>
              <span className="font-caption text-sm text-muted-foreground">
                {t("storyFlowNavigation.pageProgress", {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNextPage}
              disabled={
                currentChallengeAttemptState?.status ==
                ChallengeStatus.NOT_ATTEMPTED
              }
              aria-label="Next page"
              className="relative"
            >
              <span className="hidden md:inline">
                {currentPage === totalPages ? (
                  <span className="flex items-center">
                    {t("storyFlowNavigation.completionMessage")}{" "}
                    {isRTL ? (
                      <ChevronLeft size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </span>
                ) : currentChallengeAttemptState?.status ==
                  ChallengeStatus.NOT_ATTEMPTED ? (
                  t("storyFlowNavigation.solveRiddle")
                ) : (
                  <span className="flex items-center">
                    {t("storyFlowNavigation.nextButton")}{" "}
                    {isRTL ? (
                      <ChevronLeft size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </span>
                )}
              </span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StoryFlowNavigation;
