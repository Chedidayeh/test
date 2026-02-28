"use client";

import { useState, useEffect } from "react";
import RiddleQuestion from "./RiddleQuestion";
import TextInputAnswer from "./TextInputAnswer";
import MultipleChoiceAnswer from "./MultipleChoiceAnswer";
import HintPanel from "./HintPanel";
import FeedbackDisplay from "./FeedbackDisplay";
import { Lightbulb } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import FloatingItems from "./FloatingItems";
import { Challenge, ChallengeStatus, ChallengeType, ChallengeAttempt } from "@shared/types";

interface Choice {
  id: string;
  text: string;
}

interface Hint {
  text: string;
}

interface Riddle {
  id: string;
  question: string;
  type: ChallengeType;
  correctAnswer: string;
  choices?: Choice[];
  hints: Hint[];
  storyImage?: string;
  storyImageAlt: string;
  starsReward: number;
}

interface RiddleInteractiveProps {
  challenge?: Challenge | null;
  storyImage?: string;
  storyImageAlt?: string;
  onChallengeSubmitted?: (attempt: ChallengeAttempt, starsEarned?: number) => void;
  onClose?: () => void;
}

const RiddleInteractive = ({
  challenge,
  storyImage,
  storyImageAlt = "Story image",
  onChallengeSubmitted,
  onClose,
}: RiddleInteractiveProps) => {

  // Transform Challenge to Riddle format
  const transformChallengeToRiddle = (challenge: Challenge): Riddle => {
    const riddle: Riddle = {
      id: challenge.id,
      question: challenge.question,
      type: challenge.type as ChallengeType,
      correctAnswer: challenge.answers?.find((a) => a.isCorrect)?.text || "",
      choices: challenge.answers?.map((answer) => ({
        id: answer.id,
        text: answer.text,
      })),
      hints: challenge.hints.map((hint) => ({
        text: hint,
      })),
      storyImage: storyImage,
      storyImageAlt: storyImageAlt,
      starsReward: challenge.baseStars,
    };
    return riddle;
  };

  // Use challenge data if provided, otherwise use fallback
  const [currentRiddle] = useState<Riddle>(() => {
      return transformChallengeToRiddle(challenge!);
  });

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [isHintPanelVisible, setIsHintPanelVisible] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{
    type: "solved" | "almost" | "incorrect" | null;
    message: string;
    isVisible: boolean;
  }>({
    type: null,
    message: "",
    isVisible: false,
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const totalHints = currentRiddle.hints.length;
  const availableHints = totalHints - hintsUsed;

  // Timer effect - counts up elapsed time for riddle solving
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Stop timer and log the riddle completion data
  const stopTimerAndLog = (
    outcome: "solved" | "almost" | "incorrect" | "skipped",
  ) => {
    setIsTimerRunning(false);
    console.log("[Riddle Timer]", {
      elapsedSeconds: elapsedTime,
      riddleId: currentRiddle.id,
      question: currentRiddle.question,
      attempts: attempts,
      hintsUsed: hintsUsed,
      outcome: outcome,
    });
  };

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
    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);

    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = currentRiddle.correctAnswer.toLowerCase();
    let isCorrect = false;
    let isAlmost = false;

    // Type-specific validation logic
    switch (currentRiddle.type) {
      case "RIDDLE":
        // For riddles: allow substring matching or exact match
        if (
          normalizedAnswer === correctAnswer ||
          normalizedAnswer.includes(correctAnswer)
        ) {
          isCorrect = true;
        } else if (
          normalizedAnswer.length > 0 &&
          correctAnswer.includes(normalizedAnswer.substring(0, 3))
        ) {
          isAlmost = true;
        }
        break;

      case "TRUE_FALSE":
        // For true/false: exact match only
        if (normalizedAnswer === correctAnswer) {
          isCorrect = true;
        }
        break;

      case "MULTIPLE_CHOICE":
        // For multiple choice: exact match required
        if (normalizedAnswer === correctAnswer) {
          isCorrect = true;
        }
        break;

      case "CHOOSE_ENDING":
      case "MORAL_DECISION":
        // For these types: all answers are correct (we log the child's choice to track story understanding)
        isCorrect = true;
        break;
    }

    if (isCorrect) {
      stopTimerAndLog("solved");
      
      // Create a local challenge attempt object for preview
      const now = new Date();
      const localAttempt: ChallengeAttempt = {
        id: Math.random().toString(36).substring(7),
        sessionId: "",
        challengeId: currentRiddle.id,
        status: ChallengeStatus.SOLVED,
        attemptNumber: currentAttempt,
        usedHints: hintsUsed,
        isCorrect: true,
        textAnswer: answer,
        timeSpentSeconds: elapsedTime,
        createdAt: now,
        updatedAt: now,
        starEvent: {
          id: Math.random().toString(36).substring(7),
          attemptId: "",
          challengeId: currentRiddle.id,
          baseStars: currentRiddle.starsReward,
          noHintBonus: 0,
          firstTryBonus: currentAttempt === 1 ? 5 : 0,
          totalStars: currentRiddle.starsReward,
          attemptNumber: currentAttempt,
          usedHints: hintsUsed > 0,
          wasCorrect: true,
          createdAt: now,
          updatedAt: now,
        },
      };
      onChallengeSubmitted?.(localAttempt, currentRiddle.starsReward);
      
      const messages = {
        RIDDLE: "Fantastic! You solved the riddle! Your reading skills are amazing!",
        TRUE_FALSE: "Correct! You understood that statement perfectly!",
        MULTIPLE_CHOICE: "Excellent choice! You really understood the story!",
        CHOOSE_ENDING: "Excellent choice! Thank you for sharing your perspective!",
        MORAL_DECISION: "Excellent choice! Thank you for sharing your perspective!",
      };
      setFeedbackState({
        type: "solved",
        message: messages[currentRiddle.type] || messages.MULTIPLE_CHOICE,
        isVisible: true,
      });
    } else if (isAlmost) {
      stopTimerAndLog("almost");
      
      // Create a local challenge attempt object for preview
      const now = new Date();
      const localAttempt: ChallengeAttempt = {
        id: Math.random().toString(36).substring(7),
        sessionId: "",
        challengeId: currentRiddle.id,
        status: ChallengeStatus.INCORRECT,
        attemptNumber: currentAttempt,
        usedHints: hintsUsed,
        isCorrect: false,
        textAnswer: answer,
        timeSpentSeconds: elapsedTime,
        createdAt: now,
        updatedAt: now,
        starEvent: {
          id: Math.random().toString(36).substring(7),
          attemptId: "",
          challengeId: currentRiddle.id,
          baseStars: 0,
          noHintBonus: 0,
          firstTryBonus: 0,
          totalStars: 0,
          attemptNumber: currentAttempt,
          usedHints: hintsUsed > 0,
          wasCorrect: false,
          createdAt: now,
          updatedAt: now,
        },
      };
      onChallengeSubmitted?.(localAttempt);
      
      setFeedbackState({
        type: "almost",
        message:
          "Think about it a little more. You can do this!",
        isVisible: true,
      });
    } else {
      stopTimerAndLog("incorrect");
      
      // Create a local challenge attempt object for preview
      const now = new Date();
      const localAttempt: ChallengeAttempt = {
        id: Math.random().toString(36).substring(7),
        sessionId: "",
        challengeId: currentRiddle.id,
        status: ChallengeStatus.INCORRECT,
        attemptNumber: currentAttempt,
        usedHints: hintsUsed,
        isCorrect: false,
        textAnswer: answer,
        timeSpentSeconds: elapsedTime,
        createdAt: now,
        updatedAt: now,
        starEvent: {
          id: Math.random().toString(36).substring(7),
          attemptId: "",
          challengeId: currentRiddle.id,
          baseStars: 0,
          noHintBonus: 0,
          firstTryBonus: 0,
          totalStars: 0,
          attemptNumber: currentAttempt,
          usedHints: hintsUsed > 0,
          wasCorrect: false,
          createdAt: now,
          updatedAt: now,
        },
      };
      onChallengeSubmitted?.(localAttempt);
      
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
    // Resume timer when user tries again
    setIsTimerRunning(true);
  };

  const handleContinue = (action: "solved" | "skipped") => {
    stopTimerAndLog(action === "solved" ? "solved" : "skipped");
    
    // If skipped, create and track the attempt locally
    if (action === "skipped") {
      const now = new Date();
      const localAttempt: ChallengeAttempt = {
        id: Math.random().toString(36).substring(7),
        sessionId: "",
        challengeId: currentRiddle.id,
        status: ChallengeStatus.SKIPPED,
        attemptNumber: attempts,
        usedHints: hintsUsed,
        isCorrect: null,
        textAnswer: null,
        timeSpentSeconds: elapsedTime,
        createdAt: now,
        updatedAt: now,
        starEvent: {
          id: Math.random().toString(36).substring(7),
          attemptId: "",
          challengeId: currentRiddle.id,
          baseStars: 0,
          noHintBonus: 0,
          firstTryBonus: 0,
          totalStars: 0,
          attemptNumber: attempts,
          usedHints: hintsUsed > 0,
          wasCorrect: null,
          createdAt: now,
          updatedAt: now,
        },
      };
      onChallengeSubmitted?.(localAttempt);
    }
    
    onClose?.();
  };

  const handleAudioPlay = () => {
    setIsAudioPlaying(!isAudioPlaying);
    setTimeout(() => setIsAudioPlaying(false), 3000);
  };


  return (
    <div className="">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Progress Indicator */}
        <FloatingItems
          attempts={attempts}
          hintsUsed={hintsUsed}
          totalHints={totalHints}
        />

        {/* Riddle Question */}
        <div className="mt-6">
          <RiddleQuestion
            question={currentRiddle.question}
            storyImage={currentRiddle.storyImage || "https://images.unsplash.com/photo-1730314737966-92b9760790eb"}
            storyImageAlt={currentRiddle.storyImageAlt}
            riddleNumber={1}
            totalRiddles={3}
            onAudioPlay={handleAudioPlay}
            isAudioPlaying={isAudioPlaying}
            elapsedTime={elapsedTime}
            challengeType={currentRiddle.type}
          />
        </div>

        {/* Answer Input */}
        <div className="mt-6 bg-card rounded-xl shadow-warm-lg p-6">
          {currentRiddle.type === "RIDDLE" ? (
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
            feedbackState.type === "solved" ? currentRiddle.starsReward : 0
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
