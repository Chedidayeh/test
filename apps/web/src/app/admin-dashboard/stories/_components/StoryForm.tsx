/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Story,
  Chapter,
  Challenge,
  Answer,
  ChallengeType,
  mockAgeGroups,
  mockRoadmaps,
  mockWorlds,
} from "../../_data/mockData";
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
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

// Validation schemas
const answerSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Answer text required"),
  isCorrect: z.boolean(),
  order: z.number().optional(),
});

const challengeSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "RIDDLE",
    "CHOOSE_ENDING",
    "MORAL_DECISION",
  ]),
  question: z.string().min(5, "Question must be at least 5 characters"),
  description: z.string().optional(),
  maxAttempts: z.number().int().min(1).max(10),
  baseStars: z.number().int().min(5).max(100),
  order: z.number().int().min(1),
  hints: z
    .array(z.string().min(1))
    .max(3, "Maximum 3 hints allowed")
    .optional(),
  answers: z.array(answerSchema).min(1, "At least one answer required"),
});

const chapterSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Chapter title required"),
  content: z.string().min(20, "Chapter content must be at least 20 characters"),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  order: z.number().int().min(1),
  challenges: z
    .array(challengeSchema)
    .min(1, "Each chapter must have at least one challenge"),
});

const storyFormSchema = z.object({
  ageGroupId: z.string().min(1, "Age group required"),
  worldId: z.string().min(1, "World required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  author: z.string().min(2, "Author name required"),
  difficulty: z.number().int().min(1).max(5),
  isMandatory: z.boolean(),
  order: z.number().int().min(1),
  chapters: z
    .array(chapterSchema)
    .min(1, "Story must have at least one chapter"),
});

type StoryFormData = z.infer<typeof storyFormSchema>;

// Helper function to generate answers structure based on challenge type
function getAnswersForType(type: ChallengeType, challengeId: string): Answer[] {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return [
        {
          id: `answer-new-${challengeId}-1`,
          challengeId,
          text: "",
          isCorrect: true,
          order: 1,
        },
        {
          id: `answer-new-${challengeId}-2`,
          challengeId,
          text: "",
          isCorrect: false,
          order: 2,
        },
        {
          id: `answer-new-${challengeId}-3`,
          challengeId,
          text: "",
          isCorrect: false,
          order: 3,
        },
        {
          id: `answer-new-${challengeId}-4`,
          challengeId,
          text: "",
          isCorrect: false,
          order: 4,
        },
      ];
    case "TRUE_FALSE":
      return [
        {
          id: `answer-new-${challengeId}-1`,
          challengeId,
          text: "True",
          isCorrect: true,
          order: 1,
        },
        {
          id: `answer-new-${challengeId}-2`,
          challengeId,
          text: "False",
          isCorrect: false,
          order: 2,
        },
      ];
    case "RIDDLE":
      return [
        {
          id: `answer-new-${challengeId}-1`,
          challengeId,
          text: "",
          isCorrect: true,
          order: 1,
        },
      ];
    case "CHOOSE_ENDING":
      return [
        {
          id: `answer-new-${challengeId}-1`,
          challengeId,
          text: "",
          isCorrect: true,
          order: 1,
        },
        {
          id: `answer-new-${challengeId}-2`,
          challengeId,
          text: "",
          isCorrect: false,
          order: 2,
        },
        {
          id: `answer-new-${challengeId}-3`,
          challengeId,
          text: "",
          isCorrect: false,
          order: 3,
        },
      ];
    case "MORAL_DECISION":
      return [
        {
          id: `answer-new-${challengeId}-1`,
          challengeId,
          text: "",
          isCorrect: true,
          order: 1,
        },
      ];
    default:
      return [
        {
          id: `answer-new-${challengeId}-1`,
          challengeId,
          text: "",
          isCorrect: true,
          order: 1,
        },
      ];
  }
}

interface StoryFormProps {
  story?: Story;
  onSubmit: (data: StoryFormData) => void;
  isLoading?: boolean;
}

