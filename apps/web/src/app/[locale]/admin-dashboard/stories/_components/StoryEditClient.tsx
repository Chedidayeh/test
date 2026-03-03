"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CreateStoryWithChaptersInput, World, Story } from "@shared/types";
import { StoryForm } from "./StoryForm";
import { StoryFormData, storyFormSchema } from "../_schema/storySchemas";
import { editStoryWithChaptersAction } from "@/src/lib/content-service/server-actions";

interface StoryEditClientProps {
  worlds: World[];
  story: Story;
}

export function StoryEditClient({
  worlds,
  story,
}: StoryEditClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: StoryFormData) => {
    setIsLoading(true);
    try {
      // Validate data with schema
      const validatedData = storyFormSchema.parse(formData);

      // Transform form data to atomic batch creation input
      const batchData: CreateStoryWithChaptersInput = {
        worldId: validatedData.worldId,
        title: validatedData.title,
        description: validatedData.description,
        difficulty: validatedData.difficulty,
        order: validatedData.order,
        chapters: validatedData.chapters.map((chapter) => ({
          title: chapter.title,
          content: chapter.content,
          imageUrl: chapter.imageUrl || undefined,
          audioUrl: chapter.audioUrl || undefined,
          order: chapter.order,
          ...(chapter.challenge && {
            challenge: {
              type: chapter.challenge.type,
              question: chapter.challenge.question,
              description: chapter.challenge.description || undefined,
              baseStars: chapter.challenge.baseStars,
              order: chapter.challenge.order,
              hints: chapter.challenge.hints || [],
              answers: chapter.challenge.answers.map((answer) => ({
                text: answer.text,
                isCorrect: answer.isCorrect,
                order: answer.order || 0,
              })),
            },
          }),
        })),
      };

      // Create story with chapters, challenges, and answers in a single atomic transaction
      const result = await editStoryWithChaptersAction(story.id, batchData);

      if (!result.success) {
        toast.error(result.error?.message || "Failed to edit story");
        return;
      }

      // Show success message with metadata
      const successMessage = `Story edited successfully!`;
      toast.success(successMessage);
      
      router.push("/admin-dashboard/stories");
    } catch (error) {
      console.error("Story edit error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to edit story");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StoryForm
      worlds={worlds}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode="edit"
      initialData={story}
    />
  );
}
