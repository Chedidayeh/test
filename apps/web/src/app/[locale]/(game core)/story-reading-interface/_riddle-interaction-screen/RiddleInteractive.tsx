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
import { submitChallengeAnswerAction } from "@/src/lib/progress-service/server-actions";
import type { SubmitChallengeAnswerRequest } from "@/src/lib/progress-service/server-api";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
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
  gameSessionId?: string;
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
  gameSessionId,
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
      questionAudioUrl: challengeTranslation?.audioUrl || challenge.audioUrl,
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);

  // const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [actions, setActions] = useState<
    SubmitChallengeAnswerRequest["actions"]
  >([]);

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
    status: ChallengeStatus,
    attemptNum: number = attempts,
    attemptActions: SubmitChallengeAnswerRequest["actions"] = actions,
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
        actions: attemptActions,
      });

      if (result.success) {
        console.log("[Riddle] Challenge attempt recorded successfully", {
          totalStars: result.data?.totalStarsEarned,
          attemptId: result.data?.attempt?.id,
          skipped: isSkipped,
        });
        // Notify parent component of the updated attempt with stars earned
        if (result.data?.attempt) {
          onChallengeSubmitted?.(
            result.data.attempt,
            result.data?.totalStarsEarned,
          );
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

  const checkAnswer = async (answer: string) => {
    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);

    let isCorrect = false;
    const isAlmost = false;
    let selectedAnswerId: string | undefined;
    let answerText: string | undefined;
    let selectedAnswerText: string | undefined;
    let llmMessage: string | null = null;

    // Case 1: RIDDLE type - Use LLM validation
    if (currentRiddle.type === ChallengeType.RIDDLE) {
      try {
        setIsValidating(true);
        console.log("[Riddle] Calling LLM validation for RIDDLE type");

        const validationResult = await validateAnswerAction({
          challengeId: challenge!.id,
          question: currentRiddle.question,
          correctAnswer: currentRiddle.correctAnswer,
          childAnswer: answer,
          challengeType: ChallengeType.RIDDLE,
          baseLocale: baseLocale,
        });

        if (validationResult.success && validationResult.data) {
          isCorrect = validationResult.data.correct;
          llmMessage = validationResult.data.message;
          console.log("[Riddle] LLM validation completed:", {
            correct: isCorrect,
            confidence: validationResult.data.confidence,
            message: llmMessage,
          });

          stopTimerAndLog(isCorrect ? "solved" : "incorrect");
          answerText = answer;

          // Capture action
          const actionData: SubmitChallengeAnswerRequest["actions"][0] = {
            answerText,
            attemptNumberAtAction: currentAttempt,
            isCorrect: isCorrect,
          };

          const updatedActions = [...actions, actionData];
          setActions(updatedActions);

          // Display feedback immediately with LLM message
          setLocalFeedback(isCorrect, false, llmMessage || undefined);

          // Submit to backend in the background (don't wait for response)
          submitChallengeAnswerActionWithFeedback(
            undefined,
            answerText,
            isCorrect,
            false,
            isCorrect ? ChallengeStatus.SOLVED : ChallengeStatus.INCORRECT,
            currentAttempt,
            updatedActions,
          );
        } else {
          console.warn(
            "[Riddle] LLM validation failed:",
            validationResult.error,
          );
          setLocalFeedback(false, false);
        }
      } catch (error) {
        console.error("[Riddle] Error calling LLM validation:", error);
        setLocalFeedback(false, false);
      } finally {
        setIsValidating(false);
      }
    } else {
      // Case 2: Other challenge types - Direct validation using challenge data
      const normalizedAnswer = answer.toLowerCase().trim();
      const correctAnswer = currentRiddle.correctAnswer.toLowerCase();

      switch (currentRiddle.type) {
        case "TRUE_FALSE":
          isCorrect = normalizedAnswer === correctAnswer;
          answerText = answer;
          break;

        case "MULTIPLE_CHOICE":
          isCorrect = normalizedAnswer === correctAnswer;
          selectedAnswerId = selectedChoice || undefined;
          selectedAnswerText = currentRiddle.choices?.find(
            (c) => c.id === selectedChoice,
          )?.text;
          answerText = answer;
          break;

        case "CHOOSE_ENDING":
        case "MORAL_DECISION":
          // All answers are correct for these types (track child's choice)
          isCorrect = true;
          selectedAnswerId = selectedChoice || undefined;
          selectedAnswerText = currentRiddle.choices?.find(
            (c) => c.id === selectedChoice,
          )?.text;
          answerText = answer;
          break;
      }

      stopTimerAndLog(isCorrect ? "solved" : isAlmost ? "almost" : "incorrect");
      setLocalFeedback(isCorrect, isAlmost);

      // Capture action
      const actionData: SubmitChallengeAnswerRequest["actions"][0] = {
        selectedAnswerId,
        selectedAnswerText,
        answerText,
        attemptNumberAtAction: currentAttempt,
        isCorrect: isCorrect,
      };

      const updatedActions = [...actions, actionData];
      setActions(updatedActions);

      // Submit to backend
      submitChallengeAttempt(
        selectedAnswerId,
        answerText,
        isCorrect,
        false,
        isCorrect ? ChallengeStatus.SOLVED : ChallengeStatus.INCORRECT,
        currentAttempt,
        updatedActions,
      );
    }

    setSelectedChoice(null);
  };

  // Helper function to set feedback based on local validation
  // Accepts optional customMessage parameter to override static messages (e.g., for LLM responses)
  const setLocalFeedback = (isCorrect: boolean, isAlmost: boolean, customMessage?: string) => {
    if (isCorrect) {
      playFeedbackSound("correct");
      // Use custom message (from LLM) if provided, otherwise use static messages
      if (customMessage) {
        setFeedbackState({
          type: "solved",
          message: customMessage,
          isVisible: true,
        });
      } else {
        const messages = {
          RIDDLE: t("solvedAnswerRIDDLE"),
          TRUE_FALSE: t("solvedAnswerTRUE_FALSE"),
          MULTIPLE_CHOICE: t("solvedAnswerMULTIPLE_CHOICE"),
          CHOOSE_ENDING: t("solvedAnswerCHOOSE_ENDING"),
          MORAL_DECISION: t("solvedAnswerMORAL_DECISION"),
        };
        setFeedbackState({
          type: "solved",
          message: messages[currentRiddle.type] || messages.MULTIPLE_CHOICE,
          isVisible: true,
        });
      }
    } else if (isAlmost) {
      playFeedbackSound("incorrect");
      setFeedbackState({
        type: "almost",
        message: customMessage || t("almostAnswer"),
        isVisible: true,
      });
    } else {
      playFeedbackSound("incorrect");
      setFeedbackState({
        type: "incorrect",
        message: customMessage || t("incorrectAnswer"),
        isVisible: true,
      });
    }
  };

  // Wrapper for submitChallengeAttempt that returns the full result
  const submitChallengeAnswerActionWithFeedback = async (
    selectedAnswerId: string | undefined,
    answerText: string | undefined,
    wasLocallyCorrect: boolean,
    isSkipped: boolean = false,
    status: ChallengeStatus,
    attemptNum: number = attempts,
    attemptActions: SubmitChallengeAnswerRequest["actions"] = actions,
  ) => {
    if (!gameSessionId) {
      console.error("[Riddle] No game session ID provided");
      return null;
    }

    try {
      console.log(
        "[Riddle] Submitting challenge attempt for LLM validation...",
        {
          gameSessionId,
          challengeId: currentRiddle.id,
          attemptNumber: attemptNum,
          isSkipped,
        },
      );

      const result = await submitChallengeAnswerAction({
        gameSessionId,
        challengeId: currentRiddle.id,
        challengeType: currentRiddle.type,
        answerId: selectedAnswerId,
        textAnswer: answerText,
        isCorrect: isSkipped ? false : wasLocallyCorrect,
        elapsedTime: elapsedTime,
        attemptNumber: attemptNum,
        usedHints: hintsUsed,
        baseStars: currentRiddle.starsReward,
        skipped: isSkipped,
        status: status,
        actions: attemptActions,
      });

      if (result.success) {
        console.log("[Riddle] Challenge attempt recorded successfully (LLM)", {
          totalStars: result.data?.totalStarsEarned,
          attemptId: result.data?.attempt?.id,
          hasLLMValidation: !!result.data?.llmValidation,
        });
        if (result.data?.attempt) {
          onChallengeSubmitted?.(
            result.data.attempt,
            result.data?.totalStarsEarned,
          );
        }
      } else {
        console.error("[Riddle] Failed to record challenge attempt (LLM)", {
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      console.error(
        "[Riddle] Error submitting challenge attempt (LLM):",
        error,
      );
      return null;
    }
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
      submitChallengeAttempt(
        undefined,
        undefined,
        false,
        true,
        ChallengeStatus.SKIPPED,
        attempts,
        actions,
      );
    }

    onClose?.();
  };

  // const handleAudioPlay = () => {
  //   setIsAudioPlaying(!isAudioPlaying);
  //   setTimeout(() => setIsAudioPlaying(false), 3000);
  // };

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
              isLoading={isValidating}
              isDisabled={feedbackState.isVisible}
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
            className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-secondary text-white rounded-full shadow-warm hover:scale-105 transition-smooth disabled:opacity-50 text-xs sm:text-sm flex-shrink-0"
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
