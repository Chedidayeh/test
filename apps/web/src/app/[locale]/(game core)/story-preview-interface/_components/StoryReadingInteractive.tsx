"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoryContent from "./StoryContent";
import Controls from "./Controls";
import ReadingSettings from "./ReadingSettings";
import { CircleQuestionMark, Settings, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import RiddleInteractive from "../_riddle-interaction-screen/RiddleInteractive";
import StoryFlowNavigation from "./StoryFlowNavigation";
import { Story, ChallengeStatus, ChallengeAttempt } from "@shared/types";
import {
  transformStoryToPages,
  getChapterByPageNumber,
} from "./storyDataTransform";
import { useTranslations } from "next-intl";

interface StoryReadingInteractiveProps {
  story: Story;
}

const StoryReadingInteractive = ({ story }: StoryReadingInteractiveProps) => {
  const t = useTranslations("StoryReadingInterface");

  // Start with page 1 (this is preview mode, no checkpoint needed)
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

  const [showRiddle, setShowRiddle] = useState(false);
  const currentChapter = getChapterByPageNumber(story, currentPage);

  // Local cache of challenge attempts by challengeId to prevent losing submissions on page navigation
  const [localChallengeAttempts, setLocalChallengeAttempts] = useState<
    Record<string, ChallengeAttempt>
  >({});

  // Track current challenge attempt for real-time updates
  const [currentChallengeAttemptState, setCurrentChallengeAttemptState] =
    useState<ChallengeAttempt | undefined>(undefined);

  // Track total stars earned locally from solved challenges
  const [totalStarsEarned, setTotalStarsEarned] = useState(0);

  // Transform story chapters into pages
  const pages = useMemo(() => transformStoryToPages(story), [story]);

  useEffect(() => {
    // Update challenge attempt state when current chapter changes
    const currentChallenge = currentChapter?.challenge;

    if (!currentChallenge) {
      setCurrentChallengeAttemptState(undefined);
      return;
    }

    // Check if we have a locally cached attempt (from a previous submission)
    const cachedAttempt = localChallengeAttempts[currentChallenge.id];
    if (cachedAttempt) {
      setCurrentChallengeAttemptState(cachedAttempt);
    } else {
      setCurrentChallengeAttemptState(undefined);
    }
  }, [currentChapter, localChallengeAttempts]);

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
  const currentChallenge = currentChapter?.challenge || null;

  // Determine if riddle button should be shown
  // Show button only if challenge is not attempted
  const shouldShowRiddleButton = currentPageData.hasRiddle;

  // Callback to update challenge attempt when submitted from riddle component
  const handleChallengeSubmitted = (
    updatedAttempt: ChallengeAttempt,
    starsEarned?: number,
  ) => {
    setCurrentChallengeAttemptState(updatedAttempt);
    // Also cache it locally so we don't lose it on page navigation
    setLocalChallengeAttempts((prev) => ({
      ...prev,
      [updatedAttempt.challengeId]: updatedAttempt,
    }));
    // Accumulate stars earned from this challenge attempt
    if (starsEarned !== undefined && starsEarned > 0) {
      setTotalStarsEarned((prev) => prev + starsEarned);
    }
  };

  return (
    <div className=" pb-32 md:py-24 flex flex-col">
      {/* Story Flow Navigation */}
      <StoryFlowNavigation
        storyTitle={story.title}
        currentPage={currentPage}
        riddleMode={currentPageData.hasRiddle}
        showRiddle={showRiddle}
        setShowRiddle={setShowRiddle}
        totalPages={pages.length}
        onPageChange={handlePageChange}
        currentChallengeAttemptState={currentChallengeAttemptState}
        totalStarsEarned={totalStarsEarned}
      />
      {!showRiddle ? (
        <>
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

                {/* Riddle Indicator */}
                {shouldShowRiddleButton && (
                  <motion.div
                    layout
                    className="mt-4 flex flex-col items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Button
                      variant={"secondary"}
                      onClick={() => setShowRiddle(true)}
                    >
                      <span>{t("storyFlowNavigation.solveRiddle")}</span>
                    </Button>
                  </motion.div>
                )}

                {/* Challenge Status Display */}
                {currentPageData.hasRiddle && currentChallengeAttemptState && (
                  <motion.div
                    layout
                    className="mt-4 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {currentChallengeAttemptState.status ===
                      ChallengeStatus.SOLVED && (
                      <span className="font-medium text-secondary">
                        ✓ {t("storyFlowNavigation.challengeSolved")}
                      </span>
                    )}
                    {currentChallengeAttemptState.status ===
                      ChallengeStatus.SKIPPED && (
                      <span className="font-medium text-primary">
                        ⊘ {t("storyFlowNavigation.challengeSkipped")}
                      </span>
                    )}
                  </motion.div>
                )}
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
        </>
      ) : (
        <AnimatePresence>
          {showRiddle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <RiddleInteractive
                challenge={currentChallenge}
                storyImage={currentPageData?.image}
                storyImageAlt={currentPageData?.alt}
                onChallengeSubmitted={handleChallengeSubmitted}
                onClose={() => setShowRiddle(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

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

export default StoryReadingInteractive;
