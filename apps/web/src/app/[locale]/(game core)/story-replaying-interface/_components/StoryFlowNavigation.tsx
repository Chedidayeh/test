"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Story } from "@shared/types";
import { StoryPage } from "./storyDataTransform";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
interface StoryFlowNavigationProps {
  storyTitle?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  childId: string;
}

const StoryFlowNavigation = ({
  storyTitle = "Story Title",
  currentPage = 1,
  totalPages = 10,
  onPageChange,
  childId,
}: StoryFlowNavigationProps) => {
  const t = useTranslations("StoryReadingInterface");
  const { isRTL } = useLocale();

  const router = useRouter();
  // No server operations or timer logic needed

  const handleBack = () => {
    // Return to previous page or close if first page
    router.push("/child-dashboard/" + childId);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage === totalPages) {
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
        <div className="relative flex items-center justify-center px-4 md:px-8 py-4 md:py-4 h-20">
          {/* Back Button */}
          <Button
            variant={"outline"}
            onClick={handleBack}
            className="absolute left-4 md:left-8"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            <span className="ml-2">{t("storyFlowNavigation.backButton")}</span>
          </Button>

          {/* Story Title */}
          <h1 className="font-heading text-lg md:text-xl text-foreground truncate max-w-50 md:max-w-96">
            {storyTitle}
          </h1>
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
          <Button onClick={handleNextPage} aria-label="Next page">
            <span className="hidden md:inline">
              {currentPage === totalPages ? (
                <span className="flex items-center">
                  {t("storyFlowNavigation.completionMessage")}
                  {isRTL ? (
                          <ChevronLeft size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                </span>
              ) : (
                <span className="flex items-center">
                  {t("storyFlowNavigation.nextButton")}
                  {isRTL ? (
                          <ChevronLeft size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                </span>
              )}
            </span>
            <span className="inline md:hidden">
              {currentPage === totalPages ? "Done" : "Next"}
            </span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default StoryFlowNavigation;
