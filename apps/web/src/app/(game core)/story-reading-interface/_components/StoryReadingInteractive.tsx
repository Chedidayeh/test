"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import StoryContent from "./StoryContent";
import Controls from "./Controls";
import ReadingSettings from "./ReadingSettings";
import {
  CircleQuestionMark,
  Lightbulb,
  Puzzle,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import RiddleInteractive from "../_riddle-interaction-screen/RiddleInteractive";
import StoryFlowNavigation from "./StoryFlowNavigation";

interface StoryPage {
  pageNumber: number;
  text: string;
  image: string;
  alt: string;
  hasRiddle: boolean;
}

interface StoryReadingInteractiveProps {
  storyData: {
    id: string;
    title: string;
    pages: StoryPage[];
  };
}

const StoryReadingInteractive = ({
  storyData,
}: StoryReadingInteractiveProps) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
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

  useEffect(() => {
    if (isPlaying) {
      const words = storyData.pages[currentPage - 1].text.split(" ");
      let wordIndex = 0;

      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          setHighlightedWord(wordIndex);
          wordIndex++;
        } else {
          setIsPlaying(false);
          setHighlightedWord(undefined);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentPage, storyData.pages]);

  const currentPageData = storyData.pages[currentPage - 1];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setIsPlaying(false);
    setHighlightedWord(undefined);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setHighlightedWord(0);
    } else {
      setHighlightedWord(undefined);
    }
  };

  return (
    <div className=" pb-32 md:py-24 flex flex-col">
      {/* Story Flow Navigation */}
      <StoryFlowNavigation
        storyTitle={storyData.title}
        currentPage={currentPage}
        riddleMode={currentPageData.hasRiddle}
        showRiddle={showRiddle}
        setShowRiddle={setShowRiddle}
        totalPages={storyData.pages.length}
        onPageChange={handlePageChange}
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
                {currentPageData.hasRiddle && (
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
                      <span>Solve the riddle</span>
                    </Button>
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
              <RiddleInteractive />
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
                Reading Help
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
                    Navigation
                  </p>
                  <p className="font-caption text-sm text-muted-foreground">
                    Use the arrows at the bottom to move between pages. Your
                    progress is saved automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <p className="font-body font-semibold text-foreground mb-1">
                    Audio Reading
                  </p>
                  <p className="font-caption text-sm text-muted-foreground">
                    Press play to hear the story read aloud. Adjust speed and
                    language in the controls.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <p className="font-body font-semibold text-foreground mb-1">
                    Riddles
                  </p>
                  <p className="font-caption text-sm text-muted-foreground">
                    When you see a riddle indicator, solve it to continue the
                    story and earn stars!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="accent" onClick={() => setShowHelp(false)}>
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryReadingInteractive;
