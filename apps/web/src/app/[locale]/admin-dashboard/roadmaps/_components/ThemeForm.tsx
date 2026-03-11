"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { themeSchema, ThemeFormData } from "../schemas/roadmapSchemas";
import { Theme, TranslationSourceType, ManualTranslationEdit, LanguageCode } from "@readdly/shared-types";
import { getSourceLanguageLabel } from "@/src/lib/translation-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useState, useMemo, useEffect } from "react";

interface ThemeFormProps {
  theme?: Theme;
  onSubmit: (data: ThemeFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function ThemeForm({
  theme,
  onSubmit,
  isLoading = false,
  onCancel,
}: ThemeFormProps) {
  const [translationSource, setTranslationSource] = useState<TranslationSourceType>(
    TranslationSourceType.MANUAL,
  );
  const [manualTranslations, setManualTranslations] = useState<ManualTranslationEdit[]>([
    { languageCode: LanguageCode.EN, name: "", description: "" },
    { languageCode: LanguageCode.FR, name: "", description: "" },
    { languageCode: LanguageCode.AR, name: "", description: "" },
  ]);

  // Initialize manual translations from existing data when editing
  const computedTranslations = useMemo(() => {
    if (theme?.translations && theme.translations.length > 0) {
      // Create a map of existing translations by language code
      const existingMap = new Map(
        theme.translations.map((t) => [
          t.languageCode as LanguageCode,
          { name: t.name, description: t.description || "" },
        ])
      );

      // Merge with default structure to ensure all languages are present
      return [
        {
          languageCode: LanguageCode.EN,
          name: existingMap.get(LanguageCode.EN)?.name || "",
          description: existingMap.get(LanguageCode.EN)?.description || "",
        },
        {
          languageCode: LanguageCode.FR,
          name: existingMap.get(LanguageCode.FR)?.name || "",
          description: existingMap.get(LanguageCode.FR)?.description || "",
        },
        {
          languageCode: LanguageCode.AR,
          name: existingMap.get(LanguageCode.AR)?.name || "",
          description: existingMap.get(LanguageCode.AR)?.description || "",
        },
      ];
    }

    return [
      { languageCode: LanguageCode.EN, name: "", description: "" },
      { languageCode: LanguageCode.FR, name: "", description: "" },
      { languageCode: LanguageCode.AR, name: "", description: "" },
    ];
  }, [theme?.translations]);

  useEffect(() => {
    setManualTranslations(computedTranslations);
  }, [computedTranslations]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: theme
      ? {
          name: theme.name,
          description: theme.description,
          imageUrl: theme.imageUrl || "",
          translationSource: TranslationSourceType.MANUAL,
          translations:
            theme.translations?.map((t) => ({
              languageCode: t.languageCode.toUpperCase(),
              name: t.name,
              description: t.description || "",
            })) || [],
        }
      : {
          name: "",
          description: "",
          imageUrl: "",
          translationSource: TranslationSourceType.MANUAL,
          translations: [],
        },
  });

  const handleTranslationSourceChange = (value: string) => {
    setTranslationSource(value as TranslationSourceType);
  };

  const handleTranslationChange = (
    languageCode: string,
    field: string,
    value: string,
  ) => {
    setManualTranslations((prev) =>
      prev.map((t) => (t.languageCode === languageCode ? { ...t, [field]: value } : t)),
    );
  };

  const handleFormSubmit = (formData: ThemeFormData) => {
    const updatedData = {
      ...formData,
      translationSource,
      translations:
        translationSource === TranslationSourceType.MANUAL
          ? manualTranslations
              .filter((t) => t.name && t.name.trim() !== "" && t.description && t.description.trim() !== "")
              .map((t) => ({ languageCode: t.languageCode, name: t.name!, description: t.description! }))
          : [],
    };

    onSubmit(updatedData);
  };


  

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="font-medium mb-4">Theme Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Theme Name</Label>
            <Input
              id="name"
              placeholder="e.g., Adventure, Mystery, Fantasy"
              {...register("name")}
              className="mt-1"
            />
            {errors.name && (
              <span className="text-xs text-red-600 mt-1">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the theme..."
              {...register("description")}
              className="mt-1 min-h-25"
            />
            {errors.description && (
              <span className="text-xs text-red-600 mt-1">
                {errors.description.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="text"
              placeholder="https://example.com/image.jpg"
              {...register("imageUrl")}
              className="mt-1"
            />
            {errors.imageUrl && (
              <span className="text-xs text-red-600 mt-1">
                {errors.imageUrl.message}
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
            <Select value={translationSource} onValueChange={handleTranslationSourceChange}>
              <SelectTrigger id="translationSource" className="mt-1">
                <SelectValue placeholder="Select translation mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TranslationSourceType.MANUAL}>Manual Translations</SelectItem>
                <SelectItem value={TranslationSourceType.EN_TO_FR_AR}>Auto-translate from English</SelectItem>
                <SelectItem value={TranslationSourceType.FR_TO_AR_EN}>Auto-translate from French</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">{getSourceLanguageLabel(translationSource as TranslationSourceType)}</p>
          </div>

          {translationSource === TranslationSourceType.MANUAL ? (
            <div className="space-y-3 border-t pt-4">
              {manualTranslations.map((translation) => (
                <div key={translation.languageCode}>
                  <Label htmlFor={`translation-${translation.languageCode}`}>{translation.languageCode}</Label>
                  <Input
                    id={`translation-${translation.languageCode}`}
                    placeholder={`Theme name in ${translation.languageCode}`}
                    value={translation.name}
                    onChange={(e) => handleTranslationChange(translation.languageCode, "name", e.target.value)}
                    className="mt-1"
                  />
                  <Label htmlFor={`translation-desc-${translation.languageCode}`} className="mt-2">Description</Label>
                  <Textarea
                    id={`translation-desc-${translation.languageCode}`}
                    placeholder={`Theme description in ${translation.languageCode}`}
                    value={translation.description}
                    onChange={(e) => handleTranslationChange(translation.languageCode, "description", e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="border-t pt-4 rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                The title/description in <strong>{translationSource === TranslationSourceType.EN_TO_FR_AR ? "English" : "French"}</strong> will be automatically translated to other languages by the system.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : theme
              ? "Update Theme"
              : "Create Theme"}
        </Button>
      </div>
    </form>
  );
}
