import { ChallengeType } from "@shared/types";
import { z } from "zod";

/**
 * Challenge Type Descriptions
 * Provides user-friendly descriptions for each challenge type
 */
export const ChallengTypeDescriptions: Record<ChallengeType, string> = {
  MULTIPLE_CHOICE: "Standard quiz format with 4 predefined answer options. Child selects one correct answer.",
  TRUE_FALSE: "Simple true/false format with 2 answer options.",
  RIDDLE: "Open-ended question where child types an answer. Correctness determined by keyword matching.",
  CHOOSE_ENDING: "All answers are correct. Assesses if child understands the story.",
  MORAL_DECISION: "All answers are correct. Assesses if child understands the moral of the story.",
};

/**
 * Answer Schema
 * Represents a single answer option for a challenge
 */
export const answerSchema = z.object({
  id: z.string().optional(),
  challengeId: z.string().optional(), // Optional for form creation
  text: z.string().min(1, "Answer text is required"),
  isCorrect: z.boolean(),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Answer Form Schema (for creating/updating answers)
 * Used when creating a single answer or batch answers
 */
export const answerFormSchema = z.object({
  text: z.string().min(1, "Answer text is required"),
  isCorrect: z.boolean(),
  order: z.number().int().min(0).default(0),
}).transform((data) => ({
  ...data,
  order: data.order ?? 0,
}));

/**
 * Challenge Schema
 * Represents a single challenge within a chapter
 * 
 * Validation rules for answers:
 * - MULTIPLE_CHOICE, TRUE_FALSE, RIDDLE: At least one answer must be correct
 * - CHOOSE_ENDING, MORAL_DECISION: All answers must be correct
 */
export const challengeSchema = z.object({
  id: z.string().optional(),
  chapterId: z.string().optional(), // Optional for form creation
  type: z.nativeEnum(ChallengeType),
  question: z.string().min(5, "Question must be at least 5 characters"),
  description: z.string().min(5, "Description must be at least 5 characters").or(z.literal("")).optional(),
  baseStars: z.number().int().min(5, "Base stars must be at least 5").max(100, "Base stars cannot exceed 100"),
  order: z.number().int().min(1, "Order must be at least 1"),
  hints: z.array(z.string().min(1, "Hint cannot be empty")).max(3, "Maximum 3 hints allowed").default([]),
  answers: z.array(answerSchema).min(1, "At least one answer is required"),
}).superRefine(({ type, answers }, ctx) => {
  const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
  
  if (type === ChallengeType.CHOOSE_ENDING || type === ChallengeType.MORAL_DECISION) {
    // For CHOOSE_ENDING and MORAL_DECISION, all answers must be correct
    if (correctAnswersCount !== answers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `All answers must be marked as correct for ${type} challenges`,
        path: ["answers"],
      });
    }
  } else if (
    type === ChallengeType.MULTIPLE_CHOICE ||
    type === ChallengeType.TRUE_FALSE ||
    type === ChallengeType.RIDDLE
  ) {
    // For other types, at least one answer must be correct
    if (correctAnswersCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `At least one answer must be marked as correct for ${type} challenges`,
        path: ["answers"],
      });
    }
  }
});

/**
 * Challenge Form Schema (for creating/updating challenges)
 * Used in the form creation flow
 * 
 * Validation rules for answers:
 * - MULTIPLE_CHOICE, TRUE_FALSE, RIDDLE: At least one answer must be correct
 * - CHOOSE_ENDING, MORAL_DECISION: All answers must be correct
 */
