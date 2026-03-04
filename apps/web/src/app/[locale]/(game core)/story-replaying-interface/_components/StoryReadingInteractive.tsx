"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoryContent from "./StoryContent";
import Controls from "./Controls";
import ReadingSettings from "./ReadingSettings";
import { CircleQuestionMark, Settings, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import StoryFlowNavigation from "./StoryFlowNavigation";
import {
  Story,
} from "@shared/types";
import {
  transformStoryToPages,
} from "./storyDataTransform";
import { useTranslations } from "next-intl";

interface StoryReplayingInteractiveProps {
  story: Story;
  childId: string;
}

const StoryReplayingInteractive = ({
  story,
  childId,
}: StoryReplayingInteractiveProps) => {
    const t = useTranslations("StoryReadingInterface");
  
  // Always start at the first page for replay
  const [currentPage, setCurrentPage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(0); // Track word position across pause/play
  const [textSize, setTextSize] = useState<"small" | "medium" | "large">(
    "medium",
  );
  const [highContrast, setHighContrast] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState<number | undefined>(
    undefined,
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Transform story chapters into pages
  const pages = useMemo(() => transformStoryToPages(story), [story]);

  useEffect(() => {
    if (isPlaying && pages.length > 0) {
      const words = pages[currentPage - 1].text.split(" ");

      // Start from the current wordIndex, or 0 if at the beginning
      let currentWordIndex = wordIndex;

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          setHighlightedWord(currentWordIndex);
          setWordIndex(currentWordIndex + 1);
          currentWordIndex++;
        } else {
          // Text finished - reset to start and stop playing
          setWordIndex(0);
          setIsPlaying(false);
          setHighlightedWord(undefined);
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentPage, pages, wordIndex]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Starting to play - show the current word index
      setHighlightedWord(wordIndex);
    } else {
      // Pausing - hide highlight
      setHighlightedWord(undefined);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setIsPlaying(false);
    setHighlightedWord(undefined);
    setWordIndex(0); // Reset word index when changing pages
  };

  // Get current page data
  const currentPageData = pages[currentPage - 1];

  return (
    <div className=" pb-32 md:py-24 flex flex-col">
      {/* Story Flow Navigation */}
      <StoryFlowNavigation
        storyTitle={story.title}
        currentPage={currentPage}
        totalPages={pages.length}
        onPageChange={handlePageChange}
        childId={childId}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
            {/* Story Content */}
            <StoryContent
              currentPage={currentPageData}
              textSize={textSize}
              highContrast={highContrast}
              highlightedWord={highlightedWord}
            />

            {/* TTS Controls */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <Controls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="fixed right-4 md:right-8 bottom-24 md:bottom-32 flex flex-col gap-3 z-40">
        {/* Settings Button */}
        <motion.button
          onClick={() => setShowSettings(true)}
          whileHover={{ scale: 1.06 }}
          className="w-14 h-14 bg-card hover:bg-accent hover:text-white text-foreground rounded-full shadow-warm-lg hover:scale-110 transition-smooth flex items-center justify-center"
          aria-label="Reading settings"
        >
          <Settings />
        </motion.button>

        {/* Help Button */}
        <motion.button
          onClick={() => setShowHelp(true)}
          whileHover={{ scale: 1.06 }}
          className="w-14 h-14 bg-card hover:bg-accent hover:text-white text-foreground rounded-full shadow-warm-lg hover:scale-110 transition-smooth flex items-center justify-center"
          aria-label="Reading help"
        >
          <CircleQuestionMark />
        </motion.button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <ReadingSettings
          textSize={textSize}
          onTextSizeChange={setTextSize}
          highContrast={highContrast}
          onHighContrastToggle={() => setHighContrast(!highContrast)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-warm-xl p-6 md:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-foreground">
                {t("readingHelp.title")}
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-accent  hover:text-white rounded-full transition-smooth"
                aria-label="Close help"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-body font-semibold text-foreground mb-1">
                    {t("readingHelp.navigation")}
                  </p>
                  <p className="font-caption text-sm text-muted-foreground">
                    {t("readingHelp.navigationDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <p className="font-body font-semibold text-foreground mb-1">
                    {t("readingHelp.audioReading")}
                  </p>
                  <p className="font-caption text-sm text-muted-foreground">
                    {t("readingHelp.audioReadingDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <p className="font-body font-semibold text-foreground mb-1">
                    {t("readingHelp.riddles")}
                  </p>
                  <p className="font-caption text-sm text-muted-foreground">
                    {t("readingHelp.riddlesDesc")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="accent" onClick={() => setShowHelp(false)}>
                {t("readingHelp.gotIt")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryReplayingInteractive;
