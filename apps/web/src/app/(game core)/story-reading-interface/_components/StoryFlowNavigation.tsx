"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Gamepad2, Lightbulb, PlayIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { se } from "date-fns/locale";
import { motion } from "framer-motion";

interface StoryFlowNavigationProps {
  storyTitle?: string;
  currentPage?: number;
  riddleMode: boolean;
  showRiddle: boolean;
  setShowRiddle: (value: boolean) => void;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const StoryFlowNavigation = ({
  storyTitle = "Story Title",
  currentPage = 1,
  riddleMode = false,
  showRiddle,
  setShowRiddle,
  totalPages = 10,
  onPageChange,
}: StoryFlowNavigationProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (showRiddle) {
      setShowRiddle(false);
    } else if (currentPage > 1) {
      handlePreviousPage();
    } else {
      router.back();
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
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
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          {/* Back Button */}
          <Button
            variant={"outline"}
            onClick={handleBack}
            aria-label="Back to library"
          >
            <ChevronLeft size={20} />
          </Button>

          {/* Story Title */}
          {riddleMode ? (
            <motion.div
              layout
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shrink-0">
                  <span className="text-2xl text-white">
                    <Lightbulb />
                  </span>
                </div>
                <div>
                  <p className="font-heading text-secondary font-semibold">
                    Riddle Time!
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    Once you read this page, click &quot;Solve the riddle&quot;
                    button to continue the story
                  </p>
                </div>
              </div>
 
            </motion.div>
          ) : (
            <h1 className="font-heading text-lg md:text-xl text-foreground truncate max-w-[200px] md:max-w-md">
              {storyTitle}
            </h1>
          )}

          {/* Solved riddles numbers */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* riddles indicator */}
            <div className="flex items-center gap-1">
              <Gamepad2 size={20} />
              <span className="text-sm text-foreground">3/5</span>
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
      {!showRiddle && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className={`absolute bottom-0 left-0 border-t right-0 bg-card shadow-warm-lg transition-smooth pointer-events-auto`}
        >
          <div className="relative flex items-center justify-between px-4 md:px-8 py-4 md:py-6">
            {/* Previous Button */}
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />{" "}
              <span className="hidden md:inline">Previous</span>
            </Button>

            {/* Page Counter */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none">
              <span className="font-data text-2xl md:text-3xl font-bold text-primary">
                {currentPage}
              </span>
              <span className="font-caption text-sm text-muted-foreground">
                of {totalPages}
              </span>
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StoryFlowNavigation;
