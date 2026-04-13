/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  World,
  TranslationSourceType,
  LanguageCode,
  ChallengeType,
  AgeGroup,
  Roadmap,
} from "@readdly/shared-types";
import {
  storyFormSchema,
  storyBasicFormSchema,
  chapterFormSchema,
  challengeFormSchema,
  type StoryFormData,
} from "../_schema/storySchemas";
import { useState } from "react";
import { toast } from "sonner";
import { generateHintsAction } from "@/src/lib/ai-service/server-actions";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
} from "@/src/components/ui/dialog";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/src/components/ui/switch";

interface NewStoryFormProps {
  ageGroups: AgeGroup[];
  roadmaps: Roadmap[];
  worlds: World[];
  onSubmit: (data: StoryFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: any;
}

type ValidationErrors = Record<string, any>;

/**
 * Step Definition for Fixed 4-Step Form
 */
type StepType =
  | "storyDetails"
  | "chaptersManagement"
  | "challengesManagement"
  | "storyValidation";

interface StepInfo {
  type: StepType;
  index: number;
  label: string;
}

/**
 * Check if source is auto-translate mode (not MANUAL)
 */
const isAutoTranslateMode = (source: TranslationSourceType): boolean => {
  return source !== TranslationSourceType.MANUAL;
};

/**
 * Get all available languages
 */
const getAllLanguages = (): string[] => [
  LanguageCode.EN,
  LanguageCode.FR,
  LanguageCode.AR,
];

/**
 * Fixed 4-step configuration
 */
const STEPS: StepInfo[] = [
  { type: "storyDetails", index: 0, label: "Story Details" },
  { type: "chaptersManagement", index: 1, label: "Chapters" },
  { type: "challengesManagement", index: 2, label: "Challenges" },
  { type: "storyValidation", index: 3, label: "Review" },
];

const getInitialFormData = (data?: any): StoryFormData => {
  if (data) {
    return {
      worldId: data.worldId || "",
      title: data.title || "",
      description: data.description || "",
      difficulty: data.difficulty || 1,
      order: data.order || 1,
      ageGroup: data.ageGroup || "",
      translationSource: data.translationSource || TranslationSourceType.MANUAL,
      generateAudio: data.generateAudio || false,
      chapters: (data.chapters || []).map((chapter: any) => ({
        content: chapter.content || "",
        imageUrl: chapter.imageUrl || "",
        audioUrl: chapter.audioUrl || "",
        order: chapter.order || 1,
        translations: chapter.translations || [],
        challenge: chapter.challenge
          ? {
              type: chapter.challenge.type,
              question: chapter.challenge.question || "",
              description: chapter.challenge.description || "",
              baseStars: chapter.challenge.baseStars || 20,
              order: chapter.challenge.order || 0,
              hints: chapter.challenge.hints || [],
              translations: chapter.challenge.translations || [],
              answers: (chapter.challenge.answers || []).map((answer: any) => ({
                text: answer.text || "",
                isCorrect: answer.isCorrect || false,
                order: answer.order || 0,
                translations: answer.translations || [],
              })),
            }
          : undefined,
      })),
      translations: data.translations || [],
    };
  }

  return {
    worldId: "",
    title: "",
    description: "",
    difficulty: 1,
    order: 1,
    ageGroup: "",
    translationSource: TranslationSourceType.MANUAL,
    generateAudio: false,
    chapters: [
      {
        content: "",
        imageUrl: "",
        audioUrl: "",
        order: 1,
        translations: [],
        challenge: undefined,
      },
    ],
    translations: [],
  };
};

export function NewStoryForm({
  ageGroups,
  roadmaps,
  worlds,
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
}: NewStoryFormProps) {
  const [formData, setFormData] = useState<StoryFormData>(
    getInitialFormData(initialData),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentChapterIndexForChallenge, setCurrentChapterIndexForChallenge] =
    useState(0);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );

  const currentStep = STEPS[currentStepIndex];
  const selectedWorld = worlds.find((w) => w.id === formData.worldId);
  const existingStories = selectedWorld?.stories || [];

  const getNextAvailableOrder = (worldId: string) => {
    const world = worlds.find((w) => w.id === worldId);
    if (!world || !world.stories || world.stories.length === 0) {
      return 1;
    }
    const maxOrder = Math.max(...world.stories.map((s) => s.order));
    return maxOrder + 1;
  };

  const handleWorldChange = (worldId: string) => {
    const nextOrder = getNextAvailableOrder(worldId);
    setFormData((prev) => ({
      ...prev,
      worldId,
      order: nextOrder,
    }));
    setErrors({});
  };

