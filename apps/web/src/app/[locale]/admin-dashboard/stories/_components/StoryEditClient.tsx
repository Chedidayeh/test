"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  CreateStoryWithChaptersInput,
  World,
  Story,
  AgeGroup,
  Roadmap,
} from "@readdly/shared-types";
import { StoryFormData, storyFormSchema } from "../_schema/storySchemas";
import { editStoryWithChaptersAction } from "@/src/lib/content-service/server-actions";
import {
  getSourceLanguageForMode,
  buildTranslations,
} from "@/src/lib/translation-utils";
import { NewStoryForm } from "./NewStoryForm";

interface StoryEditClientProps {
  ageGroups: AgeGroup[];
  roadmaps: Roadmap[];
  worlds: World[];
  story: Story;
}

export function StoryEditClient({ ageGroups, roadmaps, worlds, story }: StoryEditClientProps) {
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
        translationSource: validatedData.translationSource,
        translations:
          validatedData.translationSource !== "manual"
            ? [
                {
                  languageCode:
                    getSourceLanguageForMode(validatedData.translationSource) ||
                    "EN",
                  title: validatedData.title,
                  description: validatedData.description,
                },
              ]
            : buildTranslations(
                validatedData.translations,
                validatedData.translationSource,
              ),
        chapters: validatedData.chapters.map((chapter) => ({
          content: chapter.content,
          imageUrl: chapter.imageUrl || undefined,
          audioUrl: chapter.audioUrl || undefined,
          order: chapter.order,
          translations:
            validatedData.translationSource !== "manual"
              ? [
                  {
                    languageCode:
                      getSourceLanguageForMode(
                        validatedData.translationSource,
                      ) || "EN",
                    content: chapter.content,
                  },
                ]
              : buildTranslations(
                  chapter.translations,
                  validatedData.translationSource,
                ),
          ...(chapter.challenge && {
            challenge: {
              type: chapter.challenge.type,
              question: chapter.challenge.question,
              baseStars: chapter.challenge.baseStars,
              order: chapter.challenge.order,
              hints: chapter.challenge.hints || [],
              translations:
                validatedData.translationSource !== "manual"
                  ? [
                      {
                        languageCode:
                          getSourceLanguageForMode(
                            validatedData.translationSource,
                          ) || "EN",
                        question: chapter.challenge.question,
                        hints: chapter.challenge.hints,
                      },
                    ]
                  : buildTranslations(
                      chapter.challenge.translations,
                      validatedData.translationSource,
                    ),
              answers: chapter.challenge.answers.map((answer) => ({
                text: answer.text,
                isCorrect: answer.isCorrect,
                order: answer.order || 0,
                translations:
                  validatedData.translationSource !== "manual"
                    ? [
                        {
                          languageCode:
                            getSourceLanguageForMode(
                              validatedData.translationSource,
                            ) || "EN",
                          text: answer.text,
                        },
                      ]
                    : buildTranslations(
                        answer.translations,
                        validatedData.translationSource,
                      ),
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
      setIsLoading(false);

      console.error("Story edit error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to edit story");
      }
    }
  };

  return (
    <NewStoryForm
      ageGroups={ageGroups}
      roadmaps={roadmaps}
      worlds={worlds}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode="edit"
      initialData={story}
    />
  );
}
