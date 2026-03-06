"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { roadmapFormSchema, RoadmapFormData } from "../schemas/roadmapSchemas";
import {
  Roadmap,
  AgeGroup,
  Theme,
  ReadingLevel,
  TranslationSourceType,
  ManualTranslationEdit,
  LanguageCode,
} from "@shared/types";
import { getSourceLanguageLabel } from "@/src/lib/translation-utils";
import { getReadingLevelOptions } from "@/src/lib/reading-level-utils";

interface RoadmapFormProps {
  roadmap?: Roadmap & { ageGroup?: AgeGroup; theme?: Theme };
  ageGroups: AgeGroup[];
  themes: Theme[];
  allRoadmaps?: Roadmap[];
  onSubmit: (data: RoadmapFormData) => void;
  isLoading?: boolean;
}

export function RoadmapForm({
  roadmap,
  ageGroups,
  themes,
  onSubmit,
  isLoading = false,
}: RoadmapFormProps) {
  const t = useTranslations("RoadmapsLibrary.filterPanel");
  console.log("RoadmapForm render", { roadmap });
  const [translationSource, setTranslationSource] =
    useState<TranslationSourceType>(TranslationSourceType.MANUAL);
  const [manualTranslations, setManualTranslations] = useState<
    ManualTranslationEdit[]
  >([
    { languageCode: LanguageCode.EN, title: "" },
    { languageCode: LanguageCode.FR, title: "" },
    { languageCode: LanguageCode.AR, title: "" },
  ]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize manual translations from existing data when editing
  const computedTranslations = useMemo(() => {
    if (roadmap?.translations && roadmap.translations.length > 0) {
      // Create a map of existing translations by language code
      const existingMap = new Map(
        roadmap.translations.map((t) => [
          t.languageCode as LanguageCode,
          t.title,
        ])
      );

      // Merge with default structure to ensure all languages are present
      return [
        { languageCode: LanguageCode.EN, title: existingMap.get(LanguageCode.EN) || "" },
        { languageCode: LanguageCode.FR, title: existingMap.get(LanguageCode.FR) || "" },
        { languageCode: LanguageCode.AR, title: existingMap.get(LanguageCode.AR) || "" },
      ];
    }

    return [
      { languageCode: LanguageCode.EN, title: "" },
      { languageCode: LanguageCode.FR, title: "" },
      { languageCode: LanguageCode.AR, title: "" },
    ];
  }, [roadmap?.translations]);

  useEffect(() => {
    setManualTranslations(computedTranslations);
  }, [computedTranslations]);

  // Deduplicate themes by ID
  const uniqueThemes = useMemo(
    () =>
      Array.from(new Map(themes.map((theme) => [theme.id, theme])).values()),
    [themes],
  );

  const {
    handleSubmit,
    formState: { errors },
    control,

    register,
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues: roadmap
      ? {
          ageGroupId: roadmap.ageGroupId,
          themeId: roadmap.themeId,
          readingLevel: roadmap.readingLevel,
          title: roadmap.title || "",
          translationSource: TranslationSourceType.MANUAL,
           translations: roadmap.translations?.map((t) => ({
             languageCode: t.languageCode.toUpperCase(),
             title: t.title ?? "",
           })) || [],
        }
      : {
          ageGroupId: "",
          themeId: "",
          readingLevel: ReadingLevel.BEGINNER,
          title: "",
          translationSource: TranslationSourceType.MANUAL,
          translations: [],
        },
  });


  // Custom validation on submit
  const handleFormSubmit = (data: RoadmapFormData) => {
    const newErrors: string[] = [];

    // Validate age group selection
    if (!data.ageGroupId) {
      newErrors.push("Age group is required");
    }

    // Validate theme selection
    if (!data.themeId) {
      newErrors.push("Theme is required");
    }

    if (newErrors.length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors([]);
    const updatedData = {
      ...data,
      translationSource,
      translations:
        translationSource === TranslationSourceType.MANUAL
          ? manualTranslations
              .filter((t) => t.title && t.title.trim() !== "")
              .map((t) => ({ languageCode: t.languageCode, title: t.title! }))
          : [],
    };

    onSubmit(updatedData);
  };

  const handleTranslationSourceChange = (value: string) =>
    setTranslationSource(value as TranslationSourceType);

  const handleTranslationChange = (
    languageCode: string,
    field: string,
    value: string,
  ) => {
    setManualTranslations((prev) =>
      prev.map((t) =>
        t.languageCode === languageCode ? { ...t, [field]: value } : t,
      ),
    );
  };

  // Get reading level options with translated labels
  const readingLevels = getReadingLevelOptions(t);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">
                Validation Errors
              </h3>
              <ul className="space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-800">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Roadmap Configuration */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Roadmap Configuration</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="ageGroupId">Age Group *</Label>
            <Controller
              control={control}
              name="ageGroupId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">
                        No age groups available
                      </div>
                    ) : (
                      ageGroups.map((ag) => (
                        <SelectItem key={ag.id} value={ag.id}>
                          {ag.name} ({ag.minAge}-{ag.maxAge} years)
                        </SelectItem>
                      ))
                    )}
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
            <Label htmlFor="themeId">Theme *</Label>
            <Controller
              control={control}
              name="themeId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">
                        No themes available
                      </div>
                    ) : (
                      uniqueThemes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.themeId && (
              <span className="text-xs text-red-600 mt-1">
                {errors.themeId.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="readingLevel">Reading Level *</Label>
            <Controller
              control={control}
              name="readingLevel"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select reading level" />
                  </SelectTrigger>
                  <SelectContent>
                    {readingLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.readingLevel && (
              <span className="text-xs text-red-600 mt-1">
                {errors.readingLevel.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="title">Roadmap Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Adventure Frontier"
              {...register("title")}
              className="mt-1"
            />
            {errors.title && (
              <span className="text-xs text-red-600 mt-1">
                {errors.title.message}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Translation Section */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Translations</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="translationSource">Translation Mode</Label>
            <Select
              value={translationSource}
              onValueChange={handleTranslationSourceChange}
            >
              <SelectTrigger id="translationSource" className="mt-1">
                <SelectValue placeholder="Select translation mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TranslationSourceType.MANUAL}>
                  Manual Translations
                </SelectItem>
                <SelectItem value={TranslationSourceType.EN_TO_FR_AR}>
                  Auto-translate from English
                </SelectItem>
                <SelectItem value={TranslationSourceType.FR_TO_AR_EN}>
                  Auto-translate from French
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {getSourceLanguageLabel(
                translationSource as TranslationSourceType,
              )}
            </p>
          </div>

          {translationSource === TranslationSourceType.MANUAL ? (
            <div className="space-y-3 border-t pt-4">
              {manualTranslations.map((translation) => (
                <div key={translation.languageCode}>
                  <Label htmlFor={`translation-${translation.languageCode}`}>
                    {translation.languageCode}
                  </Label>
                  <Input
                    id={`translation-${translation.languageCode}`}
                    placeholder={`Roadmap title in ${translation.languageCode}`}
                    value={translation.title}
                    onChange={(e) =>
                      handleTranslationChange(
                        translation.languageCode,
                        "title",
                        e.target.value,
                      )
                    }
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="border-t pt-4 rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                The title in{" "}
                <strong>
                  {translationSource === TranslationSourceType.EN_TO_FR_AR
                    ? "English"
                    : "French"}
                </strong>{" "}
                will be automatically translated to other languages by the
                system.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : roadmap
              ? "Update Roadmap"
              : "Create Roadmap"}
        </Button>
      </div>
    </form>
  );
}
