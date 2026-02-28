"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CreateStoryWithChaptersInput, World } from "@shared/types";
import { StoryFormData, storyFormSchema } from "../_schema/storySchemas";
import { createStoryWithChaptersAction } from "@/src/lib/content-service/server-actions";
import { StoryForm } from "./StoryForm";

interface StoryCreateClientProps {
  worlds: World[];
}

export function StoryCreateClient({
  worlds,
}: StoryCreateClientProps) {
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
      const result = await createStoryWithChaptersAction(batchData);

      if (!result.success) {
        // Enhanced error handling with polished feedback
        const errorCode = result.error?.code;
        const errorMessage = result.error?.message || "Failed to create story";

        if (errorCode === "DUPLICATE_ORDER") {
          // Parse the order from the error message (e.g., "Order 1 is already used in this world")
          const orderMatch = errorMessage.match(/Order (\d+)/);
          const duplicateOrder = orderMatch ? parseInt(orderMatch[1]) : validatedData.order;

          // Get the selected world to show taken orders
          const selectedWorld = worlds.find((w) => w.id === validatedData.worldId);
          const takenOrders = selectedWorld?.stories
            ?.map((s) => s.order)
            .sort((a, b) => a - b)
            .join(", ") || `${duplicateOrder}`;

          // Show polished error toast with actionable feedback
          toast.error(
            `Order ${duplicateOrder} is already taken in "${selectedWorld?.name || "this world"}".`,
            {
              description: `Taken orders: ${takenOrders}. Please choose a different order number.`,
              duration: 5000,
            }
          );
        } else {
          toast.error("Failed to create story", {
            description: errorMessage,
            duration: 4000,
          });
        }
        return;
      }

      // Show success message with metadata
      const selectedWorld = worlds.find((w) => w.id === validatedData.worldId);
      toast.success("Story created successfully!", {
        description: `"${validatedData.title}" has been added to ${selectedWorld?.name || "the world"}.`,
        duration: 4000,
      });
      
      router.push("/admin-dashboard/stories");
    } catch (error) {
      console.error("Story creation error:", error);
      if (error instanceof Error) {
        toast.error("Validation failed", {
          description: error.message,
          duration: 4000,
        });
      } else {
        toast.error("Failed to create story", {
          description: "An unexpected error occurred. Please try again.",
          duration: 4000,
        });
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
      mode="create"
    />
  );
}
