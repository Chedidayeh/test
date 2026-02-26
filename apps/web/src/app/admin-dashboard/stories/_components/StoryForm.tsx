/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AgeGroup, World, Roadmap, ChallengeType } from "@shared/types";
import {
  storyFormSchema,
  ChallengTypeDescriptions,
  type StoryFormData,
} from "../_schema/storySchemas";
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
import { ChevronDown, ChevronUp, Plus, Trash2, AlertCircle } from "lucide-react";

interface StoryFormProps {
  worlds: World[];
  onSubmit: (data: StoryFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: any;
}

type ValidationErrors = Record<string, any>;

const getInitialFormData = (data?: any): StoryFormData => {
  if (data) {
    return {
      worldId: data.worldId || "",
      title: data.title || "",
      description: data.description || "",
      difficulty: data.difficulty || 1,
      order: data.order || 1,
      chapters: (data.chapters || []).map((chapter: any) => ({
        title: chapter.title || "",
        content: chapter.content || "",
        imageUrl: chapter.imageUrl || "",
        audioUrl: chapter.audioUrl || "",
        order: chapter.order || 1,
        challenge: chapter.challenge ? {
          type: chapter.challenge.type,
          question: chapter.challenge.question || "",
          description: chapter.challenge.description || "",
          baseStars: chapter.challenge.baseStars || 20,
          order: chapter.challenge.order || 0,
          hints: chapter.challenge.hints || [],
          answers: (chapter.challenge.answers || []).map((answer: any) => ({
            text: answer.text || "",
            isCorrect: answer.isCorrect || false,
            order: answer.order || 0,
          })),
        } : undefined,
      })),
    };
  }

  return {
    worldId: "",
    title: "",
    description: "",
    difficulty: 1,
    order: 1,
    chapters: [
      {
      title: "",
      content: "",
      imageUrl: "",
      audioUrl: "",
      order: 1,
      challenge: undefined,
    },
  ],
}};

export function StoryForm({
  worlds,
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
}: StoryFormProps) {
  const [formData, setFormData] = useState<StoryFormData>(getInitialFormData(initialData));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0])
  );
  const [expandedChallenge, setExpandedChallenge] = useState<Set<number>>(
    new Set([0])
  );

  const selectedWorld = worlds.find((w) => w.id === formData.worldId);

  const toggleChapter = (index: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChapters(newExpanded);
  };

  const toggleChallenge = (index: number) => {
    const newExpanded = new Set(expandedChallenge);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChallenge(newExpanded);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = storyFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

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

  const addChapter = () => {
    const newChapter = {
      title: "",
      content: "",
      imageUrl: "",
      audioUrl: "",
      order: formData.chapters.length + 1,
      challenge: undefined,
    };
    updateField("chapters", [...formData.chapters, newChapter]);
    setExpandedChapters(
      new Set([...expandedChapters, formData.chapters.length])
    );
  };

  const removeChapter = (index: number) => {
    if (formData.chapters.length > 1) {
      updateField(
        "chapters",
        formData.chapters.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Card className="sticky top-20 z-50 p-4 border-red-200 bg-red-50 shadow-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 mb-2">
                Form validation failed
              </p>
              <ul className="text-red-800 space-y-1">
                {Object.entries(errors).map(([path, message]) => (
                  <li key={path}>
                    <strong>{path}:</strong> {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* World Selection */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Select World</h3>
        <div>
          <Label htmlFor="worldId">World</Label>
          <Select value={formData.worldId} onValueChange={(value) => updateField("worldId", value)}>
            <SelectTrigger id="worldId" className="mt-1">
              <SelectValue placeholder="Select a world" />
            </SelectTrigger>
            <SelectContent>
              {worlds.map((world) => (
                <SelectItem key={world.id} value={world.id}>
                  {world.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.worldId && (
            <span className="text-xs text-red-600 mt-1">{errors.worldId}</span>
          )}
        </div>
      </Card>

      {/* Story Information */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Story Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Story Title</Label>
            <Input
              id="title"
              placeholder="Enter story title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-1"
            />
            {errors.title && (
              <span className="text-xs text-red-600 mt-1">{errors.title}</span>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the story"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-1 h-20"
            />
            {errors.description && (
              <span className="text-xs text-red-600 mt-1">
                {errors.description}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Input
                id="difficulty"
                type="number"
                min="1"
                max="5"
                value={formData.difficulty}
                onChange={(e) =>
                  updateField("difficulty", parseInt(e.target.value) || 1)
                }
                className="mt-1"
              />
              {errors.difficulty && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.difficulty}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  updateField("order", parseInt(e.target.value) || 1)
                }
                className="mt-1"
              />
              {errors.order && (
                <span className="text-xs text-red-600 mt-1">{errors.order}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Chapters Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            Chapters ({formData.chapters.length})
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChapter}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Chapter
          </Button>
        </div>

        <div className="space-y-3">
          {formData.chapters.map((chapter, chapterIndex) => (
            <ChapterAccordion
              key={chapterIndex}
              chapterIndex={chapterIndex}
              chapter={chapter}
              isExpanded={expandedChapters.has(chapterIndex)}
              isChallengExpanded={expandedChallenge.has(chapterIndex)}
              onToggle={() => toggleChapter(chapterIndex)}
              onToggleChallenge={() => toggleChallenge(chapterIndex)}
              onRemove={() => removeChapter(chapterIndex)}
              onUpdateField={(path, value) =>
                updateField(`chapters.${chapterIndex}.${path}`, value)
              }
              worlds={worlds}
              errors={errors}
            />
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? mode === "edit" 
              ? "Updating..." 
              : "Creating..."
            : mode === "edit"
            ? "Update Story"
            : "Create Story"
          }
        </Button>
      </div>
    </form>
  );
}

// Chapter Accordion Component
interface ChapterAccordionProps {
  chapterIndex: number;
  chapter: any;
  isExpanded: boolean;
  isChallengExpanded: boolean;
  onToggle: () => void;
  onToggleChallenge: () => void;
  onRemove: () => void;
  onUpdateField: (path: string, value: any) => void;
  worlds: World[];
  errors: ValidationErrors;
}

function ChapterAccordion({
  chapterIndex,
  chapter,
  isExpanded,
  isChallengExpanded,
  onToggle,
  onToggleChallenge,
  onRemove,
  onUpdateField,
  worlds,
  errors,
}: ChapterAccordionProps) {
  const [showAddChallenge, setShowAddChallenge] = useState(!!chapter.challenge);

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
        <div className="p-4 space-y-4 border-t ">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Chapter
            </Button>
          </div>

          <div>
            <Label className="text-sm">Chapter Title</Label>
            <Input
              placeholder="Chapter title"
              value={chapter.title}
              onChange={(e) => onUpdateField("title", e.target.value)}
              className="mt-1"
            />
            {errors[`chapters.${chapterIndex}.title`] && (
              <span className="text-xs text-red-600 mt-1">
                {errors[`chapters.${chapterIndex}.title`]}
              </span>
            )}
          </div>

          <div>
            <Label className="text-sm">Chapter Content</Label>
            <Textarea
              placeholder="Write your chapter content here..."
              value={chapter.content}
              onChange={(e) => onUpdateField("content", e.target.value)}
              className="mt-1 h-32 font-mono text-sm"
            />
            {errors[`chapters.${chapterIndex}.content`] && (
              <span className="text-xs text-red-600 mt-1">
                {errors[`chapters.${chapterIndex}.content`]}
              </span>
            )}
          </div>

          <div>
            <Label className="text-sm">Order</Label>
            <Input
              type="number"
              min="1"
              value={chapter.order}
              onChange={(e) =>
                onUpdateField("order", parseInt(e.target.value) || 1)
              }
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Image URL (optional)</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={chapter.imageUrl}
                onChange={(e) => onUpdateField("imageUrl", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Audio URL (optional)</Label>
              <Input
                placeholder="https://example.com/audio.mp3"
                value={chapter.audioUrl}
                onChange={(e) => onUpdateField("audioUrl", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Challenge Section */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Challenge (Optional)</h4>
              {!chapter.challenge && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onUpdateField("challenge", {
                      type: ChallengeType.MULTIPLE_CHOICE,
                      question: "",
                      baseStars: 10,
                      order: 1,
                      hints: [],
                      answers: getDefaultAnswersForType(ChallengeType.MULTIPLE_CHOICE),
                    });
                    setShowAddChallenge(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Challenge
                </Button>
              )}
            </div>

            {showAddChallenge && chapter.challenge && (
              <ChallengeSection
                chapterIndex={chapterIndex}
                challenge={chapter.challenge}
                isExpanded={isChallengExpanded}
                onToggle={onToggleChallenge}
                onUpdateField={(path, value) =>
                  onUpdateField(`challenge.${path}`, value)
                }
                onRemoveChallenge={() => {
                  onUpdateField("challenge", undefined);
                  setShowAddChallenge(false);
                }}
                errors={errors}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Challenge Section Component
interface ChallengeSectionProps {
  chapterIndex: number;
  challenge: any;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateField: (path: string, value: any) => void;
  onRemoveChallenge: () => void;
  errors: ValidationErrors;
}

function ChallengeSection({
  chapterIndex,
  challenge,
  isExpanded,
  onToggle,
  onUpdateField,
  onRemoveChallenge,
  errors,
}: ChallengeSectionProps) {
  const challengeType = challenge.type as ChallengeType | undefined;

  const handleTypeChange = (newType: ChallengeType) => {
    onUpdateField("type", newType);
    const defaultAnswers = getDefaultAnswersForType(newType);
    onUpdateField("answers", defaultAnswers);
  };

  const getAnswerLabel = () => {
    if (!challengeType) return "Answers";
    switch (challengeType) {
      case ChallengeType.TRUE_FALSE:
        return "Answers";
      case ChallengeType.RIDDLE:
        return "Answer";
      case ChallengeType.CHOOSE_ENDING:
        return "Ending Options";
      case ChallengeType.MORAL_DECISION:
        return "Decision Options";
      case ChallengeType.MULTIPLE_CHOICE:
      default:
        return "Answers";
    }
  };

  const canAddMoreAnswers = () => {
    if (!challengeType) return false;
    switch (challengeType) {
      case ChallengeType.MULTIPLE_CHOICE:
        return challenge.answers.length < 4;
      case ChallengeType.CHOOSE_ENDING:
        return challenge.answers.length < 3;
      case ChallengeType.RIDDLE:
        return true; // Allow adding multiple answers for riddle
      case ChallengeType.MORAL_DECISION:
        return true; // Allow adding more decision options
      case ChallengeType.TRUE_FALSE:
        return false; // Fixed 2 answers
      default:
        return false;
    }
  };

  return (
    <div className="border rounded-lg p-4  space-y-4">
      <div className="flex items-center justify-between">
        <div
          onClick={onToggle}
          className="cursor-pointer flex items-center justify-between flex-1 py-2"
        >
          <p className="text-sm font-medium">Challenge Details</p>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemoveChallenge}
          className="ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Challenge Type</Label>
              <Select
                value={challengeType || ""}
                onValueChange={(value) =>
                  handleTypeChange(value as ChallengeType)
                }
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ChallengeType.MULTIPLE_CHOICE}>
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value={ChallengeType.TRUE_FALSE}>True/False</SelectItem>
                  <SelectItem value={ChallengeType.RIDDLE}>Riddle</SelectItem>
                  <SelectItem value={ChallengeType.CHOOSE_ENDING}>Choose Ending</SelectItem>
                  <SelectItem value={ChallengeType.MORAL_DECISION}>Moral Decision</SelectItem>
                </SelectContent>
              </Select>
              {challengeType && (
                <p className="text-xs text-slate-500 mt-1">
                  {ChallengTypeDescriptions[challengeType]}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs">Base Stars (5-100)</Label>
              <Input
                type="number"
                min="5"
                max="100"
                value={challenge.baseStars}
                onChange={(e) =>
                  onUpdateField("baseStars", parseInt(e.target.value) || 5)
                }
                className="mt-1 h-8 text-xs"
              />
              {errors[`chapters.${chapterIndex}.challenge.baseStars`] && (
                <span className="text-xs text-red-600 mt-1">
                  {errors[`chapters.${chapterIndex}.challenge.baseStars`]}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs">Question</Label>
            <Textarea
              placeholder="Enter the challenge question"
              value={challenge.question}
              onChange={(e) => onUpdateField("question", e.target.value)}
              className="mt-1 h-16 text-xs font-mono"
            />
            {errors[`chapters.${chapterIndex}.challenge.question`] && (
              <span className="text-xs text-red-600 mt-1">
                {errors[`chapters.${chapterIndex}.challenge.question`]}
              </span>
            )}
          </div>

          <div>
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              placeholder="Additional context for the challenge"
              value={challenge.description || ""}
              onChange={(e) => onUpdateField("description", e.target.value)}
              className="mt-1 h-12 text-xs"
            />
            {errors[`chapters.${chapterIndex}.challenge.description`] && (
              <span className="text-xs text-red-600 mt-1">
                {errors[`chapters.${chapterIndex}.challenge.description`]}
              </span>
            )}
          </div>

          {/* Answers Section */}
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium">{getAnswerLabel()}</p>
              {canAddMoreAnswers() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newAnswers = [
                      ...challenge.answers,
                      {
                        text: "",
                        isCorrect: false,
                        order: challenge.answers.length,
                      },
                    ];
                    onUpdateField("answers", newAnswers);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Answer
                </Button>
              )}
            </div>

            {errors[`chapters.${chapterIndex}.challenge.answers`] && (
              <div className="text-xs text-red-600 mb-2 p-2 bg-red-50 rounded">
                {errors[`chapters.${chapterIndex}.challenge.answers`]}
              </div>
            )}
            <div className="space-y-2">
              {challenge.answers.map((answer: any, answerIndex: number) => (
                <div
                  key={answerIndex}
                  className="flex gap-2 items-start p-2 rounded border "
                >
                  {challengeType === ChallengeType.MULTIPLE_CHOICE ||
                  challengeType === ChallengeType.TRUE_FALSE ? (
                    <div className="flex items-center pt-2">
                      <input
                        type="radio"
                        name={`correct-answer-${chapterIndex}`}
                        checked={answer.isCorrect}
                        onChange={() => {
                          const newAnswers = challenge.answers.map(
                            (a: any, i: number) => ({
                              ...a,
                              isCorrect: i === answerIndex,
                            })
                          );
                          onUpdateField("answers", newAnswers);
                        }}
                        className="w-4 h-4"
                      />
                    </div>
                  ) : null}

                  <div className="flex-1">
                    {challengeType === ChallengeType.TRUE_FALSE ? (
                      <div className="text-xs font-medium pt-1">
                        {answerIndex === 0 ? "True" : "False"}
                      </div>
                    ) : (
                      <Input
                        placeholder="Answer text"
                        value={answer.text}
                        onChange={(e) => {
                          const newAnswers = [...challenge.answers];
                          newAnswers[answerIndex].text = e.target.value;
                          onUpdateField("answers", newAnswers);
                        }}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>

                  {challengeType !== ChallengeType.TRUE_FALSE &&
                  challenge.answers.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateField(
                          "answers",
                          challenge.answers.filter(
                            (_: any, i: number) => i !== answerIndex
                          )
                        );
                      }}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Hints Section */}
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium">Hints (Optional, Max 3)</p>
              {challenge.hints.length < 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onUpdateField("hints", [...challenge.hints, ""]);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Hint
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {challenge.hints.map((hint: string, hintIndex: number) => (
                <div key={hintIndex} className="flex gap-2 items-start">
                  <Input
                    placeholder={`Hint ${hintIndex + 1}`}
                    value={hint}
                    onChange={(e) => {
                      const newHints = [...challenge.hints];
                      newHints[hintIndex] = e.target.value;
                      onUpdateField("hints", newHints);
                    }}
                    className="h-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateField(
                        "hints",
                        challenge.hints.filter(
                          (_: string, i: number) => i !== hintIndex
                        )
                      );
                    }}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get default answers based on challenge type
function getDefaultAnswersForType(type: ChallengeType) {
  switch (type) {
    case ChallengeType.MULTIPLE_CHOICE:
      return [
        { text: "", isCorrect: true, order: 0 },
        { text: "", isCorrect: false, order: 1 },
        { text: "", isCorrect: false, order: 2 },
        { text: "", isCorrect: false, order: 3 },
      ];
    case ChallengeType.TRUE_FALSE:
      return [
        { text: "True", isCorrect: true, order: 0 },
        { text: "False", isCorrect: false, order: 1 },
      ];
    case ChallengeType.RIDDLE:
      return [{ text: "", isCorrect: true, order: 0 }];
    case ChallengeType.CHOOSE_ENDING:
      return [
        { text: "", isCorrect: true, order: 0 },
        { text: "", isCorrect: true, order: 1 },
        { text: "", isCorrect: true, order: 2 },
      ];
    case ChallengeType.MORAL_DECISION:
      return [
        { text: "", isCorrect: true, order: 0 },
        { text: "", isCorrect: true, order: 1 },
      ];
    default:
      return [{ text: "", isCorrect: true, order: 0 }];
  }
}