  /**
   * Validate the current step
   */
  const validateCurrentStep = (): boolean => {
    if (!currentStep) return false;

    setErrors({});
    let result;

    if (currentStep.type === "storyDetails") {
      const storyData = {
        worldId: formData.worldId,
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        order: formData.order,
      };
      result = storyBasicFormSchema.safeParse(storyData);
    } else if (currentStep.type === "storyValidation") {
      // Step 4: Validate full story before submission
      result = storyFormSchema.safeParse(formData);
    } else if (currentStep.type === "chaptersManagement") {
      // Validate all chapters WITHOUT challenges (challenges validated separately in step 3)
      const hasValidChapters = formData.chapters.every((chapter) => {
        // Create chapter data without challenge field for validation
        const chapterWithoutChallenge = {
          content: chapter.content,
          imageUrl: chapter.imageUrl,
          audioUrl: chapter.audioUrl,
          order: chapter.order,
          translations: chapter.translations,
        };
        const parseResult = chapterFormSchema.safeParse(
          chapterWithoutChallenge,
        );
        return parseResult.success;
      });

      if (!hasValidChapters) {
        // Find first error for detailed feedback
        for (let i = 0; i < formData.chapters.length; i++) {
          const chapterWithoutChallenge = {
            content: formData.chapters[i].content,
            imageUrl: formData.chapters[i].imageUrl,
            audioUrl: formData.chapters[i].audioUrl,
            order: formData.chapters[i].order,
            translations: formData.chapters[i].translations,
          };
          const parseResult = chapterFormSchema.safeParse(
            chapterWithoutChallenge,
          );
          if (!parseResult.success) {
            const fieldErrors: ValidationErrors = {};
            parseResult.error.issues.forEach((issue) => {
              const path = `chapters[${i}].${issue.path.join(".")}`;
              fieldErrors[path] = issue.message;
            });
            setErrors(fieldErrors);
            return false;
          }
        }
      }
      return hasValidChapters;
    } else if (currentStep.type === "challengesManagement") {
      // Validate challenges for selected chapter
      const chapter = formData.chapters[currentChapterIndexForChallenge];
      if (chapter.challenge) {
        result = challengeFormSchema.safeParse(chapter.challenge);
      } else {
        // Optional - challenges can be empty
        return true;
      }
    }

    if (result && !result.success) {
      const fieldErrors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        // For challenges in step 3, prepend the chapter context
        let path = issue.path.join(".");
        if (currentStep?.type === "challengesManagement") {
          path = `chapters[${currentChapterIndexForChallenge}].challenge.${path}`;
        }
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    return true;
  };

  /**
   * Handle next step
   */
  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  /**
   * Handle previous step
   */
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  /**
   * Handle final submission
   */
  const handleFinalSubmit = () => {
    const fullValidation = storyFormSchema.safeParse(formData);
    if (!fullValidation.success) {
      const fieldErrors: ValidationErrors = {};
      fullValidation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    console.log(
      "Final validated form data ready for submission:",
      fullValidation.data,
    );
    console.log("Submitting data to server...", formData);

    onSubmit(formData);
  };

  /**
   * Update a field in the form data
   */
  const updateField = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = isNaN(Number(keys[i + 1])) ? {} : [];
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  /**
   * Update chapter field
   */
  const updateChapterField = (
    chapterIndex: number,
    fieldPath: string,
    value: any,
  ) => {
    updateField(`chapters.${chapterIndex}.${fieldPath}`, value);
  };

  /**
   * Update challenge field for a specific chapter
   */
  const updateChallengeField = (
    chapterIndex: number,
    fieldPath: string,
    value: any,
  ) => {
    // Special handling for challenge type changes
    if (fieldPath === "type") {
      const chapter = formData.chapters[chapterIndex];
      if (chapter.challenge) {
        // When changing to TRUE_FALSE, ensure exactly 2 answers with True/False values
        if (value === ChallengeType.TRUE_FALSE) {
          const answers = [
            {
              text: "True",
              isCorrect: true,
              order: 0,
              translations: [],
            },
            {
              text: "False",
              isCorrect: false,
              order: 1,
              translations: [],
            },
          ];
          updateField(`chapters.${chapterIndex}.challenge.answers`, answers);
        }
        // When changing to CHOOSE_ENDING, mark all as correct
        else if (value === ChallengeType.CHOOSE_ENDING) {
          const answers = chapter.challenge.answers.map((a: any) => ({
            ...a,
            isCorrect: true,
          }));
          updateField(`chapters.${chapterIndex}.challenge.answers`, answers);
        }
        // When changing to MORAL_DECISION, mark all as correct
        else if (value === ChallengeType.MORAL_DECISION) {
          const answers = chapter.challenge.answers.map((a: any) => ({
            ...a,
            isCorrect: true,
          }));
          updateField(`chapters.${chapterIndex}.challenge.answers`, answers);
        }
        // When changing to RIDDLE, ensure minimum 2 reference answers with only 1 marked correct
        else if (value === ChallengeType.RIDDLE) {
          const answers = chapter.challenge.answers.slice(0, 2);
          if (answers.length < 2) {
            answers.push({
              text: "",
              isCorrect: false,
              order: answers.length,
              translations: [],
            });
          }
          // Ensure only first answer is marked as correct
          const correctedAnswers = answers.map((a: any, idx: number) => ({
            ...a,
            isCorrect: idx === 0,
          }));
          updateField(
            `chapters.${chapterIndex}.challenge.answers`,
            correctedAnswers,
          );
        }
      }
    }

    updateField(`chapters.${chapterIndex}.challenge.${fieldPath}`, value);
  };

  /**
   * Add a new chapter
   */
  const addChapter = () => {
    const newChapter = {
      content: "",
      imageUrl: "",
      audioUrl: "",
      order: formData.chapters.length + 1,
      translations: [],
      challenge: undefined,
    };
    updateField("chapters", [...formData.chapters, newChapter]);
    setExpandedChapters((prev) => new Set([...prev, formData.chapters.length]));
  };

  /**
   * Remove a chapter
   */
  const removeChapter = (index: number) => {
    if (formData.chapters.length > 1) {
      const updatedChapters = formData.chapters.filter((_, i) => i !== index);
      const syncedChapters = updatedChapters.map((chapter, i) => ({
        ...chapter,
        order: i + 1,
      }));
      updateField("chapters", syncedChapters);
      setExpandedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });

      if (
        currentChapterIndexForChallenge === index &&
        currentChapterIndexForChallenge > 0
      ) {
        setCurrentChapterIndexForChallenge(currentChapterIndexForChallenge - 1);
      }
    }
  };

