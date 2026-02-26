import { ReadingLevel, AgeGroupStatus } from "@shared/types";
import { z } from "zod";

export const ageGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Age group name must be at least 2 characters"),
  minAge: z.number().int().min(1, "Min age must be at least 1"),
  maxAge: z.number().int().min(1, "Max age must be at least 1"),
  status: z.nativeEnum(AgeGroupStatus),
});

export const themeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Theme name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const worldSchema = z.object({
  id: z.string().optional(),
  roadmapId: z.string().min(1, "Roadmap ID required"),
  name: z.string().min(2, "World name must be at least 2 characters"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  order: z.number().int().min(1, "Order must be at least 1"),
});

export const roadmapSchema = z.object({
  id: z.string().optional(),
  ageGroupId: z.string().min(1, "Age group required"),
  themeId: z.string().min(1, "Theme required"),
  readingLevel: z.nativeEnum(ReadingLevel),
});

// Form schema - simplified, no worlds array
export const roadmapFormSchema = z.object({
  ageGroupId: z.string().min(1, "Age group required"),
  themeId: z.string().min(1, "Theme required"),
  readingLevel: z.nativeEnum(ReadingLevel),
});

export type AgeGroupFormData = z.infer<typeof ageGroupSchema>;
export type ThemeFormData = z.infer<typeof themeSchema>;
export type WorldFormData = z.infer<typeof worldSchema>;
export type RoadmapFormData = z.infer<typeof roadmapFormSchema>;
