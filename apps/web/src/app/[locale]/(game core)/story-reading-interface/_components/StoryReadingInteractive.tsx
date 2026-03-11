"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import StoryContent from "./StoryContent";
import Controls from "./Controls";
import ReadingSettings from "./ReadingSettings";
import { CircleQuestionMark, Settings, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import RiddleInteractive from "../_riddle-interaction-screen/RiddleInteractive";
import StoryFlowNavigation from "./StoryFlowNavigation";
import {
  Story,
  Progress,
  ChallengeStatus,
  ChallengeAttempt,
  Local,
  StoryTranslation,
} from "@readdly/shared-types";
import {
  transformStoryToPages,
  getChapterByPageNumber,
} from "./storyDataTransform";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";

interface StoryReadingInteractiveProps {
  story: Story;
  currentProgress: Progress
  childId: string;
}

/**
 * Get the page number for a given chapter ID
 * Finds the chapter in the story and returns its page number based on order
 */
function getPageNumberFromChapterId(
  story: Story,
  chapterId: string | null | undefined,
): number {
  if (!chapterId || !story.chapters) {
    return 1; // Default to page 1 if no chapter ID
  }

  // Find the chapter with matching ID
  const chapter = story.chapters.find((ch) => ch.id === chapterId);
  if (!chapter) {
    return 1; // Default to page 1 if chapter not found
  }

  // Return the page number based on chapter order (0-indexed offset)
  return chapter.order;
}

const StoryReadingInteractive = ({
  story,
  currentProgress,
  childId,
}: StoryReadingInteractiveProps) => {
  const t = useTranslations("StoryReadingInterface");
  const {locale} = useLocale();

  // Initialize page from checkpoint, or default to 1
  const initialPage = getPageNumberFromChapterId(
    story,
    currentProgress?.gameSession?.chapterId,
  );

  const [currentPage, setCurrentPage] = useState(initialPage);
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

  // Track total stars earned locally from solved challenges - initialize from game session if available
  const [totalStarsEarned, setTotalStarsEarned] = useState(
    currentProgress?.gameSession?.starsEarned || 0,
  );

    // Locale-aware pages: pick translated chapter content/title when available
    const localizedPages = useMemo(() => {
      const baseLocale = (locale || Local.EN).split("-")[0].toUpperCase(); // EN, AR, FR
      if (!story.chapters || story.chapters.length === 0) return [];
  
      const sortedChapters = [...story.chapters].sort((a, b) => a.order - b.order);
  
      return sortedChapters.map((chapter, index) => {
        const translation = chapter.translations?.find((t) => t.languageCode === baseLocale);
        return {
          pageNumber: index + 1,
          text: translation?.content || chapter.content || "",
          image: chapter.imageUrl,
          alt: `Page ${index + 1}`,
          hasRiddle: !!chapter.challenge,
        };
      });
    }, [story, locale]);
  
    // Localized story title based on current locale
    const localizedTitle = useMemo(() => {
      try {
        const baseLocale = (locale || Local.EN).split("-")[0];
        const langKey = baseLocale.toUpperCase(); // EN, AR, FR
        const translation = story.translations?.find((t: StoryTranslation) => t.languageCode === langKey);
        return translation?.title || story.title;
      } catch {
        return story.title;
      }
    }, [story, locale]);

  useEffect(() => {
    // Update challenge attempt state when current chapter changes
    const currentChallenge = currentChapter?.challenge;

    if (!currentChallenge) {
      setCurrentChallengeAttemptState(undefined);
      return;
    }

    // 1. First, check if we have a locally cached attempt (from a previous submission)
    const cachedAttempt = localChallengeAttempts[currentChallenge.id];
    if (cachedAttempt) {
      setCurrentChallengeAttemptState(cachedAttempt);
      return;
    }

    // 2. If not in cache, try to find it from the server progress data
    const serverAttempt = currentProgress?.gameSession?.challengeAttempts?.find(
      (attempt) => attempt.challengeId === currentChallenge.id,
    );
    setCurrentChallengeAttemptState(serverAttempt);
  }, [
    currentChapter?.challenge?.id,
    currentChapter?.id,
    localChallengeAttempts,
    currentProgress?.gameSession?.challengeAttempts,
  ]);

  useEffect(() => {
    if (isPlaying && localizedPages.length > 0) {
      const words = localizedPages[currentPage - 1].text.split(" ");

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
  }, [isPlaying, currentPage, localizedPages, wordIndex]);

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
  const currentPageData = localizedPages[currentPage - 1];
  const currentChallenge = currentChapter?.challenge || null;

  // Determine if riddle button should be shown
  // Show button only if challenge is not attempted
  const shouldShowRiddleButton =
    currentPageData.hasRiddle &&
    (currentChallengeAttemptState?.status === ChallengeStatus.NOT_ATTEMPTED || currentChallengeAttemptState?.status === ChallengeStatus.INCORRECT);
  // Callback to update challenge attempt when submitted from riddle component
  const handleChallengeSubmitted = (updatedAttempt: ChallengeAttempt, starsEarned?: number) => {
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
    <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 md:pb-28 lg:pb-32 flex flex-col">
      {/* Story Flow Navigation */}
      <StoryFlowNavigation
        storyTitle={localizedTitle}
        currentPage={currentPage}
        riddleMode={currentPageData.hasRiddle}
        showRiddle={showRiddle}
        setShowRiddle={setShowRiddle}
        totalPages={localizedPages.length}
        onPageChange={handlePageChange}
        currentProgress={currentProgress}
        pages={localizedPages}
        story={story}
        currentChallengeAttemptState={currentChallengeAttemptState}
        totalStarsEarned={totalStarsEarned}
        childId={childId}
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
              {/* middle content */}
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl">
                {/* Story Content */}
                <StoryContent
                  currentPage={currentPageData}
                  textSize={textSize}
                  highContrast={highContrast}
                  highlightedWord={highlightedWord}
                />

                {/* TTS Controls */}
                <motion.div
                  className="mt-6 sm:mt-8"
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
                    className="mt-3 sm:mt-4 flex flex-col items-center gap-2 sm:gap-3"
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
                    className="mt-3 sm:mt-4 flex flex-col items-center gap-1 sm:gap-2"
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

          <div className="fixed right-2 sm:right-4 md:right-6 lg:right-8 bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-32 flex flex-col gap-2 sm:gap-3 z-40">
            {/* Settings Button */}
            <motion.button
              onClick={() => setShowSettings(true)}
              whileHover={{ scale: 1.06 }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-card hover:bg-accent hover:text-white text-foreground rounded-full shadow-warm-lg hover:scale-110 transition-smooth flex items-center justify-center flex-shrink-0"
              aria-label="Reading settings"
            >
              <Settings size={20} className="sm:size-6" />
            </motion.button>

            {/* Help Button */}
            <motion.button
              onClick={() => setShowHelp(true)}
              whileHover={{ scale: 1.06 }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-card hover:bg-accent hover:text-white text-foreground rounded-full shadow-warm-lg hover:scale-110 transition-smooth flex items-center justify-center flex-shrink-0"
              aria-label="Reading help"
            >
              <CircleQuestionMark size={20} className="sm:size-6" />
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
                gameSessionId={currentProgress?.gameSession?.id}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-card rounded-xl shadow-warm-xl p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-heading text-xl sm:text-2xl text-foreground">
                {t("readingHelp.title")}
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 sm:p-2 hover:bg-accent hover:text-white rounded-full transition-smooth flex-shrink-0 ml-2"
                aria-label="Close help"
              >
                <X size={20} className="sm:size-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1">
                  <p className="font-body font-semibold text-foreground mb-1 text-sm sm:text-base">
                    {t("readingHelp.navigation")}
                  </p>
                  <p className="font-caption text-xs sm:text-sm text-muted-foreground">
                    {t("readingHelp.navigationDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1">
                  <p className="font-body font-semibold text-foreground mb-1 text-sm sm:text-base">
                    {t("readingHelp.audioReading")}
                  </p>
                  <p className="font-caption text-xs sm:text-sm text-muted-foreground">
                    {t("readingHelp.audioReadingDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1">
                  <p className="font-body font-semibold text-foreground mb-1 text-sm sm:text-base">
                    {t("readingHelp.riddles")}
                  </p>
                  <p className="font-caption text-xs sm:text-sm text-muted-foreground">
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