  /**
   * Toggle chapter expansion
   */
  const toggleChapterExpansion = (index: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  /**
   * Add challenge to a chapter
   */
  const addChallengeToChapter = (chapterIndex: number) => {
    const defaultChallenge = {
      type: ChallengeType.MULTIPLE_CHOICE,
      question: "",
      description: "",
      baseStars: 20,
      order: 1,
      hints: [],
      answers: [
        { text: "", isCorrect: true, order: 0, translations: [] },
        { text: "", isCorrect: false, order: 1, translations: [] },
      ],
      translations: [],
    };
    updateChapterField(chapterIndex, "challenge", defaultChallenge);
  };

  /**
   * Remove challenge from a chapter
   */
  const removeChallengeFromChapter = (chapterIndex: number) => {
    updateChapterField(chapterIndex, "challenge", undefined);
  };

  /**
   * Update answer in challenge
   */
  const updateAnswer = (
    chapterIndex: number,
    answerIndex: number,
    field: string,
    value: any,
  ) => {
    const chapter = formData.chapters[chapterIndex];
    const challenge = chapter?.challenge;

    if (!challenge) return;

    // Prevent changing isCorrect for CHOOSE_ENDING and MORAL_DECISION (all must be correct)
    if (
      field === "isCorrect" &&
      (challenge.type === ChallengeType.CHOOSE_ENDING ||
        challenge.type === ChallengeType.MORAL_DECISION)
    ) {
      return; // Don't update, must always be true for these types
    }

    // For RIDDLE and TRUE_FALSE, enforce single correct answer
    if (
      field === "isCorrect" &&
      value === true &&
      (challenge.type === ChallengeType.RIDDLE ||
        challenge.type === ChallengeType.TRUE_FALSE)
    ) {
      // If marking this answer as correct, unmark all others
      const updatedAnswers = challenge.answers.map((a: any, idx: number) => ({
        ...a,
        isCorrect: idx === answerIndex,
      }));
      updateField(`chapters.${chapterIndex}.challenge.answers`, updatedAnswers);
      return;
    }

    // Prevent unchecking the only correct answer for RIDDLE and TRUE_FALSE
    if (
      field === "isCorrect" &&
      value === false &&
      (challenge.type === ChallengeType.RIDDLE ||
        challenge.type === ChallengeType.TRUE_FALSE)
    ) {
      const correctAnswerCount = challenge.answers.filter(
        (a: any) => a.isCorrect,
      ).length;
      if (
        correctAnswerCount === 1 &&
        challenge.answers[answerIndex].isCorrect
      ) {
        return; // Don't allow unchecking the only correct answer
      }
    }

    updateField(
      `chapters.${chapterIndex}.challenge.answers.${answerIndex}.${field}`,
      value,
    );
  };

  /**
   * Add answer to challenge
   */
  const addAnswerToChallenge = (chapIdx: number) => {
    const chapter = formData.chapters[chapIdx];
    if (!chapter.challenge) return;

    const newAnswer = {
      text: "",
      isCorrect: false,
      order: chapter.challenge.answers.length,
      translations: [],
    };
    updateChallengeField(chapIdx, "answers", [
      ...chapter.challenge.answers,
      newAnswer,
    ]);
  };

  /**
   * Remove answer from challenge
   */
  const removeAnswerFromChallenge = (
    chapterIndex: number,
    answerIndex: number,
  ) => {
    const chapter = formData.chapters[chapterIndex];
    if (!chapter.challenge) return;

    const updatedAnswers = chapter.challenge.answers.filter(
      (_, i) => i !== answerIndex,
    );
    updateChallengeField(chapterIndex, "answers", updatedAnswers);
  };

  /**
   * Calculate progress percentage
   */
  const progressPercentage = ((currentStepIndex + 1) / STEPS.length) * 100;

  return (
    <>
      {/* Loading Dialog */}
      <Dialog open={isLoading}>
        <DialogPortal>
          <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 flex flex-col items-center gap-4 max-w-xs">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="font-medium text-slate-900 dark:text-white">
                  {mode === "edit" ? "Updating Story..." : "Creating Story..."}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Please wait while we {mode === "edit" ? "update" : "create"}{" "}
                  your story and translations.
                </p>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>

      <div className="w-full max-w-4xl mx-auto p-4">
        {/* Progress Bar */}
        <div className="mb-8">
          {/* Step Indicators */}
          <div className="flex justify-between mb-4 gap-2 pb-2">
            {STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                className={`h-10 min-w-10 font-semibold rounded-full flex items-center justify-center text-xs transition-all ${
                  idx < currentStepIndex
                    ? "bg-primary text-white cursor-pointer"
                    : idx === currentStepIndex
                      ? "bg-primary/70 text-white border-2"
                      : "bg-slate-200 text-slate-700"
                }`}
                animate={{
                  scale: idx === currentStepIndex ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => {
                  if (idx <= currentStepIndex) {
                    setCurrentStepIndex(idx);
                  }
                }}
              >
                {idx < currentStepIndex ? (
                  <CircleCheck className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </motion.div>
            ))}
          </div>

          {/* Smooth Progress Bar Animation */}
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Validation Errors */}
        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-4 right-4 z-50 w-full max-w-md"
            >
              <Card className="p-4 border-red-200 bg-red-50 shadow-lg pointer-events-auto">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 mb-2">
                      Please fix the following errors:
                    </p>
                    <ul className="text-red-800 space-y-1 text-sm">
                      {Object.entries(errors).map(([path, message]) => (
                        <li key={path}>
                          <strong>{path}:</strong> {String(message)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep?.type === "storyDetails" && (
            <StoryDetailsStep
              formData={formData}
              ageGroups={ageGroups}
              roadmaps={roadmaps}
              worlds={worlds}
              existingStories={existingStories}
              onWorldChange={handleWorldChange}
              onFieldChange={updateField}
              errors={errors}
            />
          )}

          {currentStep?.type === "chaptersManagement" && (
            <ChaptersManagementStep
              chapters={formData.chapters}
              translationSource={formData.translationSource}
              expandedChapters={expandedChapters}
              onToggleExpansion={toggleChapterExpansion}
              onChapterFieldChange={updateChapterField}
              onAddChapter={addChapter}
              onRemoveChapter={removeChapter}
              errors={errors}
            />
          )}

          {currentStep?.type === "challengesManagement" && (
            <ChallengesManagementStep
              chapters={formData.chapters}
              translationSource={formData.translationSource}
              currentChapterIndex={currentChapterIndexForChallenge}
              onChapterIndexChange={setCurrentChapterIndexForChallenge}
              onChallengeFieldChange={(fieldPath, value) =>
                updateChallengeField(
                  currentChapterIndexForChallenge,
                  fieldPath,
                  value,
                )
              }
              onAnswerChange={(answerIdx, field, value) =>
                updateAnswer(
                  currentChapterIndexForChallenge,
                  answerIdx,
                  field,
                  value,
                )
              }
              onAddAnswer={() =>
                addAnswerToChallenge(currentChapterIndexForChallenge)
              }
              onRemoveAnswer={(answerIdx) =>
                removeAnswerFromChallenge(
                  currentChapterIndexForChallenge,
                  answerIdx,
                )
              }
              onAddChallenge={() =>
                addChallengeToChapter(currentChapterIndexForChallenge)
              }
              onRemoveChallenge={() =>
                removeChallengeFromChapter(currentChapterIndexForChallenge)
              }
              errors={errors}
              difficulty={formData.difficulty}
              ageGroup={formData.ageGroup}
            />
          )}

          {currentStep?.type === "storyValidation" && (
            <StoryValidationStep formData={formData} worlds={worlds} />
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStepIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            type="button"
            onClick={
              currentStepIndex === STEPS.length - 1
                ? handleFinalSubmit
                : handleNextStep
            }
            disabled={isLoading}
            className="flex-1"
          >
            {currentStepIndex === STEPS.length - 1 ? (
              <>
                {mode === "edit" ? "Update Story" : "Create Story"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Step Counter */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Step {currentStepIndex + 1} of {STEPS.length}
        </p>
      </div>
    </>
  );
}

/**
 * Story Details Step Component - Step 1
 */
interface StoryDetailsStepProps {
  formData: StoryFormData;
  ageGroups: AgeGroup[];
  roadmaps: Roadmap[];
  worlds: World[];
  existingStories: any[];
  onWorldChange: (worldId: string) => void;
  onFieldChange: (path: string, value: any) => void;
  errors: ValidationErrors;
}

function StoryDetailsStep({
  formData,
  ageGroups,
  roadmaps,
  worlds,
  existingStories,
  onWorldChange,
  onFieldChange,
  errors,
}: StoryDetailsStepProps) {
  // Preselect roadmap/age group when editing an existing story
  const initialSelectedRoadmapId = formData.worldId
    ? worlds.find((w) => w.id === formData.worldId)?.roadmapId || ""
    : "";
  const initialSelectedAgeGroupId = initialSelectedRoadmapId
    ? roadmaps.find((r) => r.id === initialSelectedRoadmapId)?.ageGroupId || ""
    : "";

  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState<string>(
    initialSelectedAgeGroupId,
  );
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(
    initialSelectedRoadmapId,
  );

  const filteredRoadmaps = selectedAgeGroupId
    ? roadmaps.filter((r) => r.ageGroupId === selectedAgeGroupId)
    : [];

  const filteredWorlds = selectedRoadmapId
    ? worlds.filter((w) => w.roadmapId === selectedRoadmapId)
    : [];

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        {/* Age Group Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Age Group</label>
          <Select
            value={selectedAgeGroupId}
            onValueChange={(val) => {
              setSelectedAgeGroupId(val);
              // Get the age group name and store in form data
              const selectedAgeGroupName =
                ageGroups.find((g) => g.id === val)?.name || "";
              onFieldChange("ageGroup", selectedAgeGroupName);
              // reset downstream selections
              setSelectedRoadmapId("");
              onWorldChange("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an age group" />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Roadmap Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Roadmap</label>
          <Select
            value={selectedRoadmapId}
            onValueChange={(val) => {
              setSelectedRoadmapId(val);
              // reset world selection when roadmap changes
              onWorldChange("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a roadmap" />
            </SelectTrigger>
            <SelectContent>
              {filteredRoadmaps.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title + " - " + r.theme!.name || r.theme!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* World Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">World</label>
          <Select
            value={formData.worldId}
            onValueChange={(val) => onWorldChange(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a world" />
            </SelectTrigger>
            <SelectContent>
              {filteredWorlds.map((world) => (
                <SelectItem key={world.id} value={world.id}>
                  {world.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.worldId && (
            <p className="text-sm text-red-500 mt-1">{errors.worldId}</p>
          )}
        </div>
      </div>
      {/* Existing Stories Reference */}
      {formData.worldId && existingStories.length > 0 && (
        <Card className="p-2 px-4 bg-amber-50 border-amber-200">
          <h3 className="font-medium text-amber-900">
            Stories in this world:
          </h3>
          <div className="space-y-2 text-sm">
            {[...existingStories].sort((a, b) => a.order - b.order).map((story) => (
              <p key={story.id} className="text-amber-800">
                {story.order}. {story.title}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Generate audio files toggle button */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Audio files generation
        </label>
        <Switch
          checked={formData.generateAudio}
          onCheckedChange={(checked) => onFieldChange("generateAudio", checked)}
          className="data-[state=checked]:bg-primary"
        />

        <p className="text-sm text-primary mt-2">
          Toggle whether audio files should be generated for the story. If
          enabled, audio files will be created for each chapter content.{" "}
        </p>
      </div>

      {/* Translation Source */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Translation Mode
        </label>
        <Select
          value={formData.translationSource}
          onValueChange={(val) => onFieldChange("translationSource", val)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TranslationSourceType.MANUAL}>
              Manual Translations
            </SelectItem>
            <SelectItem value={TranslationSourceType.EN_TO_FR_AR}>
              Auto-translate (English → French, Arabic)
            </SelectItem>
            <SelectItem value={TranslationSourceType.FR_TO_AR_EN}>
              Auto-translate (French → Arabic, English)
            </SelectItem>
          </SelectContent>
        </Select>
        {isAutoTranslateMode(formData.translationSource) && (
          <p className="text-sm text-blue-500 mt-2">
            Translations will be automatically generated based on the selected
            source language.
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Story Title</label>
        <Input
          value={formData.title}
          onChange={(e) => onFieldChange("title", e.target.value)}
          placeholder="Enter story title..."
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title}</p>
        )}
        {isAutoTranslateMode(formData.translationSource) && (
          <p className="text-sm text-blue-500 mt-2">
            Translations will be automatically generated based on the selected
            source language.
          </p>
        )}
        {formData.translationSource === TranslationSourceType.MANUAL && (
          <div className="space-y-3 p-4 rounded border mt-4">
            <p className="text-sm font-medium">Title Translations</p>
            {getAllLanguages().map((lang) => {
              const translation = formData.translations.find(
                (t) => t.languageCode === lang,
              );
              return (
                <div key={lang}>
                  <label className="block text-xs font-medium mb-1">
                    {lang}
                  </label>
                  <Input
                    value={translation?.title || ""}
                    onChange={(e) => {
                      const translations = [...formData.translations];
                      const index = translations.findIndex(
                        (t) => t.languageCode === lang,
                      );
                      if (index >= 0) {
                        translations[index].title = e.target.value;
                      } else {
                        translations.push({
                          languageCode: lang,
                          title: e.target.value,
                          description: translation?.description || "",
                        });
                      }
                      onFieldChange("translations", translations);
                    }}
                    placeholder={`Translate title to ${lang}`}
                    className="text-sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Enter story description..."
          className="h-32"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description}</p>
        )}
        {isAutoTranslateMode(formData.translationSource) && (
          <p className="text-sm text-blue-500 mt-2">
            Translations will be automatically generated based on the selected
            source language.
          </p>
        )}
        {formData.translationSource === TranslationSourceType.MANUAL && (
          <div className="space-y-3 p-4 rounded border mt-4">
            <p className="text-sm font-medium">Description Translations</p>
            {getAllLanguages().map((lang) => {
              const translation = formData.translations.find(
                (t) => t.languageCode === lang,
              );
              return (
                <div key={lang}>
                  <label className="block text-xs font-medium mb-1">
                    {lang}
                  </label>
                  <Textarea
                    value={translation?.description || ""}
                    onChange={(e) => {
                      const translations = [...formData.translations];
                      const index = translations.findIndex(
                        (t) => t.languageCode === lang,
                      );
                      if (index >= 0) {
                        translations[index].description = e.target.value;
                      } else {
                        translations.push({
                          languageCode: lang,
                          title: translation?.title || "",
                          description: e.target.value,
                        });
                      }
                      onFieldChange("translations", translations);
                    }}
                    placeholder={`Translate description to ${lang}`}
                    className="text-sm h-24"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium mb-2">Difficulty</label>
        <Select
          value={String(formData.difficulty)}
          onValueChange={(val) => onFieldChange("difficulty", parseInt(val))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((level) => (
              <SelectItem key={level} value={String(level)}>
                Level {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.difficulty && (
          <p className="text-sm text-red-500 mt-1">{errors.difficulty}</p>
        )}
      </div>

      {/* Order */}
      <div>
        <label className="block text-sm font-medium mb-2">Story Order</label>
        <Input
          type="number"
          min="1"
          value={formData.order}
          disabled
          className="cursor-not-allowed bg-slate-100"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Automatically assigned based on the number of existing stories in this
          world.
        </p>
        {errors.order && (
          <p className="text-sm text-red-500 mt-1">{errors.order}</p>
        )}
      </div>
    </Card>
  );
}

/**
 * Chapters Management Step Component - Step 2
 */
interface ChaptersManagementStepProps {
  chapters: any[];
  translationSource: TranslationSourceType;
  expandedChapters: Set<number>;
  onToggleExpansion: (index: number) => void;
  onChapterFieldChange: (
    chapterIndex: number,
    fieldPath: string,
    value: any,
  ) => void;
  onAddChapter: () => void;
  onRemoveChapter: (index: number) => void;
  errors: ValidationErrors;
}

function ChaptersManagementStep({
  chapters,
  translationSource,
  expandedChapters,
  onToggleExpansion,
  onChapterFieldChange,
  onAddChapter,
  onRemoveChapter,
  errors,
}: ChaptersManagementStepProps) {
  return (
    <div className="space-y-4">
      {/* Chapters Accordion */}
      <div className="space-y-3">
        {chapters.map((chapter, idx) => (
          <Card key={idx} className="overflow-hidden">
            {/* Chapter Header */}
            <div
              className="p-4  dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
              onClick={() => onToggleExpansion(idx)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="shrink-0">
                  {expandedChapters.has(idx) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
                <h3 className="font-medium">
                  Chapter {idx + 1}
                  {chapter.challenge && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ✓ Has Challenge
                    </span>
                  )}
                </h3>
              </div>
              <div
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (chapters.length > 1) {
                    onRemoveChapter(idx);
                  }
                }}
              >
                {chapters.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Chapter Content */}
            {expandedChapters.has(idx) && (
              <div className="p-6 space-y-4 border-t">
                {/* Chapter Content Textarea */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chapter Content
                  </label>
                  <Textarea
                    value={chapter.content}
                    onChange={(e) =>
                      onChapterFieldChange(idx, "content", e.target.value)
                    }
                    placeholder="Write your chapter content here..."
                    className="h-32 font-mono text-sm"
                  />
                  {errors[`chapters[${idx}].content`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[`chapters[${idx}].content`]}
                    </p>
                  )}
                  {isAutoTranslateMode(translationSource) && (
                    <p className="text-sm text-blue-500 mt-2">
                      Translations will be automatically generated based on the
                      selected source language.
                    </p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image URL (Optional)
                  </label>
                  <Input
                    type="url"
                    value={chapter.imageUrl}
                    onChange={(e) =>
                      onChapterFieldChange(idx, "imageUrl", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors[`chapters[${idx}].imageUrl`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[`chapters[${idx}].imageUrl`]}
                    </p>
                  )}
                </div>

                {/* Audio URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Audio URL (Optional)
                  </label>
                  <Input
                    type="url"
                    value={chapter.audioUrl}
                    onChange={(e) =>
                      onChapterFieldChange(idx, "audioUrl", e.target.value)
                    }
                    placeholder="https://example.com/audio.mp3"
                  />
                  {errors[`chapters[${idx}].audioUrl`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[`chapters[${idx}].audioUrl`]}
                    </p>
                  )}
                </div>

                {/* Manual Translations */}
                {translationSource === TranslationSourceType.MANUAL && (
                  <div className="space-y-3 p-4 rounded border ">
                    <p className="text-sm font-medium">Translations</p>
                    {getAllLanguages().map((lang) => {
                      const translation = chapter.translations?.find(
                        (t: any) => t.languageCode === lang,
                      );
                      return (
                        <div key={lang}>
                          <label className="block text-xs font-medium mb-1">
                            {lang}
                          </label>
                          <Textarea
                            value={translation?.content || ""}
                            onChange={(e) => {
                              const translations = [
                                ...(chapter.translations || []),
                              ];
                              const index = translations.findIndex(
                                (t) => t.languageCode === lang,
                              );
                              if (index >= 0) {
                                translations[index].content = e.target.value;
                              } else {
                                translations.push({
                                  languageCode: lang,
                                  content: e.target.value,
                                });
                              }
                              onChapterFieldChange(
                                idx,
                                "translations",
                                translations,
                              );
                            }}
                            placeholder={`Translate chapter content to ${lang}`}
                            className="text-sm h-20"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Chapter Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onAddChapter}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Chapter
      </Button>
    </div>
  );
}

/**
 * Challenges Management Step Component - Step 3
 */
interface ChallengesManagementStepProps {
  chapters: any[];
  translationSource: TranslationSourceType;
  currentChapterIndex: number;
  onChapterIndexChange: (index: number) => void;
  onChallengeFieldChange: (fieldPath: string, value: any) => void;
  onAnswerChange: (answerIndex: number, field: string, value: any) => void;
  onAddAnswer: () => void;
  onRemoveAnswer: (answerIndex: number) => void;
  onAddChallenge: () => void;
  onRemoveChallenge: () => void;
  errors: ValidationErrors;
  difficulty?: number;
  ageGroup?: string;
}

function ChallengesManagementStep({
  chapters,
  translationSource,
  currentChapterIndex,
  onChapterIndexChange,
  onChallengeFieldChange,
  onAnswerChange,
  onAddAnswer,
  onRemoveAnswer,
  onAddChallenge,
  onRemoveChallenge,
  errors,
  difficulty,
  ageGroup,
}: ChallengesManagementStepProps) {
  const chapter = chapters[currentChapterIndex];
  const challenge = chapter?.challenge;
  const [isGeneratingHints, setIsGeneratingHints] = useState(false);
  const [stagedHints, setStagedHints] = useState<string[] | null>(null);

  // Check if challenge type is RIDDLE (open-ended, no predefined answers)
  const isRiddleType = () => challenge?.type === ChallengeType.RIDDLE;

  // Check if all answers must be marked as correct (CHOOSE_ENDING, MORAL_DECISION)
  const isAllAnswersCorrectType = () =>
    challenge?.type === ChallengeType.CHOOSE_ENDING ||
    challenge?.type === ChallengeType.MORAL_DECISION;

  // Check if TRUE_FALSE type (exactly 2 answers)
  const isTrueFalseType = () => challenge?.type === ChallengeType.TRUE_FALSE;

  /**
   * Generate hints for the challenge using LLM
   * Aggregates story content (current + previous chapters) and challenge data
   * Validates all required data before making the API call
   */
  const handleGenerateHints = async () => {
    // Validate challenge exists
    if (!challenge) {
      toast.error("No challenge found", {
        description: "Please add a challenge to this chapter first.",
      });
      return;
    }

    // Validate challenge type is set
    if (!challenge.type) {
      toast.error("Invalid challenge type", {
        description: "Please select a valid challenge type.",
      });
      return;
    }

    // Validate question is provided and non-empty
    if (!challenge.question || !challenge.question.trim()) {
      toast.error("Question is required", {
        description: "Please enter a challenge question.",
      });
      return;
    }

    // Validate answers exist and have content
    if (!challenge.answers || challenge.answers.length === 0) {
      toast.error("Answers are required", {
        description: "Please add at least one answer option.",
      });
      return;
    }

    // Get answers with non-empty text
    const answers = challenge.answers
      .map((a: any) => a.text)
      .filter((text: string) => text && text.trim());

    if (answers.length === 0) {
      toast.error("Answer text is empty", {
        description: "Please enter text for all answer options.",
      });
      return;
    }

    // Validate age group is provided (optional - will use backend default if not set)
    // This allows hint generation to work even when editing stories where age group might not be pre-populated
    const effectiveAgeGroup =
      ageGroup && ageGroup.trim() ? ageGroup.trim() : undefined;

    // Aggregate story content from current chapter and all previous chapters
    const storyContent = chapters
      .slice(0, currentChapterIndex + 1)
      .map((ch: any) => ch.content)
      .filter((content: string) => content && content.trim())
      .join("\n---\n");

    if (!storyContent.trim()) {
      toast.error("Story content is required", {
        description: "Please add content to the current chapter first.",
      });
      return;
    }

    // Validate difficulty level is valid
    if (difficulty === undefined || difficulty === null) {
      toast.error("Difficulty level is required", {
        description: "Please select a difficulty level for the story.",
      });
      return;
    }

    if (difficulty < 1 || difficulty > 5) {
      toast.error("Invalid difficulty level", {
        description: "Difficulty must be between 1 and 5.",
      });
      return;
    }

    // Build request payload with fallback for optional fields
    const payload = {
      storyContent,
      question: challenge.question.trim(),
      answers,
      challengeType: challenge.type,
      difficultyLevel: difficulty,
      ageGroup: effectiveAgeGroup, // Will use backend default if not provided
    };

    // Log payload for debugging
    console.log("Hint Generation Request:", payload);

    setIsGeneratingHints(true);
    try {
      const result = await generateHintsAction(payload);

      if (result.success && result.data?.hints) {
        // Store generated hints in staging area for review
        setStagedHints(result.data.hints);
        toast.success("Hints generated successfully!", {
          description: `Generated ${result.data.hints.length} progressive hints. Review and accept to apply.`,
        });
      } else {
        toast.error("Failed to generate hints", {
          description:
            result.error || "The AI service is currently unavailable.",
        });
      }
    } catch (error) {
      console.error("[UI] Error generating hints:", error);
      toast.error("Error generating hints", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsGeneratingHints(false);
    }
  };

  const canAddMoreAnswers = () => {
    if (!challenge) return false;
    const challengeType = challenge.type as ChallengeType | undefined;
    if (!challengeType) return false;

    // RIDDLE: max 4 reference answers (children type their own)
    if (challengeType === ChallengeType.RIDDLE)
      return challenge.answers.length < 4;

    // TRUE_FALSE: exactly 2 answers, no adding
    if (challengeType === ChallengeType.TRUE_FALSE) return false;

    // MULTIPLE_CHOICE: max 4 answers
    if (challengeType === ChallengeType.MULTIPLE_CHOICE)
      return challenge.answers.length < 4;

    // CHOOSE_ENDING: max 4 answers
    if (challengeType === ChallengeType.CHOOSE_ENDING)
      return challenge.answers.length < 4;

    // MORAL_DECISION: unlimited but we suggest 2-4
    return challenge.answers.length < 4;
  };

  const canRemoveAnswer = () => {
    if (!challenge) return false;

    // TRUE_FALSE: always need exactly 2, can't remove
    if (isTrueFalseType()) return false;

    // Others: minimum 2 answers
    return challenge.answers.length > 2;
  };

  return (
    <div className="space-y-6">
      {/* Chapter Selector */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-2">
          Select Chapter to Edit Challenges
        </label>
        <Select
          value={String(currentChapterIndex)}
          onValueChange={(val) => onChapterIndexChange(parseInt(val))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {chapters.map((ch, idx) => (
              <SelectItem key={idx} value={String(idx)}>
                Chapter {idx + 1}
                {ch.challenge && " (Has Challenge)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Challenge Form */}
      {challenge ? (
        <Card className="p-6 space-y-6">
          {/* Challenge Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Challenge Type
            </label>
            <Select
              value={challenge.type || ""}
              onValueChange={(val) => onChallengeFieldChange("type", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ChallengeType.MULTIPLE_CHOICE}>
                  Multiple Choice
                </SelectItem>
                <SelectItem value={ChallengeType.TRUE_FALSE}>
                  True/False
                </SelectItem>
                <SelectItem value={ChallengeType.RIDDLE}>Riddle</SelectItem>
                <SelectItem value={ChallengeType.CHOOSE_ENDING}>
                  Choose Ending
                </SelectItem>
                <SelectItem value={ChallengeType.MORAL_DECISION}>
                  Moral Decision
                </SelectItem>
              </SelectContent>
            </Select>
            {errors["challenge.type"] && (
              <p className="text-sm text-red-500 mt-1">
                {errors["challenge.type"]}
              </p>
            )}
          </div>

          {/* Challenge Question */}
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <Textarea
              value={challenge.question}
              onChange={(e) =>
                onChallengeFieldChange("question", e.target.value)
              }
              placeholder="Enter the challenge question..."
              className="h-24"
            />
            {errors["challenge.question"] && (
              <p className="text-sm text-red-500 mt-1">
                {errors["challenge.question"]}
              </p>
            )}
            {isAutoTranslateMode(translationSource) && (
              <p className="text-sm text-blue-500 mt-2">
                Translations will be automatically generated based on the
                selected source language.
              </p>
            )}
          </div>

          {/* Manual Translations for Question */}
          {translationSource === TranslationSourceType.MANUAL && (
            <div className="space-y-3 p-4 rounded border ">
              <p className="text-sm font-medium">Question Translations</p>
              {getAllLanguages().map((lang) => {
                const translation = challenge.translations?.find(
                  (t: any) => t.languageCode === lang,
                );
                return (
                  <div key={lang}>
                    <label className="block text-xs font-medium mb-1">
                      {lang}
                    </label>
                    <Textarea
                      value={translation?.question || ""}
                      onChange={(e) => {
                        const translations = [
                          ...(challenge.translations || []),
                        ];
                        const index = translations.findIndex(
                          (t) => t.languageCode === lang,
                        );
                        if (index >= 0) {
                          translations[index].question = e.target.value;
                        } else {
                          translations.push({
                            languageCode: lang,
                            question: e.target.value,
                            hints: [],
                          });
                        }
                        onChallengeFieldChange("translations", translations);
                      }}
                      placeholder={`Translate question to ${lang}`}
                      className="text-sm h-20"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Base Stars */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Base Stars (5-100)
            </label>
            <Input
              type="number"
              min="5"
              max="100"
              value={challenge.baseStars}
              onChange={(e) =>
                onChallengeFieldChange(
                  "baseStars",
                  parseInt(e.target.value) || 20,
                )
              }
            />
            {errors["challenge.baseStars"] && (
              <p className="text-sm text-red-500 mt-1">
                {errors["challenge.baseStars"]}
              </p>
            )}
          </div>

          {/* Answers Section - Displayed for all challenge types */}
          <div className="space-y-4 pt-4 border-t">
            {isAutoTranslateMode(translationSource) && (
              <p className="text-sm text-blue-500">
                Translations will be automatically generated based on the
                selected source language.
              </p>
            )}
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Answers</h3>
              {isRiddleType() && (
                <span className="text-xs bg-amber-100 text-amber-500s px-2 py-1 rounded">
                  Reference answers (min 2)
                </span>
              )}
              {isAllAnswersCorrectType() && (
                <span className="text-xs bg-blue-100 text-blue-500s px-2 py-1 rounded">
                  All answers are correct
                </span>
              )}
              {isTrueFalseType() && (
                <span className="text-xs bg-purple-100 text-purple-500s px-2 py-1 rounded">
                  Exactly 2 answers
                </span>
              )}
            </div>
            <div className="space-y-3">
              {challenge.answers.map((answer: any, idx: number) => (
                <>
                  <div key={idx} className="p-4 border rounded-lg space-y-3 ">
                    <div className="flex gap-2">
                      <Input
                        value={answer.text}
                        onChange={(e) =>
                          onAnswerChange(idx, "text", e.target.value)
                        }
                        placeholder="Answer text"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveAnswer(idx)}
                        disabled={!canRemoveAnswer()}
                        className={`${
                          !canRemoveAnswer()
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-100"
                        }`}
                        title={
                          isTrueFalseType()
                            ? "TRUE_FALSE requires exactly 2 answers"
                            : isRiddleType()
                              ? "RIDDLE requires minimum 2 reference answers"
                              : !canRemoveAnswer()
                                ? "Minimum 2 answers required"
                                : "Remove answer"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {!isAllAnswersCorrectType() ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={answer.isCorrect}
                          onChange={(e) =>
                            onAnswerChange(idx, "isCorrect", e.target.checked)
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label className="text-sm font-medium">
                          {isRiddleType() || isTrueFalseType()
                            ? "Correct Answer"
                            : "Mark as Correct"}
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="w-4 h-4"
                        />
                        <label>Automatically Correct</label>
                      </div>
                    )}
                    {errors[`challenge.answers.${idx}.text`] && (
                      <p className="text-sm text-red-500">
                        {errors[`challenge.answers.${idx}.text`]}
                      </p>
                    )}
                  </div>

                  {translationSource === TranslationSourceType.MANUAL &&
                    challenge.answers.length > 0 && (
                      <div className="space-y-4 pt-2 border-b  p-4 rounded">
                        <p className="text-sm font-medium">
                          Answers Translations
                        </p>
                        <div key={idx} className="space-y-2 pl-4">
                          <p className="text-xs font-medium text-slate-500">
                            Answer {idx + 1}{" "}
                            {(answer.isCorrect || isAllAnswersCorrectType()) &&
                              "(Correct)"}
                          </p>
                          {getAllLanguages().map((lang) => {
                            const translation = answer.translations?.find(
                              (t: any) => t.languageCode === lang,
                            );
                            return (
                              <div key={`${idx}-${lang}`}>
                                <label className="block text-xs font-medium mb-1">
                                  {lang}
                                </label>
                                <Textarea
                                  value={translation?.text || ""}
                                  onChange={(e) => {
                                    const translations = [
                                      ...(answer.translations || []),
                                    ];
                                    const transIdx = translations.findIndex(
                                      (t) => t.languageCode === lang,
                                    );
                                    if (transIdx >= 0) {
                                      translations[transIdx].text =
                                        e.target.value;
                                    } else {
                                      translations.push({
                                        languageCode: lang,
                                        text: e.target.value,
                                      });
                                    }
                                    onAnswerChange(
                                      idx,
                                      "translations",
                                      translations,
                                    );
                                  }}
                                  placeholder={`Translate answer ${idx + 1} to ${lang}`}
                                  className="text-sm h-20"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </>
              ))}
            </div>

            {canAddMoreAnswers() && (
              <Button
                type="button"
                variant="outline"
                onClick={onAddAnswer}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Answer
              </Button>
            )}

            {errors["challenge.answers"] && (
              <p className="text-sm text-red-500">
                {errors["challenge.answers"]}
              </p>
            )}
          </div>

          {/* Hints */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Hints (Max 3)
            </label>
            {isAutoTranslateMode(translationSource) && (
              <p className="text-sm text-blue-500 mb-4">
                Translations will be automatically generated based on the
                selected source language.
              </p>
            )}

            {/* Actual Hints List - User-confirmed hints */}
            {(challenge.hints || []).length > 0 && (
              <div className="mb-6 ">
                {/* <p className="text-sm font-semibold text-slate-600 mb-3">
                 Hints ({challenge.hints.length})
                </p> */}
                <div className="space-y-3">
                  {(challenge.hints || []).map((hint: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-slate-500 text-white">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium ">
                            Hint {idx + 1}
                          </span>
                        </div>
                        <p className="text-sm ">{hint}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          const newHints = (challenge.hints || []).filter(
                            (_: any, i: number) => i !== idx,
                          );
                          onChallengeFieldChange("hints", newHints);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Hints Button - Always Visible */}
            <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 mb-3">
                ✨ Let AI generate progressive hints based on your challenge and
                story context.
              </p>
              <Button
                type="button"
                size={"sm"}
                variant="default"
                onClick={handleGenerateHints}
                disabled={isGeneratingHints}
                className="max-w-max bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {isGeneratingHints ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating hints...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Hints with AI
                  </>
                )}
              </Button>
            </div>

            {/* Staged Hints - Awaiting Review */}
            {stagedHints && stagedHints.length > 0 && (
              <div className="mb-6 p-4 border bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-3">
                  Review Generated Hints ({stagedHints.length})
                </p>
                <div className="space-y-3 mb-4">
                  {stagedHints.map((hint: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded border border-amber-200 bg-white"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-amber-500 text-white">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium text-amber-600">
                            Hint {idx + 1}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size={"sm"}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      // Replace actual hints with staged hints
                      onChallengeFieldChange("hints", stagedHints);
                      setStagedHints(null);
                      toast.success("Hints accepted!", {
                        description: "AI-generated hints have been applied.",
                      });
                    }}
                  >
                    ✓ Accept & Apply
                  </Button>
                  <Button
                  size={"sm"}
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStagedHints(null);
                      toast.info("Hints rejected", {
                        description: "Generated hints were discarded.",
                      });
                    }}
                  >
                    ✕ Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Hints Editor - For manual translations */}
            {translationSource === TranslationSourceType.MANUAL &&
              (challenge.hints || []).length > 0 && (
                <div className="space-y-4 p-4 rounded border">
                  <p className="text-sm font-semibold text-slate-500s">
                    Hint Translations
                  </p>
                  <div className="space-y-4">
                    {(challenge.hints || []).map((_: string, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-xs font-medium text-slate-600">
                          Hint {idx + 1}
                        </p>
                        {getAllLanguages().map((lang) => {
                          const translation = challenge.translations?.find(
                            (t: any) => t.languageCode === lang,
                          );
                          const hintValue = translation?.hints?.[idx] || "";
                          return (
                            <div key={`${idx}-${lang}`}>
                              <label className="block text-xs font-medium mb-1">
                                {lang}
                              </label>
                              <Textarea
                                value={hintValue}
                                onChange={(e) => {
                                  const translations = [
                                    ...(challenge.translations || []),
                                  ];
                                  const transIdx = translations.findIndex(
                                    (t) => t.languageCode === lang,
                                  );
                                  const newHints =
                                    transIdx >= 0
                                      ? [
                                          ...(translations[transIdx].hints ||
                                            []),
                                        ]
                                      : [];
                                  newHints[idx] = e.target.value;

                                  if (transIdx >= 0) {
                                    translations[transIdx].hints = newHints;
                                  } else {
                                    translations.push({
                                      languageCode: lang,
                                      question: "",
                                      hints: newHints,
                                    });
                                  }
                                  onChallengeFieldChange(
                                    "translations",
                                    translations,
                                  );
                                }}
                                placeholder={`Translate hint ${idx + 1} to ${lang}`}
                                className="text-sm h-16"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {errors["challenge.hints"] && (
              <p className="text-sm text-red-500 mt-2">
                {errors["challenge.hints"]}
              </p>
            )}
          </div>

          {/* Remove Challenge */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onRemoveChallenge}
              className="w-full text-red-500 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Challenge
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">
              No challenge added for this chapter yet.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onAddChallenge}
              className="text-green-500 hover:bg-green-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Story Validation Step Component - Step 4
 */
interface StoryValidationStepProps {
  formData: StoryFormData;
  worlds: World[];
}

function StoryValidationStep({ formData, worlds }: StoryValidationStepProps) {
  const world = worlds.find((w) => w.id === formData.worldId);

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">Review Your Story</h2>
        <p className="text-muted-foreground">
          Please verify that all information is correct before creating your
          story
        </p>
      </div>

      <div className="space-y-6 border-t pt-6">
        {/* World */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            World
          </label>
          <p className=" font-medium mt-2">{world?.name || "Unknown"}</p>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Story Title
          </label>
          <p className=" font-medium mt-2">{formData.title}</p>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Description
          </label>
          <p className="text-base mt-2 whitespace-pre-wrap leading-relaxed">
            {formData.description}
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Difficulty Level
          </label>
          <p className=" font-medium mt-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-500s">
              {formData.difficulty} / 5
            </span>
          </p>
        </div>

        {/* Order */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Story Order
          </label>
          <p className=" font-medium mt-2">{formData.order}</p>
        </div>

        {/* Chapters Summary */}
        <div className="pt-4 border-t">
          <label className="text-sm font-medium text-muted-foreground">
            Chapters & Challenges
          </label>
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              Total Chapters:{" "}
              <span className="font-medium text-foreground">
                {formData.chapters.length}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Chapters with Challenges:{" "}
              <span className="font-medium text-foreground">
                {formData.chapters.filter((ch) => ch.challenge).length}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          All chapter and challenge details have been configured. Click
          &quot;Create Story&quot; to finalize.
        </p>
      </div>
    </Card>
  );
}
