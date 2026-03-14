"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Story } from "@readdly/shared-types";
import { StoryPage } from "./storyDataTransform";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
} from "@/src/components/ui/dialog";
interface StoryFlowNavigationProps {
  storyTitle?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  childId: string;
  audioUrl?: string | null;
  isPlayingAudio?: boolean;
  isLoadingAudio?: boolean;
  handlePlayAudio?: () => void;
}

const StoryFlowNavigation = ({
  storyTitle = "Story Title",
  currentPage = 1,
  totalPages = 10,
  onPageChange,
  childId,
  audioUrl,
  isPlayingAudio,
  isLoadingAudio,
  handlePlayAudio,
}: StoryFlowNavigationProps) => {
  const t = useTranslations("StoryReadingInterface");
  const { isRTL } = useLocale();
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  // No server operations or timer logic needed

  const handleBack = () => {
    setIsSaving(true);

    // Return to previous page or close if first page
    router.push("/child-dashboard/" + childId);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      if (isPlayingAudio) {
        handlePlayAudio?.();
      }
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (isPlayingAudio) {
      handlePlayAudio?.();
    }
    if (currentPage === totalPages) {
      setIsSaving(true);
      router.push("/child-dashboard/" + childId);
    }
    // Simply navigate to next page if available
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
            <span className="hidden sm:inline ml-1 sm:ml-2">
              {t("storyFlowNavigation.backButton")}
            </span>{" "}
          </Button>

          {/* Story Title */}
          <h1 className="font-heading text-lg md:text-xl text-foreground truncate max-w-50 md:max-w-96">
            {storyTitle}
          </h1>
          <div
            className={`absolute ${isRTL ? "left-2 sm:left-3 md:left-4 lg:left-8" : "right-2 sm:right-3 md:right-4 lg:right-8"} flex items-center gap-3 sm:gap-2 md:gap-4`}
          >
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
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className={`absolute bottom-0 left-0 border-t right-0 bg-card shadow-warm-lg transition-smooth pointer-events-auto`}
      >
        <div className="relative flex items-center justify-between px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24 py-3 sm:py-4 min-h-16 sm:min-h-20">
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
          <Button onClick={handleNextPage} aria-label="Next page">
            <span className="hidden md:inline">
              {currentPage === totalPages ? (
                <span className="flex items-center">
                  {t("storyFlowNavigation.completionMessage")}
                  {isRTL ? (
                    <ChevronLeft size={18} className="sm:size-5" />
                  ) : (
                    <ChevronRight size={18} className="sm:size-5" />
                  )}
                </span>
              ) : (
                <span className="flex items-center">
                  {t("storyFlowNavigation.nextButton")}
                  {isRTL ? (
                    <ChevronLeft size={18} className="sm:size-5" />
                  ) : (
                    <ChevronRight size={18} className="sm:size-5" />
                  )}
                </span>
              )}
            </span>
            <span className="md:hidden">
              {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </span>
          </Button>
        </div>
      </motion.div>
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
