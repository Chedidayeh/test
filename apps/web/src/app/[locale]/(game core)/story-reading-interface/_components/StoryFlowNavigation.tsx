"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader,
  Pause,
  Play,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ChallengeAttempt,
  ChallengeStatus,
  Progress,
  Story,
} from "@readdly/shared-types";
import { StoryPage } from "./storyDataTransform";
import {
  saveCheckpointAction,
  completeStoryAction,
  pauseGameSessionAction,
} from "@/src/lib/progress-service/server-actions";
import { Button } from "@/src/components/ui/button";
import { useLocale } from "@/src/contexts/LocaleContext";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
} from "@/src/components/ui/dialog";
interface StoryFlowNavigationProps {
  storyTitle?: string;
  currentPage?: number;
  riddleMode: boolean;
  showRiddle: boolean;
  setShowRiddle: (value: boolean) => void;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  currentProgress?: Progress;
  currentChallengeAttemptState: ChallengeAttempt | undefined;
  pages?: StoryPage[];
  story?: Story;
  totalStarsEarned?: number;
  childId: string;
  audioUrl?: string | null;
  isPlayingAudio?: boolean;
  isLoadingAudio?: boolean;
  handlePlayAudio?: () => void;
}

const StoryFlowNavigation = ({
  storyTitle = "Story Title",
  currentPage = 1,
  riddleMode = false,
  showRiddle,
  setShowRiddle,
  totalPages = 10,
  onPageChange,
  currentProgress,
  currentChallengeAttemptState,
  pages = [],
  story,
  totalStarsEarned = 0,
  audioUrl,
  isPlayingAudio,
  isLoadingAudio,
  handlePlayAudio,
  childId,
}: StoryFlowNavigationProps) => {
  const t = useTranslations("StoryReadingInterface");
  const { isRTL } = useLocale();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCheckpoint, setIsSavingCheckpoint] = useState(false);
  const MIN_READ_TIME = 3; // Minimum time in seconds before allowing next page

  const [timeRemaining, setTimeRemaining] = useState(MIN_READ_TIME); // 10 seconds timer
  const [optimisticCheckpointPage, setOptimisticCheckpointPage] = useState<
    number | null
  >(null); // Track the page we just navigated to
  const [maxReachedPage, setMaxReachedPage] = useState(currentPage); // Track the highest page ever reached

  // Calculate the checkpointed page number from the progress data
  const getCheckpointedPageNumber = (): number => {
    if (!currentProgress?.gameSession?.chapterId || !story?.chapters) {
      return -1; // No checkpoint
    }
    const checkpointChapter = story.chapters.find(
      (ch) => ch.id === currentProgress.gameSession!.chapterId,
    );
    return checkpointChapter ? checkpointChapter.order : -1;
  };

  // Use optimistic checkpoint if just navigated, otherwise use server data
  const serverCheckpointPage = getCheckpointedPageNumber();
  // Use optimistic value only if it differs from server (means it's still pending)
  // When they match, automatically switch to server value
  const checkpointedPage =
    optimisticCheckpointPage !== null &&
    optimisticCheckpointPage !== serverCheckpointPage
      ? optimisticCheckpointPage
      : serverCheckpointPage;

  // Timer only active when on the checkpointed page
  const isTimerActive = currentPage === checkpointedPage;

  // Timer effect - counts down and prevents next button
  useEffect(() => {
    // Only run timer if on the checkpointed page
    if (!isTimerActive) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0; // Stop at 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPage, isTimerActive]); // Reset timer when page changes or timer state changes

  const handleBack = async () => {
    if (showRiddle) {
      setShowRiddle(false);
    } else {
      // Pause the game session before navigating back to dashboard
      if (currentProgress?.gameSession?.id) {
        setIsSaving(true);
        setIsSavingCheckpoint(true);
        const result = await pauseGameSessionAction(
          currentProgress.gameSession.id,
        );
        setIsSavingCheckpoint(false);

        if (result.success) {
          console.log("[Game Pause] Game session paused successfully", {
            gameSessionId: currentProgress.gameSession.id,
            checkpointData: result.data,
          });
          router.push("/child-dashboard/" + childId);
        } else {
          setIsSaving(false);
          console.error("[Game Pause] Failed to pause game session", {
            error: result.error,
          });
        }
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      if (isPlayingAudio) {
        handlePlayAudio?.();
      }
      onPageChange(currentPage - 1);
      // Timer will automatically disable since we're no longer on the checkpointed page
    }
  };

  const handleNextPage = async () => {
    if (isPlayingAudio) {
      handlePlayAudio?.();
    }
    // Check if minimum read time has passed (only if timer is active)
    if (isTimerActive && timeRemaining > 0) {
      console.log(
        `[Page Lock] Must wait ${timeRemaining}s before proceeding to next page`,
      );
      return; // Prevent navigation if time not expired
    }

    // Check if this is the last page
    const isLastPage = currentPage === totalPages;
    const nextPageNumber = currentPage + 1;
    const isNewPage = nextPageNumber > maxReachedPage; // Check if this is a newly reached page

    // Handle story completion when on the last page
    if (isLastPage) {
      if (currentProgress?.gameSession?.id) {
        setIsSaving(true);

        setIsSavingCheckpoint(true);
        const result = await completeStoryAction(
          currentProgress.gameSession.id,
        );

        if (result.success) {
          console.log("[Story Completion] Story completed successfully", {
            storyId: story?.id,
            currentPage,
            totalPages,
            gameSessionData: result.data,
          });
          router.push(
            `/story-completion/${currentProgress.storyId}?childId=${childId}`,
          );
        } else {
          console.error("[Story Completion] Failed to complete story", {
            error: result.error,
          });
          setIsSaving(false);

          setIsSavingCheckpoint(false);
        }
      }

      return; // Exit after completion attempt
    }

    // Handle navigation to next page if not on last page
    if (currentPage < totalPages && onPageChange) {
      // Only save checkpoint if reaching a NEW page (not previously visited)
      if (isNewPage) {
        // Get the next page/chapter information
        const nextPageIndex = currentPage; // 0-indexed, so currentPage is the next one
        const nextPage = pages[nextPageIndex];

        if (currentProgress?.gameSession?.id && nextPage && story?.chapters) {
          // Find the next chapter by order
          const nextChapter = story.chapters.find(
            (ch) => ch.order === nextPage.pageNumber,
          );

          if (nextChapter) {
            // Save checkpoint with the next chapter ID
            setIsSavingCheckpoint(true);
            const result = await saveCheckpointAction(
              currentProgress.gameSession.id,
              nextChapter.id,
            );
            setIsSavingCheckpoint(false);

            if (result.success) {
              console.log("[Checkpoint] Saved successfully", {
                gameSessionId: currentProgress.gameSession.id,
                chapterId: nextChapter.id,
                pageNumber: nextPage.pageNumber,
              });
            } else {
              console.error("[Checkpoint] Save failed", {
                error: result.error,
              });
            }
          }
        }

        // Update the max reached page since we're reaching a new page
        setMaxReachedPage(nextPageNumber);
      } else {
        console.log(
          `[Page Navigation] Returning to previously visited page ${nextPageNumber} - no checkpoint save`,
        );
      }

      // Reset timer for the next page
      setTimeRemaining(MIN_READ_TIME);

      // Optimistically update to the new checkpoint page (only if new page)
      if (isNewPage) {
        setOptimisticCheckpointPage(nextPageNumber);
      }

      onPageChange(nextPageNumber);
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
        <div className="relative flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 min-h-16 sm:min-h-20">
          {/* Back Button */}
          <Button
            variant={"outline"}
            onClick={handleBack}
            className={`absolute ${isRTL ? "right-2 sm:right-3 md:right-4 lg:right-8" : "left-2 sm:left-3 md:left-4 lg:left-8"} text-xs sm:text-sm`}
          >
            {isRTL ? (
              <ChevronRight size={18} className="sm:size-5" />
            ) : (
              <ChevronLeft size={18} className="sm:size-5" />
            )}
            {showRiddle ? (
              <span className="sm:inline md:ml-2">
                {t("storyFlowNavigation.returnToStory")}
              </span>
            ) : (
              <span className="hidden sm:inline ml-1 sm:ml-2">
                {t("storyFlowNavigation.backButton")}
              </span>
            )}
          </Button>

          {/* Story Title */}
          {riddleMode ? (
            <motion.div
              layout
              className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-2 sm:px-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xl sm:text-2xl text-white">
                    <Lightbulb />
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-heading text-secondary font-semibold text-sm md:text-base">
                    {t("storyFlowNavigation.riddleTime")}
                  </p>
                  <p className="font-body text-xs md:text-sm text-muted-foreground">
                    {t("storyFlowNavigation.riddleTimeText")}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <h1 className="font-heading text-sm sm:text-base md:text-lg lg:text-xl text-foreground truncate max-w-[140px] sm:max-w-xs md:max-w-md px-2">
              {storyTitle}
            </h1>
          )}

          {/* Stars earned in the game session */}
          <div
            className={`absolute ${isRTL ? "left-2 sm:left-3 md:left-4 lg:left-8" : "right-2 sm:right-3 md:right-4 lg:right-8"} flex items-center gap-3 sm:gap-2 md:gap-4`}
          >
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Star
                size={16}
                className="sm:size-5 text-primary"
                fill="currentColor"
              />
              <span className="font-heading font-semibold text-sm sm:text-base text-foreground">
                {totalStarsEarned ||
                  currentProgress?.gameSession?.starsEarned ||
                  0}
              </span>
            </div>
            {audioUrl && (
              <Button
                variant={"accent"}
                size={"sm"}
                onClick={handlePlayAudio}
                disabled={!audioUrl || isLoadingAudio}
                aria-label={isPlayingAudio ? "Pause audio" : "Play audio"}
              >
                {isLoadingAudio ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span className="hidden sm:inline">
                      {t("playAudio.loading")}
                    </span>
                  </>
                ) : isPlayingAudio ? (
                  <>
                    <Pause size={18} />
                    <span className="hidden sm:inline">
                      {t("playAudio.pause")}
                    </span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span className="hidden sm:inline">
                      {t("playAudio.play")}
                    </span>
                  </>
                )}
              </Button>
            )}
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
      {!showRiddle && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className={`fixed bottom-0 left-0 right-0 border-t bg-card shadow-warm-md transition-smooth pointer-events-auto z-50`}
        >
          <div className="relative flex items-center justify-between px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24 py-3 sm:py-4 min-h-16 sm:min-h-20">
            {/* Previous Button */}
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label={t("storyFlowNavigation.previousButton")}
              className="text-xs sm:text-sm"
            >
              {isRTL ? (
                <ChevronRight size={18} className="sm:size-5" />
              ) : (
                <ChevronLeft size={18} className="sm:size-5" />
              )}{" "}
              <span className="hidden md:inline">
                {t("storyFlowNavigation.previousButton")}
              </span>
            </Button>

            {/* Page Counter */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 sm:gap-1 pointer-events-none">
              <span className="font-data text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                {currentPage}
              </span>
              <span className="font-caption text-xs sm:text-sm text-muted-foreground">
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
                isSavingCheckpoint ||
                (isTimerActive && timeRemaining > 0) ||
                currentChallengeAttemptState?.status ==
                  ChallengeStatus.NOT_ATTEMPTED
              }
              aria-label={
                isTimerActive && timeRemaining > 0
                  ? t("storyFlowNavigation.timerMessage", {
                      remaining: timeRemaining,
                    })
                  : t("storyFlowNavigation.nextButton")
              }
              className="relative text-xs sm:text-sm"
            >
              {isTimerActive && timeRemaining > 0 ? (
                <>
                  <span className="hidden md:inline">
                    {t("storyFlowNavigation.timerMessage", {
                      remaining: timeRemaining,
                    })}
                  </span>
                  <span className="inline md:hidden text-xs">
                    {timeRemaining}s
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline">
                    {currentPage === totalPages ? (
                      <span className="flex items-center">
                        {t("storyFlowNavigation.completionMessage")}{" "}
                        {isRTL ? (
                          <ChevronLeft size={18} className="sm:size-5" />
                        ) : (
                          <ChevronRight size={18} className="sm:size-5" />
                        )}
                      </span>
                    ) : currentChallengeAttemptState?.status ==
                      ChallengeStatus.NOT_ATTEMPTED ? (
                      t("storyFlowNavigation.solveRiddle")
                    ) : (
                      <span className="flex items-center">
                        {t("storyFlowNavigation.nextButton")}{" "}
                        {isRTL ? (
                          <ChevronLeft size={18} className="sm:size-5" />
                        ) : (
                          <ChevronRight size={18} className="sm:size-5" />
                        )}
                      </span>
                    )}
                  </span>
                  <span className="md:hidden">
                    {isRTL ? (
                      <ChevronLeft size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      <Dialog open={isSaving}>
        <DialogPortal>
          <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 z-99 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <span className="inline-flex items-center gap-3">
                <span
                  className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"
                  aria-hidden="true"
                />
                <span>{t("saving")}</span>
              </span>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default StoryFlowNavigation;
