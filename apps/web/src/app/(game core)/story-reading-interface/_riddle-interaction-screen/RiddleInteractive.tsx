"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RiddleQuestion from "./RiddleQuestion";
import TextInputAnswer from "./TextInputAnswer";
import MultipleChoiceAnswer from "./MultipleChoiceAnswer";
import HintPanel from "./HintPanel";
import FeedbackDisplay from "./FeedbackDisplay";
import { Lightbulb } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import FloatingItems from "./FloatingItems";
import { Challenge, ChallengeStatus, ChallengeType, ChallengeAttempt } from "@shared/types";
import { submitChallengeAnswerAction } from "@/src/lib/progress-service/server-actions";
import type { SubmitChallengeAnswerRequest } from "@/src/lib/progress-service/server-api";

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
  gameSessionId?: string;
  onChallengeSubmitted?: (attempt: ChallengeAttempt, starsEarned?: number) => void;
  onClose?: () => void;
}

const RiddleInteractive = ({
  challenge,
  storyImage,
  storyImageAlt = "Story image",
  gameSessionId,
  onChallengeSubmitted,
  onClose,
}: RiddleInteractiveProps) => {
  const router = useRouter();

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
  const [actions, setActions] = useState<SubmitChallengeAnswerRequest['actions']>([]);

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

  // Submit challenge answer to backend with attempt and star data
  const submitChallengeAttempt = async (
    selectedAnswerId: string | undefined,
    answerText: string | undefined,
    isCorrect: boolean,
    isSkipped: boolean = false,
    status : ChallengeStatus,
    attemptNum: number = attempts,
    attemptActions: SubmitChallengeAnswerRequest['actions'] = actions
  ) => {
    if (!gameSessionId) {
      console.error("[Riddle] No game session ID provided");
      return;
    }

    try {
      console.log("[Riddle] Submitting challenge attempt...", {
        gameSessionId,
        challengeId: currentRiddle.id,
        attemptNumber: attemptNum,
        isSkipped,
        actionsCount: attemptActions.length,
      });
      console.log("[Riddle] Attempt actions being submitted:", attemptActions);

      const result = await submitChallengeAnswerAction({
        gameSessionId,
        challengeId: currentRiddle.id,
        challengeType: currentRiddle.type,
        answerId: selectedAnswerId,
        textAnswer: answerText,
        isCorrect: isSkipped ? false : isCorrect,
        elapsedTime: elapsedTime,
        attemptNumber: attemptNum,
        usedHints: hintsUsed,
        baseStars: currentRiddle.starsReward,
        skipped: isSkipped,
        status: status,
        actions: attemptActions
      });

      if (result.success) {
        console.log("[Riddle] Challenge attempt recorded successfully", {
          totalStars: result.data?.totalStarsEarned,
          attemptId: result.data?.attempt?.id,
          skipped: isSkipped,
        });
        // Notify parent component of the updated attempt with stars earned
        if (result.data?.attempt) {
          onChallengeSubmitted?.(result.data.attempt, result.data?.totalStarsEarned);
        }
      } else {
        console.error("[Riddle] Failed to record challenge attempt", {
          error: result.error,
        });
      }
    } catch (error) {
      console.error("[Riddle] Error submitting challenge attempt:", error);
    }
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
    let selectedAnswerId: string | undefined;
    let answerText: string | undefined;
    let selectedAnswerText: string | undefined;

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
        answerText = answer;
        break;

      case "TRUE_FALSE":
        // For true/false: exact match only
        if (normalizedAnswer === correctAnswer) {
          isCorrect = true;
        }
        answerText = answer;
        break;

      case "MULTIPLE_CHOICE":
        // For multiple choice: exact match required
        if (normalizedAnswer === correctAnswer) {
          isCorrect = true;
        }
        // Get the answer ID from selected choice
        selectedAnswerId = selectedChoice || undefined;
        selectedAnswerText = currentRiddle.choices?.find((c) => c.id === selectedChoice)?.text;
        answerText = answer;
        break;

      case "CHOOSE_ENDING":
      case "MORAL_DECISION":
        // For these types: all answers are correct (we log the child's choice to track story understanding)
        isCorrect = true;
        // Get the answer ID from selected choice
        selectedAnswerId = selectedChoice || undefined;
        selectedAnswerText = currentRiddle.choices?.find((c) => c.id === selectedChoice)?.text;
        answerText = answer;
        break;
    }

    // Capture action for this answer submission
    const actionData: SubmitChallengeAnswerRequest['actions'][0] = {
      selectedAnswerId,
      selectedAnswerText,
      answerText,
      attemptNumberAtAction: currentAttempt,
      isCorrect: isCorrect,
    };
    
    // Build new actions array synchronously before submitting
    const updatedActions = [...actions, actionData];
    setActions(updatedActions);

    console.log("[Riddle] Answer submitted", {
      challengeType: currentRiddle.type,
      attemptNumber: currentAttempt,
      action: actionData,
      totalActionsAfterSubmit: updatedActions.length,
    });

    if (isCorrect) {
      stopTimerAndLog("solved");
      // Submit the challenge attempt to backend with all accumulated actions
      submitChallengeAttempt(selectedAnswerId, answerText, true, false , ChallengeStatus.SOLVED, currentAttempt, updatedActions);
      
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
      // Submit the challenge attempt to backend (incorrect answer) with all accumulated actions
      submitChallengeAttempt(selectedAnswerId, answerText, false, false, ChallengeStatus.INCORRECT, currentAttempt, updatedActions);
      
      setFeedbackState({
        type: "almost",
        message:
          "Think about it a little more. You can do this!",
        isVisible: true,
      });
    } else {
      stopTimerAndLog("incorrect");
      // Submit the challenge attempt to backend (incorrect answer) with all accumulated actions
      submitChallengeAttempt(selectedAnswerId, answerText, false, false, ChallengeStatus.INCORRECT, currentAttempt, updatedActions);
      
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
      const newHintLevel = currentHintLevel + 1;
      setCurrentHintLevel(newHintLevel);
      setHintsUsed((prev) => prev + 1);
      setIsHintPanelVisible(true);
      
      // Capture hint action
      setActions((prev) => [
        ...prev,
        { 
          attemptNumberAtAction: attempts,
        },
      ]);
      
      console.log("[Riddle] Hint requested", {
        hintIndex: newHintLevel - 1,
        attemptNumber: attempts,
      });
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
    // Clear actions for retry - fresh attempt with new action history
    setActions([]);
    console.log("[Riddle] Retrying challenge - actions cleared");
  };

  const handleContinue = (action: "solved" | "skipped") => {
    stopTimerAndLog(action === "solved" ? "solved" : "skipped");
    
    // If skipped, record the attempt as skipped to the backend with all accumulated actions
    if (action === "skipped") {
      submitChallengeAttempt(undefined, undefined, false, true, ChallengeStatus.SKIPPED, attempts, actions);
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