export function StoryForm({
  story,
  onSubmit,
  isLoading = false,
}: StoryFormProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );
  const [expandedChallenges, setExpandedChallenges] = useState<
    Map<number, Set<number>>
  >(new Map([[0, new Set([0])]]));

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<StoryFormData>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: story
      ? {
          ageGroupId: story.chapters?.[0]?.id?.split("-")?.[1] || "",
          worldId: story.worldId,
          title: story.title,
          description: story.description,
          author: story.author,
          difficulty: story.difficulty,
          isMandatory: story.isMandatory,
          order: story.order,
          chapters: story.chapters || [],
        }
      : {
          chapters: [
            {
              id: "chapter-new-1",
              title: "",
              content: "",
              order: 1,
              imageUrl: "",
              audioUrl: "",
              challenges: [
                {
                  id: "challenge-new-1-1",
                  type: "MULTIPLE_CHOICE",
                  question: "",
                  description: "",
                  maxAttempts: 4,
                  baseStars: 20,
                  order: 1,
                  answers: getAnswersForType("MULTIPLE_CHOICE", "1-1"),
                },
              ],
            },
          ],
        },
  });

  const {
    fields: chapterFields,
    append: appendChapter,
    remove: removeChapter,
  } = useFieldArray({
    control,
    name: "chapters",
  });

  const ageGroupId = watch("ageGroupId");
  const worldId = watch("worldId");

  const selectedWorld = mockWorlds.find((w) => w.id === worldId);
  const selectedAgeGroup = mockAgeGroups.find((ag) => ag.id === ageGroupId);
  const roadmap = selectedAgeGroup?.roadmap;
  const worlds = roadmap?.worlds || [];

  const toggleChapter = (index: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChapters(newExpanded);
  };

  const toggleChallenge = (chapterIndex: number, challengeIndex: number) => {
    const newExpandedChallenges = new Map(expandedChallenges);
    const chapterSet = newExpandedChallenges.get(chapterIndex) || new Set();

    if (chapterSet.has(challengeIndex)) {
      chapterSet.delete(challengeIndex);
    } else {
      chapterSet.add(challengeIndex);
    }

    newExpandedChallenges.set(chapterIndex, chapterSet);
    setExpandedChallenges(newExpandedChallenges);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Hierarchy Selection */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Select Hierarchy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageGroupId">Age Group</Label>
            <Controller
              control={control}
              name="ageGroupId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="ageGroupId" className="mt-1">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAgeGroups.map((ag) => (
                      <SelectItem key={ag.id} value={ag.id}>
                        {ag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.ageGroupId && (
              <span className="text-xs text-red-600 mt-1">
                {errors.ageGroupId.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="worldId">World</Label>
            <Controller
              control={control}
              name="worldId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!ageGroupId}
                >
                  <SelectTrigger id="worldId" className="mt-1">
                    <SelectValue placeholder="Select world" />
                  </SelectTrigger>
                  <SelectContent>
                    {worlds.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.theme})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.worldId && (
              <span className="text-xs text-red-600 mt-1">
                {errors.worldId.message}
              </span>
            )}
          </div>
        </div>

        {selectedWorld && (
          <div className="mt-4 p-3 rounded border">
            <p className="text-sm">Selected World: {selectedWorld.name}</p>
            <p className="text-sm">Theme: {selectedWorld.theme}</p>
            <p className="text-sm">Description: {selectedWorld.description}</p>
          </div>
        )}
      </Card>

      {/* Story Metadata */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Story Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Story Title</Label>
            <Input
              id="title"
              placeholder="Enter story title"
              {...register("title")}
              className="mt-1"
            />
            {errors.title && (
              <span className="text-xs text-red-600 mt-1">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the story"
              {...register("description")}
              className="mt-1 h-20"
            />
            {errors.description && (
              <span className="text-xs text-red-600 mt-1">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Input
                id="difficulty"
                type="number"
                min="1"
                max="5"
                {...register("difficulty", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.difficulty && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.difficulty.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Chapters Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Chapters ({chapterFields.length})</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newChapterIndex = chapterFields.length;
              const challengeId = Date.now();
              appendChapter({
                id: `chapter-new-${challengeId}`,
                title: "",
                content: "",
                order: newChapterIndex + 1,
                imageUrl: "",
                audioUrl: "",
                challenges: [
                  {
                    id: `challenge-new-${challengeId}`,
                    type: "MULTIPLE_CHOICE",
                    question: "",
                    maxAttempts: 4,
                    baseStars: 20,
                    order: 1,
                    answers: getAnswersForType(
                      "MULTIPLE_CHOICE",
                      `${challengeId}`,
                    ),
                  },
                ],
              });
              setExpandedChapters(
                new Set([...expandedChapters, newChapterIndex]),
              );
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Chapter
          </Button>
        </div>

        <div className="space-y-3">
          {chapterFields.map((chapter, chapterIndex) => (
            <ChapterAccordion
              key={chapter.id}
              chapterIndex={chapterIndex}
              isExpanded={expandedChapters.has(chapterIndex)}
              onToggle={() => toggleChapter(chapterIndex)}
              onRemove={() =>
                chapterFields.length > 1 && removeChapter(chapterIndex)
              }
              register={register}
              control={control}
              errors={errors}
              expandedChallenges={
                expandedChallenges.get(chapterIndex) || new Set()
              }
              onToggleChallenge={(challengeIndex) =>
                toggleChallenge(chapterIndex, challengeIndex)
              }
              watch={watch}
              setValue={setValue}
            />
          ))}
        </div>

        {errors.chapters &&
          typeof errors.chapters === "object" &&
          !Array.isArray(errors.chapters) && (
            <span className="text-xs text-red-600 mt-4">
              {(errors.chapters as any).message}
            </span>
          )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : story ? "Update Story" : "Create Story"}
        </Button>
      </div>
    </form>
  );
}

// Chapter Accordion Component
function ChapterAccordion({
  chapterIndex,
  isExpanded,
  onToggle,
  onRemove,
  register,
  control,
  errors,
  expandedChallenges,
  onToggleChallenge,
  watch,
  setValue,
}: {
  chapterIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  register: any;
  control: any;
  errors: any;
  expandedChallenges: Set<number>;
  onToggleChallenge: (index: number) => void;
  watch: any;
  setValue: any;
}) {
  const {
    fields: challengeFields,
    append: appendChallenge,
    remove: removeChallenge,
  } = useFieldArray({
    control,
    name: `chapters.${chapterIndex}.challenges`,
  });

  return (
    <div className="border rounded-lg">
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer flex items-center justify-between"
      >
        <div className="flex-1">
          <p className="font-medium">Chapter {chapterIndex + 1}</p>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-t">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={onRemove}
            >
              Remove Chapter
            </Button>
          </div>

          <div>
            <Label>Chapter Content</Label>
            <Textarea
              placeholder="Write your chapter content here..."
              {...register(`chapters.${chapterIndex}.content`)}
              className="mt-1 h-32 font-mono text-sm"
            />
            {errors.chapters?.[chapterIndex]?.content && (
              <span className="text-xs text-red-600 mt-1">
                {errors.chapters[chapterIndex].content.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Image URL (optional)</Label>
              <Input
                placeholder="/images/chapter-1-1.jpg"
                {...register(`chapters.${chapterIndex}.imageUrl`)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Audio URL (optional)</Label>
              <Input
                placeholder="/audio/chapter-1-1.mp3"
                {...register(`chapters.${chapterIndex}.audioUrl`)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Challenges Section */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">
                Challenges ({challengeFields.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newIndex = challengeFields.length;
                  const challengeId = Date.now();
                  appendChallenge({
                    id: `challenge-new-${chapterIndex}-${challengeId}`,
                    type: "MULTIPLE_CHOICE",
                    question: "",
                    maxAttempts: 4,
                    baseStars: 20,
                    order: newIndex + 1,
                    answers: getAnswersForType(
                      "MULTIPLE_CHOICE",
                      `${chapterIndex}-${challengeId}`,
                    ),
                  });
                  const newSet = new Set([...expandedChallenges, newIndex]);
                  onToggleChallenge(newIndex);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Challenge
              </Button>
            </div>

            <div className="space-y-2">
              {challengeFields.map((challenge, challengeIndex) => (
                <ChallengeItem
                  key={challenge.id}
                  chapterIndex={chapterIndex}
                  challengeIndex={challengeIndex}
                  isExpanded={expandedChallenges.has(challengeIndex)}
                  onToggle={() => onToggleChallenge(challengeIndex)}
                  onRemove={() =>
                    challengeFields.length > 1 &&
                    removeChallenge(challengeIndex)
                  }
                  register={register}
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              ))}
            </div>

            {errors.chapters?.[chapterIndex]?.challenges && (
              <span className="text-xs text-red-600 mt-2">
                {(errors.chapters[chapterIndex].challenges as any).message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Challenge Item Component
function ChallengeItem({
  chapterIndex,
  challengeIndex,
  isExpanded,
  onToggle,
  onRemove,
  register,
  control,
  errors,
  watch,
  setValue,
}: {
  chapterIndex: number;
  challengeIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  register: any;
  control: any;
  errors: any;
  watch: any;
  setValue: any;
}) {
  const challengeType = watch(
    `chapters.${chapterIndex}.challenges.${challengeIndex}.type`,
  ) as ChallengeType;

  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
    replace: replaceAnswers,
  } = useFieldArray({
    control,
    name: `chapters.${chapterIndex}.challenges.${challengeIndex}.answers`,
  });

  const {
    fields: hintFields,
    append: appendHint,
    remove: removeHint,
  } = useFieldArray({
    control,
    name: `chapters.${chapterIndex}.challenges.${challengeIndex}.hints`,
  });

  // Handle challenge type change
  const handleTypeChange = (newType: ChallengeType) => {
    const newAnswers = getAnswersForType(
      newType,
      `${chapterIndex}-${challengeIndex}-${Date.now()}`,
    );
    replaceAnswers(newAnswers);
  };

  const getAnswerLabel = () => {
    switch (challengeType) {
      case "TRUE_FALSE":
        return "Answers";
      case "RIDDLE":
        return "Answer";
      case "CHOOSE_ENDING":
        return "Ending Options";
      case "MORAL_DECISION":
        return "Answer";
      case "MULTIPLE_CHOICE":
      default:
        return "Answers";
    }
  };

  const canAddMore = () => {
    switch (challengeType) {
      case "MULTIPLE_CHOICE":
        return answerFields.length < 4;
      case "TRUE_FALSE":
        return false;
      case "RIDDLE":
        return false;
      case "CHOOSE_ENDING":
        return answerFields.length < 3;
      case "MORAL_DECISION":
        return false;
      default:
        return true;
    }
  };

  return (
    <div className="border rounded-lg">
      <div
        onClick={onToggle}
        className="p-3 cursor-pointer flex items-center justify-between"
      >
        <p className="text-sm font-medium">Challenge {challengeIndex + 1}</p>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 border-t">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={onRemove}
            >
              Remove Challenge
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Controller
                control={control}
                name={`chapters.${chapterIndex}.challenges.${challengeIndex}.type`}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTypeChange(value as ChallengeType);
                    }}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                      <SelectItem value="RIDDLE">Riddle</SelectItem>
                      <SelectItem value="CHOOSE_ENDING">
                        Choose Ending
                      </SelectItem>
                      <SelectItem value="MORAL_DECISION">
                        Moral Decision
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label className="text-xs">Base Stars</Label>
              <Input
                type="number"
                min="5"
                max="100"
                {...register(
                  `chapters.${chapterIndex}.challenges.${challengeIndex}.baseStars`,
                  { valueAsNumber: true },
                )}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Question</Label>
            <Textarea
              placeholder="Enter the challenge question"
              {...register(
                `chapters.${chapterIndex}.challenges.${challengeIndex}.question`,
              )}
              className="mt-1 h-16 text-xs font-mono"
            />
          </div>

          {/* Answers Section */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium">{getAnswerLabel()}</p>
              {canAddMore() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    appendAnswer({
                      id: `answer-new-${chapterIndex}-${challengeIndex}-${Date.now()}`,
                      challengeId: `challenge-${chapterIndex}-${challengeIndex}`,
                      text: "",
                      isCorrect: false,
                    });
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Answer
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {answerFields.map((answer, answerIndex) => (
                <div
                  key={answer.id}
                  className="flex gap-2 items-start p-2 rounded border"
                >
                  {/* Radio button - only for types with multiple answers where only one can be correct */}
                  {(challengeType === "MULTIPLE_CHOICE" ||
                    challengeType === "TRUE_FALSE") && (
                    <div className="flex items-center pt-2">
                      <input
                        type="radio"
                        name={`chapters.${chapterIndex}.challenges.${challengeIndex}.correctAnswer`}
                        checked={watch(
                          `chapters.${chapterIndex}.challenges.${challengeIndex}.answers.${answerIndex}.isCorrect`,
                        )}
                        onChange={() => {
                          // Set only this answer as correct, mark all others as incorrect
                          for (let i = 0; i < answerFields.length; i++) {
                            setValue(
                              `chapters.${chapterIndex}.challenges.${challengeIndex}.answers.${i}.isCorrect`,
                              i === answerIndex,
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    {challengeType === "TRUE_FALSE" ? (
                      <div className="text-xs font-medium pt-1">
                        {answerIndex === 0 ? "True" : "False"}
                      </div>
                    ) : (
                      <Input
                        placeholder={
                          challengeType === "RIDDLE"
                            ? "Correct answer"
                            : challengeType === "MORAL_DECISION"
                              ? "Correct answer"
                              : "Answer text"
                        }
                        {...register(
                          `chapters.${chapterIndex}.challenges.${challengeIndex}.answers.${answerIndex}.text`,
                        )}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>

                  {challengeType !== "TRUE_FALSE" &&
                    answerFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(answerIndex)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                </div>
              ))}
            </div>

            {errors.chapters?.[chapterIndex]?.challenges?.[challengeIndex]
              ?.answers && (
              <span className="text-xs text-red-600 mt-2">
                {
                  (
                    errors.chapters[chapterIndex].challenges[challengeIndex]
                      .answers as any
                  ).message
                }
              </span>
            )}
          </div>

          {/* Hints Section */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium">Hints (Optional, Max 3)</p>
              {hintFields.length < 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    appendHint("");
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Hint
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {hintFields.map((_, hintIndex) => (
                <div key={hintIndex} className="flex gap-2 items-start">
                  <Input
                    placeholder={`Hint ${hintIndex + 1}`}
                    {...register(
                      `chapters.${chapterIndex}.challenges.${challengeIndex}.hints.${hintIndex}`,
                    )}
                    className="h-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeHint(hintIndex)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>

            {errors.chapters?.[chapterIndex]?.challenges?.[challengeIndex]
              ?.hints && (
              <span className="text-xs text-red-600 mt-2">
                {
                  (
                    errors.chapters[chapterIndex].challenges[challengeIndex]
                      .hints as any
                  ).message
                }
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
