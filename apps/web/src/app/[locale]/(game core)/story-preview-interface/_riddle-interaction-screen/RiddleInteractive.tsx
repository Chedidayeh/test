"use client";

import { useState, useEffect, useRef } from "react";
import RiddleQuestion from "./RiddleQuestion";
import TextInputAnswer from "./TextInputAnswer";
import MultipleChoiceAnswer from "./MultipleChoiceAnswer";
import HintPanel from "./HintPanel";
import FeedbackDisplay from "./FeedbackDisplay";
import { Lightbulb } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import FloatingItems from "./FloatingItems";
import {
  Challenge,
  ChallengeStatus,
  ChallengeType,
  ChallengeAttempt,
  Local,
} from "@readdly/shared-types";
import { useLocale } from "@/src/contexts/LocaleContext";
import { useTranslations } from "next-intl";
import { validateAnswerAction } from "@/src/lib/ai-service/server-actions";

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
  questionAudioUrl?: string;
}

interface RiddleInteractiveProps {
  challenge?: Challenge | null;
  storyImage?: string;
  storyImageAlt?: string;
  onChallengeSubmitted?: (
    attempt: ChallengeAttempt,
    starsEarned?: number,
  ) => void;
  onClose?: () => void;
}

const RiddleInteractive = ({
  challenge,
  storyImage,
  storyImageAlt = "Story image",
  onChallengeSubmitted,
  onClose,
}: RiddleInteractiveProps) => {
  const t = useTranslations("StoryReadingInterface.riddleInterface");

  // Transform Challenge to Riddle format
  const { locale } = useLocale();
  const baseLocale = (locale || Local.EN).split("-")[0].toUpperCase();

  const transformChallengeToRiddle = (challenge: Challenge): Riddle => {
    // pick challenge-level translation if present
    const challengeTranslation = challenge.translations?.find(
      (t) => t.languageCode === baseLocale,
    );

    // Build choices with localized text when available
    const choices = challenge.answers?.map((answer) => {
      const answerTranslation = answer.translations?.find(
        (t) => t.languageCode === baseLocale,
      );
      return {
        id: answer.id,
        text: answerTranslation?.text || answer.text,
      };
    });

    // Determine correct answer text (localized if possible)
    const correctAnswerRaw =
      challenge.answers?.find((a) => a.isCorrect) || null;
    const correctAnswerTranslation = correctAnswerRaw
      ? correctAnswerRaw.translations?.find(
          (t) => t.languageCode === baseLocale,
        )
      : null;
    const correctAnswerText =
      correctAnswerTranslation?.text || correctAnswerRaw?.text || "";

    // Build hints (use translated hints array if present)
    const hintsArray = challengeTranslation?.hints || challenge.hints || [];

    const riddle: Riddle = {
      id: challenge.id,
      question: challengeTranslation?.question || challenge.question,
      type: challenge.type as ChallengeType,
      correctAnswer: correctAnswerText,
      choices: choices,
      hints: hintsArray.map((hint) => ({ text: hint })),
      storyImage: storyImage,
      storyImageAlt: storyImageAlt,
      starsReward: challenge.baseStars,
      questionAudioUrl: challengeTranslation?.audioUrl || challenge.audioUrl || undefined,
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
  const [isValidating, setIsValidating] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{
    type: "solved" | "almost" | "incorrect" | null;
    message: string;
    isVisible: boolean;
  }>({
    type: null,
    message: "",
    isVisible: false,
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);

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

  const checkAnswer = async (answer: string) => {
    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);

    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = currentRiddle.correctAnswer.toLowerCase();
    let isCorrect = false;
    let isAlmost = false;
    let llmMessage: string | null = null; // Local variable to store LLM message immediately

    // Type-specific validation logic
    switch (currentRiddle.type) {
      case "RIDDLE":
        // First check for exact match
        if (normalizedAnswer === correctAnswer) {
          isCorrect = true;
        } else if (
          normalizedAnswer.length > 0 &&
          correctAnswer.includes(normalizedAnswer.substring(0, 3))
        ) {
          isAlmost = true;
        } else {
          // If no exact match, use LLM validation
          try {
            setIsValidating(true);
            console.log("[Riddle] Attempting LLM validation for RIDDLE type");
            const validationResult = await validateAnswerAction({
              challengeId: challenge!.id,
              question: currentRiddle.question,
              correctAnswer: currentRiddle.correctAnswer,
              childAnswer: answer,
              challengeType: ChallengeType.RIDDLE,
              baseLocale: baseLocale,
            });

            if (validationResult.success && validationResult.data) {
              console.log("[Riddle] LLM validation result:", {
                correct: validationResult.data.correct,
                confidence: validationResult.data.confidence,
                message: validationResult.data.message,
              });
              isCorrect = validationResult.data.correct;
              // Store the LLM message in local variable to use immediately
              llmMessage = validationResult.data.message;
            } else {
              console.warn(
                "[Riddle] LLM validation failed:",
                validationResult.error,
              );
              isCorrect = false;
              llmMessage = null;
            }
          } catch (error) {
            console.error("[Riddle] Error calling LLM validation:", error);
            isCorrect = false;
            llmMessage = null;
          } finally {
            setIsValidating(false);
          }
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
      playFeedbackSound("correct");

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
        actions: [],
      };
      onChallengeSubmitted?.(localAttempt, currentRiddle.starsReward);

      const messages = {
        RIDDLE: t("solvedAnswerRIDDLE"),
        TRUE_FALSE: t("solvedAnswerTRUE_FALSE"),
        MULTIPLE_CHOICE: t("solvedAnswerMULTIPLE_CHOICE"),
        CHOOSE_ENDING: t("solvedAnswerCHOOSE_ENDING"),
        MORAL_DECISION: t("solvedAnswerMORAL_DECISION"),
      };

      // Use LLM message for RIDDLE type if available, otherwise use static message
      const feedbackMessage =
        currentRiddle.type === "RIDDLE" && llmMessage
          ? llmMessage
          : messages[currentRiddle.type];

      setFeedbackState({
        type: "solved",
        message: feedbackMessage,
        isVisible: true,
      });
    } else if (isAlmost) {
      stopTimerAndLog("almost");
      playFeedbackSound("incorrect");

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
        actions: [],
      };
      onChallengeSubmitted?.(localAttempt);

      setFeedbackState({
        type: "almost",
        message: t("almostAnswer"),
        isVisible: true,
      });
    } else {
      stopTimerAndLog("incorrect");
      playFeedbackSound("incorrect");

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
        actions: [],
      };
      onChallengeSubmitted?.(localAttempt);

      // Use LLM message for RIDDLE type if available, otherwise use static message
      const feedbackMessage =
        currentRiddle.type === "RIDDLE" && llmMessage
          ? llmMessage
          : t("incorrectAnswer");

      setFeedbackState({
        type: "incorrect",
        message: feedbackMessage,
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
    setIsValidating(false);
    // Resume timer when user tries again
    setIsTimerRunning(true);
  };

  const handleContinue = (action: "solved" | "skipped") => {
    stopTimerAndLog(action === "solved" ? "solved" : "skipped");
    setIsValidating(false);

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

        actions: [],
      };
      onChallengeSubmitted?.(localAttempt);
    }

    onClose?.();
  };

  const handlePlayAudio = () => {
    if (audioRef.current && currentRiddle.questionAudioUrl) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const playFeedbackSound = (type: "correct" | "incorrect") => {
    const soundRef = type === "correct" ? correctSoundRef : incorrectSoundRef;
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch((error) => {
        console.warn(`Failed to play ${type} sound:`, error);
      });
    }
  };

  return (
    <div className="pt-16 sm:pt-20 pb-20 sm:pb-24 md:pb-28 lg:pb-32">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-5xl">
        {/* Progress Indicator */}
        <FloatingItems
          attempts={attempts}
          hintsUsed={hintsUsed}
          totalHints={totalHints}
        />

        {/* Riddle Question */}
        <div className="mt-4 sm:mt-6">
          <RiddleQuestion
            question={currentRiddle.question}
            storyImage={
              currentRiddle.storyImage ||
              "https://images.unsplash.com/photo-1730314737966-92b9760790eb"
            }
            storyImageAlt={currentRiddle.storyImageAlt}
            riddleNumber={1}
            totalRiddles={3}
            onAudioPlay={handlePlayAudio}
            isAudioPlaying={isPlayingAudio}
            elapsedTime={elapsedTime}
            challengeType={currentRiddle.type}
            hasAudio={!!currentRiddle.questionAudioUrl}
          />
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={currentRiddle.questionAudioUrl || ""}
          onEnded={() => setIsPlayingAudio(false)}
          onPlay={() => setIsPlayingAudio(true)}
          onPause={() => setIsPlayingAudio(false)}
        />

        {/* Feedback Sound Effects */}
        <audio ref={correctSoundRef} src="/soundtracks/correct-answer.mp3" />
        <audio ref={incorrectSoundRef} src="/soundtracks/wrong-answer.mp3" />

        {/* Answer Input */}
        <div className="mt-4 sm:mt-6 bg-card rounded-xl shadow-warm-lg p-4 sm:p-6">
          {currentRiddle.type === "RIDDLE" ? (
            <TextInputAnswer
              onSubmit={handleTextSubmit}
              isDisabled={feedbackState.isVisible}
              isLoading={isValidating}
              placeholder={t("textInputAnswer.placeholder")}
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
                className="w-full mt-4 sm:mt-6 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base"
              >
                {t("submitAnswer")}
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
      {totalHints > 0 && (
        <div className="fixed right-2 sm:right-4 md:right-6 lg:right-8 top-22 sm:top-24 md:top-28 lg:top-32 z-50 pointer-events-none">
          <button
            onClick={handleShowHintPanel}
            className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-secondary text-white rounded-full shadow-warm hover:scale-105 transition-smooth disabled:opacity-50 text-xs sm:text-sm shrink-0"
          >
            <Lightbulb size={18} className="sm:size-5" />
            <span className="hidden sm:inline font-heading font-bold">
              {t("needAHint")} ({availableHints})
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RiddleInteractive;
