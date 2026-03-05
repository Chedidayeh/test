"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CreateStoryWithChaptersInput, World, Story, TranslationSourceType, ManualTranslationEdit } from "@shared/types";
import { StoryForm } from "./StoryForm";
import { StoryFormData, storyFormSchema } from "../_schema/storySchemas";
import { editStoryWithChaptersAction } from "@/src/lib/content-service/server-actions";

interface StoryEditClientProps {
  worlds: World[];
  story: Story;
}

/**
 * Helper function to transform translations based on translation source
 * For MANUAL mode: includes all provided translations
 * For AUTO mode: builds translations from main fields (title/description/question/text)
 */
function buildTranslations(
  translations: ManualTranslationEdit[] | undefined,
  translationSource: TranslationSourceType,
  mainFieldValue?: string | { title?: string; description?: string; question?: string }
) {
  const sourceLanguage = getSourceLanguageForMode(translationSource);
  
  // For AUTO mode: build translation from main field value
  if (sourceLanguage && mainFieldValue) {
    if (typeof mainFieldValue === "string") {
      // For single text fields (question, answer text)
      return [{ languageCode: sourceLanguage.toUpperCase(), text: mainFieldValue }];
    } else {
      // For complex fields (story/chapter with title + description/content)
      return [{ languageCode: sourceLanguage.toUpperCase(), ...mainFieldValue }];
    }
  }
  
  if (!translations || translations.length === 0) return undefined;
  
  // If in auto-translate mode but no main field provided, filter provided translations to source language
  if (sourceLanguage) {
    return translations.filter((t) => t.languageCode === sourceLanguage.toUpperCase());
  }
  
  // In MANUAL mode, return all translations
  return translations;
}

function getSourceLanguageForMode(source: TranslationSourceType): string | null | undefined {
  switch (source) {
    case "en_to_fr_ar":
      return "en";
    case "fr_to_ar_en":
      return "fr";
    case "manual":
      return null; // All languages in manual mode
  }
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
        translationSource: validatedData.translationSource,
        translations: 
          validatedData.translationSource !== "manual"
            ? [{ languageCode: getSourceLanguageForMode(validatedData.translationSource)?.toUpperCase() || "EN", title: validatedData.title, description: validatedData.description }]
            : buildTranslations(validatedData.translations, validatedData.translationSource),
        chapters: validatedData.chapters.map((chapter) => ({
          title: chapter.title,
          content: chapter.content,
          imageUrl: chapter.imageUrl || undefined,
          audioUrl: chapter.audioUrl || undefined,
          order: chapter.order,
          translations:
            validatedData.translationSource !== "manual"
              ? [{ languageCode: getSourceLanguageForMode(validatedData.translationSource)?.toUpperCase() || "EN", title: chapter.title, content: chapter.content }]
              : buildTranslations(chapter.translations, validatedData.translationSource),
          ...(chapter.challenge && {
            challenge: {
              type: chapter.challenge.type,
              question: chapter.challenge.question,
              description: chapter.challenge.description || undefined,
              baseStars: chapter.challenge.baseStars,
              order: chapter.challenge.order,
              hints: chapter.challenge.hints || [],
              translations:
                validatedData.translationSource !== "manual"
                  ? [{ languageCode: getSourceLanguageForMode(validatedData.translationSource)?.toUpperCase() || "EN", question: chapter.challenge.question, description: chapter.challenge.description, hints: chapter.challenge.hints }]
                  : buildTranslations(chapter.challenge.translations, validatedData.translationSource),
              answers: chapter.challenge.answers.map((answer) => ({
                text: answer.text,
                isCorrect: answer.isCorrect,
                order: answer.order || 0,
                translations:
                  validatedData.translationSource !== "manual"
                    ? [{ languageCode: getSourceLanguageForMode(validatedData.translationSource)?.toUpperCase() || "EN", text: answer.text }]
                    : buildTranslations(answer.translations, validatedData.translationSource),
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
