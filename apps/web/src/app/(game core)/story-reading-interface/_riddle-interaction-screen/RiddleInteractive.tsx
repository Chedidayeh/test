/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RiddleQuestion from "./RiddleQuestion";
import TextInputAnswer from "./TextInputAnswer";
import MultipleChoiceAnswer from "./MultipleChoiceAnswer";
import HintPanel from "./HintPanel";
import FeedbackDisplay from "./FeedbackDisplay";
import { ArrowLeftIcon, Lightbulb, PencilIcon, Route } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import FloatingItems from "./FloatingItems";

interface Choice {
  id: string;
  text: string;
}

interface Hint {
  level: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
}

interface Riddle {
  id: string;
  question: string;
  type: "text" | "multiple-choice";
  correctAnswer: string;
  choices?: Choice[];
  hints: Hint[];
  storyImage: string;
  storyImageAlt: string;
  starsReward: number;
}

const RiddleInteractive = () => {
  const router = useRouter();
  const [currentRiddle] = useState<Riddle>({
    id: "riddle-1",
    question:
      "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    type: "multiple-choice",
    correctAnswer: "map",
    choices: [
      { id: "a", text: "A Map" },
      { id: "b", text: "A Globe" },
      { id: "c", text: "A Picture" },
      { id: "d", text: "A Book" },
    ],

    hints: [
      {
        level: 1,
        text: "Think about something you use to find your way around. It shows places but is not the real thing.",
        difficulty: "easy",
      },
      {
        level: 2,
        text: "This object is flat and has drawings of places. You can fold it and carry it with you.",
        difficulty: "medium",
      },
      {
        level: 3,
        text: 'It starts with the letter "M" and helps you navigate from one place to another.',
        difficulty: "hard",
      },
    ],

    storyImage: "https://images.unsplash.com/photo-1730314737966-92b9760790eb",
    storyImageAlt:
      "Colorful illustrated map with mountains, rivers, and cities drawn in cartoon style",
    starsReward: 5,
  });

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [isHintPanelVisible, setIsHintPanelVisible] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{
    type: "correct" | "almost" | "incorrect" | null;
    message: string;
    isVisible: boolean;
  }>({
    type: null,
    message: "",
    isVisible: false,
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const maxAttempts = 5;
  const totalHints = currentRiddle.hints.length;
  const availableHints = totalHints - hintsUsed;

  const handleTextSubmit = (answer: string) => {
    checkAnswer(answer);
  };

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
  };

  const handleChoiceSubmit = () => {
    if (selectedChoice) {
      const selectedChoiceText =
        currentRiddle.choices?.find((c) => c.id === selectedChoice)?.text || "";
      checkAnswer(selectedChoiceText);
    }
  };

  const checkAnswer = (answer: string) => {
    setAttempts((prev) => prev + 1);

    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = currentRiddle.correctAnswer.toLowerCase();

    if (
      normalizedAnswer === correctAnswer ||
      normalizedAnswer.includes(correctAnswer)
    ) {
      setFeedbackState({
        type: "correct",
        message:
          "Fantastic! You solved the riddle! Your reading skills are amazing!",
        isVisible: true,
      });
    } else if (
      normalizedAnswer.length > 0 &&
      correctAnswer.includes(normalizedAnswer.substring(0, 3))
    ) {
      setFeedbackState({
        type: "almost",
        message:
          "You're very close! Think about it a little more. You can do this!",
        isVisible: true,
      });
    } else {
      setFeedbackState({
        type: "incorrect",
        message:
          "Not quite right, but that's okay! Every try helps you learn. Want to try again or use a hint?",
        isVisible: true,
      });
    }

    setSelectedChoice(null);
  };

  const handleRequestHint = () => {
    if (currentHintLevel < totalHints) {
      setCurrentHintLevel((prev) => prev + 1);
      setHintsUsed((prev) => prev + 1);
      setIsHintPanelVisible(true);
    }
  };

  const handleShowHintPanel = () => {
    if (currentHintLevel === 0) {
      handleRequestHint();
    } else {
      setIsHintPanelVisible(true);
    }
  };

  const handleTryAgain = () => {
    setFeedbackState({ type: null, message: "", isVisible: false });
  };

  const handleContinue = () => {
    router.push("/story-reading-interface");
  };

  const handleAudioPlay = () => {
    setIsAudioPlaying(!isAudioPlaying);
    setTimeout(() => setIsAudioPlaying(false), 3000);
  };

  const handleBackToStory = () => {
    router.push("/story-reading-interface");
  };

  return (
    <div className="">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Progress Indicator */}
        <FloatingItems
          attempts={attempts}
          maxAttempts={maxAttempts}
          hintsUsed={hintsUsed}
          totalHints={totalHints}
        />

        {/* Riddle Question */}
        <div className="mt-6">
          <RiddleQuestion
            question={currentRiddle.question}
            storyImage={currentRiddle.storyImage}
            storyImageAlt={currentRiddle.storyImageAlt}
            riddleNumber={1}
            totalRiddles={3}
            onAudioPlay={handleAudioPlay}
            isAudioPlaying={isAudioPlaying}
          />
        </div>

        {/* Answer Input */}
        <div className="mt-6 bg-card rounded-xl shadow-warm-lg p-6">
          {currentRiddle.type === "text" ? (
            <TextInputAnswer
              onSubmit={handleTextSubmit}
              isDisabled={feedbackState.isVisible}
              placeholder="Type your answer here..."
            />
          ) : (
            <>
              <MultipleChoiceAnswer
                choices={currentRiddle.choices || []}
                selectedChoice={selectedChoice}
                onSelect={handleChoiceSelect}
                isDisabled={feedbackState.isVisible}
              />

              <Button
                variant={"secondary"}
                onClick={handleChoiceSubmit}
                disabled={!selectedChoice || feedbackState.isVisible}
                className="w-full mt-6 px-6 py-4 text-lg"
              >
                Submit Answer
              </Button>
            </>
          )}
        </div>

        {/* Hint Button (moved to floating FAB) */}

        {/* Hint Panel */}
        <HintPanel
          hints={currentRiddle.hints}
          currentHintLevel={currentHintLevel}
          availableHints={availableHints}
          onRequestHint={handleRequestHint}
          isVisible={isHintPanelVisible}
          onClose={() => setIsHintPanelVisible(false)}
        />

        {/* Feedback Display */}
        <FeedbackDisplay
          type={feedbackState.type}
          message={feedbackState.message}
          starsEarned={
            feedbackState.type === "correct" ? currentRiddle.starsReward : 0
          }
          onContinue={handleContinue}
          onTryAgain={handleTryAgain}
          isVisible={feedbackState.isVisible}
        />
      </div>

      {/* Floating Hint Button */}
      <div className="fixed right-4 bottom-24 z-50 pointer-events-none">
        <button
          onClick={handleShowHintPanel}
          disabled={availableHints === 0}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-secondary text-white rounded-full shadow-warm hover:scale-105 transition-smooth disabled:opacity-50"
        >
          <Lightbulb size={20} />
          <span className="hidden md:inline font-heading font-bold">
            Need a Hint? ({availableHints})
          </span>
        </button>
      </div>
    </div>
  );
};

export default RiddleInteractive;
