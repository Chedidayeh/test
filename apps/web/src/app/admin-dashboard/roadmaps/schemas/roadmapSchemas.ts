import { z } from "zod";

export const worldSchema = z.object({
  id: z.string().optional(),
  roadmapId: z.string(),
  name: z.string().min(2, "World name must be at least 2 characters"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().int().min(1),
  locked: z.boolean(),
  requiredStarCount: z.number().int().min(0),
});

export const roadmapSchema = z.object({
  id: z.string().optional(),
  ageGroupId: z.string().min(1, "Age group required"),
  themeId: z.string().min(1, "Theme required"),
  worlds: z.array(worldSchema).min(1, "At least one world required"),
});

export const roadmapFormSchema = roadmapSchema;

export type WorldFormData = z.infer<typeof worldSchema>;
export type RoadmapFormData = z.infer<typeof roadmapFormSchema>;