export const challengeFormSchema = z.object({
  type: z.nativeEnum(ChallengeType),
  question: z.string().min(5, "Question must be at least 5 characters"),
  description: z.string().min(5, "Description must be at least 5 characters").or(z.literal("")).optional(),
  baseStars: z.number().int().min(5).max(100),
  order: z.number().int().min(1),
  hints: z.array(z.string().min(1, "Hint cannot be empty")).max(3, "Maximum 3 hints allowed").default([]),
  answers: z.array(answerFormSchema).min(1, "At least one answer is required"),
}).transform((data) => ({
  ...data,
  hints: data.hints || [],
})).superRefine(({ type, answers }, ctx) => {
  const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
  
  if (type === ChallengeType.CHOOSE_ENDING || type === ChallengeType.MORAL_DECISION) {
    // For CHOOSE_ENDING and MORAL_DECISION, all answers must be correct
    if (correctAnswersCount !== answers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `All answers must be marked as correct for ${type} challenges`,
        path: ["answers"],
      });
    }
  } else if (
    type === ChallengeType.MULTIPLE_CHOICE ||
    type === ChallengeType.TRUE_FALSE ||
    type === ChallengeType.RIDDLE
  ) {
    // For other types, at least one answer must be correct
    if (correctAnswersCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `At least one answer must be marked as correct for ${type} challenges`,
        path: ["answers"],
      });
    }
  }
});

/**
 * Chapter Schema
 * Represents a single chapter within a story
 * Each chapter has content and an optional challenge
 */
export const chapterSchema = z.object({
  id: z.string().optional(),
  storyId: z.string().optional(), // Optional for form creation
  title: z.string().min(3, "Chapter title must be at least 3 characters"),
  content: z.string().min(20, "Chapter content must be at least 20 characters"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  audioUrl: z.string().url("Invalid audio URL").optional().or(z.literal("")),
  order: z.number().int().min(1, "Order must be at least 1"),
  challenge: challengeSchema.optional(), // Optional challenge for this chapter
});

/**
 * Chapter Form Schema (for creating/updating chapters)
 * Used in the form creation flow
 */
export const chapterFormSchema = z.object({
  title: z.string().min(3, "Chapter title must be at least 3 characters"),
  content: z.string().min(20, "Chapter content must be at least 20 characters"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  audioUrl: z.string().url("Invalid audio URL").optional().or(z.literal("")),
  order: z.number().int().min(1),
  challenge: challengeFormSchema.optional(),
});

/**
 * Story Schema
 * Represents a complete story with all chapters and challenges
 */
export const storySchema = z.object({
  id: z.string().optional(),
  worldId: z.string().min(1, "World ID is required"),
  title: z.string().min(3, "Story title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.number().int().min(1, "Difficulty must be between 1 and 5").max(5, "Difficulty must be between 1 and 5"),
  order: z.number().int().min(1, "Order must be at least 1"),
  chapters: z.array(chapterSchema).min(1, "At least one chapter is required"),
});

/**
 * Story Form Schema (for creating/updating stories)
 * This is the main schema used in the multi-step form
 * Can be used for bulk creation (story + chapters + challenges in one request)
 */
export const storyFormSchema = z.object({
  worldId: z.string().min(1, "World is required"),
  title: z.string().min(3, "Story title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.number().int().min(1).max(5),
  order: z.number().int().min(1),
  chapters: z.array(chapterFormSchema).min(1, "At least one chapter is required"),
});

/**
 * Story Basic Form Schema (Step 1: Basic story info only)
 * Used when creating story without chapters
 */
export const storyBasicFormSchema = z.object({
  worldId: z.string().min(1, "World is required"),
  title: z.string().min(3, "Story title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.number().int().min(1).max(5),
  order: z.number().int().min(1),
});

/**
 * Export TypeScript types inferred from schemas
 */
export type AnswerFormData = z.infer<typeof answerFormSchema>;
export type ChallengeFormData = z.infer<typeof challengeFormSchema>;
export type ChapterFormData = z.infer<typeof chapterFormSchema>;
export type StoryFormData = z.infer<typeof storyFormSchema>;
export type StoryBasicFormData = z.infer<typeof storyBasicFormSchema>;



/**
 * Helper type for API requests (excluding system fields)
 */
export type CreateStoryPayload = Omit<z.infer<typeof storySchema>, "id" | "createdAt" | "updatedAt">;
export type CreateChapterPayload = Omit<z.infer<typeof chapterSchema>, "id" | "createdAt" | "updatedAt" | "story">;
export type CreateChallengePayload = Omit<z.infer<typeof challengeSchema>, "id" | "createdAt" | "updatedAt" | "chapter">;
export type CreateAnswerPayload = Omit<z.infer<typeof answerSchema>, "id" | "createdAt" | "updatedAt">;
