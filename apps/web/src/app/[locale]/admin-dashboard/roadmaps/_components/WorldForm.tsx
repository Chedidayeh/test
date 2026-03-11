"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { worldSchema, WorldFormData } from "../schemas/roadmapSchemas";
import { World, Roadmap, TranslationSourceType, ManualTranslationEdit, LanguageCode } from "@readdly/shared-types";
import { getSourceLanguageLabel } from "@/src/lib/translation-utils";

interface WorldFormProps {
  world?: World;
  worlds?: World[];
  roadmaps: Roadmap[];
  onSubmit: (data: WorldFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function WorldForm({
  world,
  worlds = [],
  roadmaps,
  onSubmit,
  isLoading = false,
  onCancel,
}: WorldFormProps) {
  const [orderValidationError, setOrderValidationError] = useState<string>("");
  const [translationSource, setTranslationSource] = useState<TranslationSourceType>(TranslationSourceType.MANUAL);
  const [manualTranslations, setManualTranslations] = useState<ManualTranslationEdit[]>([
    { languageCode: LanguageCode.EN, name: "", description: "" },
    { languageCode: LanguageCode.FR, name: "", description: "" },
    { languageCode: LanguageCode.AR, name: "", description: "" },
  ]);

  // Initialize manual translations from existing data when editing
  const computedTranslations = useMemo(() => {
    if (world?.translations && world.translations.length > 0) {
      // Create a map of existing translations by language code
      const existingMap = new Map(
        world.translations.map((t) => [
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
  }, [world?.translations]);

  useEffect(() => {
    setManualTranslations(computedTranslations);
  }, [computedTranslations]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<WorldFormData>({
    resolver: zodResolver(worldSchema),
    defaultValues: world
      ? {
          roadmapId: world.roadmapId,
          name: world.name,
          description: world.description,
          imageUrl: world.imageUrl || "",
          order: world.order,
          translationSource: TranslationSourceType.MANUAL,
          translations: world.translations?.map((t) => ({ languageCode: t.languageCode.toUpperCase(), name: t.name, description: t.description ?? "" })) || [],
        }
      : {
          roadmapId: "",
          name: "",
          description: "",
          imageUrl: "",
          order: 1,
          translationSource: TranslationSourceType.MANUAL,
          translations: [],
        },
  });

  const roadmapId = watch("roadmapId");
  const orderValue = watch("order");

  // Get worlds for the selected roadmap
  const roadmapWorlds = roadmapId ? worlds.filter((w) => w.roadmapId === roadmapId) : [];

  // Calculate next available order for the selected roadmap
  const getNextAvailableOrder = (selectedRoadmapId: string) => {
    const selectedRoadmapWorlds = worlds.filter((w) => w.roadmapId === selectedRoadmapId);
    if (selectedRoadmapWorlds.length === 0) {
      return 1;
    }
    const maxOrder = Math.max(...selectedRoadmapWorlds.map((w) => w.order));
    return maxOrder + 1;
  };

  // Handle roadmap selection with auto-calculated order
  const handleRoadmapChange = (newRoadmapId: string) => {
    const nextOrder = getNextAvailableOrder(newRoadmapId);
    setValue("roadmapId", newRoadmapId);
    setValue("order", nextOrder);
    setOrderValidationError("");
  };

  const handleTranslationSourceChange = (value: string) => {
    setTranslationSource(value as TranslationSourceType);
  };

  const handleTranslationChange = (languageCode: string, field: string, value: string) => {
    setManualTranslations((prev) => prev.map((t) => (t.languageCode === languageCode ? { ...t, [field]: value } : t)));
  };

  // Validate order against existing worlds in selected roadmap on blur
  const handleOrderBlur = () => {
    if (!roadmapId) {
      setOrderValidationError("");
      return;
    }

    const isOrderTaken = roadmapWorlds.some((w) => w.order === orderValue);

    if (isOrderTaken) {
      const takenOrders = roadmapWorlds
        .map((w) => w.order)
        .sort((a, b) => a - b);
      setOrderValidationError(
        `Order ${orderValue} is already used in this roadmap. Taken orders: ${takenOrders.join(", ")}`
      );
    } else {
      setOrderValidationError("");
    }
  };


  // Memoize roadmap worlds for display
  const memoizedRoadmapWorlds = useMemo(
    () => roadmapWorlds,
    [roadmapId, worlds]
  );
    
  const handleFormSubmit = (data: WorldFormData) => {
    const updatedData = {
      ...data,
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
        <h3 className="font-medium mb-4">World Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="roadmapId">Roadmap</Label>
            <Controller
              control={control}
              name="roadmapId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={handleRoadmapChange}
                  disabled={!!world}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a roadmap" />
                  </SelectTrigger>
                  <SelectContent>
                    {roadmaps.map((roadmap) => (
                      <SelectItem key={roadmap.id} value={roadmap.id}>
                        {roadmap.theme?.name} - {roadmap.ageGroup?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.roadmapId && (
              <span className="text-xs text-red-600 mt-1">
                {errors.roadmapId.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="name">World Name</Label>
            <Input
              id="name"
              placeholder="e.g., Enchanted Forest"
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Brief description of the world"
              {...register("description")}
              className="mt-1"
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
              placeholder="/images/world-name.jpg"
              {...register("imageUrl")}
              className="mt-1"
            />
            {errors.imageUrl && (
              <span className="text-xs text-red-600 mt-1">
                {errors.imageUrl.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              min="1"
              {...register("order", { valueAsNumber: true })}
              onBlur={handleOrderBlur}
              disabled={!!world}
              className={`mt-1 ${
                world ? "bg-slate-100 cursor-not-allowed" : ""
              } ${
                orderValidationError && !world ? "border-red-500" : ""
              }`}
            />
            {world && (
              <p className="text-xs text-slate-500 mt-1">World order cannot be changed after creation</p>
            )}
            {orderValidationError && !world && (
              <span className="text-xs text-red-600 mt-1">
                {orderValidationError}
              </span>
            )}
            {errors.order && (
              <span className="text-xs text-red-600 mt-1">
                {errors.order.message}
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
                  <Label htmlFor={`translation-name-${translation.languageCode}`}>{translation.languageCode}</Label>
                  <Input
                    id={`translation-name-${translation.languageCode}`}
                    placeholder={`World name in ${translation.languageCode}`}
                    value={translation.name}
                    onChange={(e) => handleTranslationChange(translation.languageCode, "name", e.target.value)}
                    className="mt-1"
                  />
                  <Label htmlFor={`translation-desc-${translation.languageCode}`} className="mt-2">Description</Label>
                  <Textarea
                    id={`translation-desc-${translation.languageCode}`}
                    placeholder={`World description in ${translation.languageCode}`}
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
                The name/description in <strong>{translationSource === TranslationSourceType.EN_TO_FR_AR ? "English" : "French"}</strong> will be automatically translated to other languages by the system.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Existing Worlds Reference */}
      {roadmapId && (
        <ExistingWorldsReference
          worlds={memoizedRoadmapWorlds}
          roadmapId={roadmapId}
          currentOrder={orderValue}
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : world ? "Update World" : "Create World"}
        </Button>
      </div>
    </form>
  );
}

// Existing Worlds Reference Component
interface ExistingWorldsReferenceProps {
  worlds: World[];
  roadmapId: string;
  currentOrder: number;
}

function ExistingWorldsReference({
  worlds,
}: ExistingWorldsReferenceProps) {
  if (worlds.length === 0) {
    return (
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-medium mb-2 text-blue-900">Existing Worlds</h3>
        <p className="text-sm text-blue-700">
          No worlds in this roadmap yet. You can start with any order number.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-amber-200">
      <h3 className="font-medium mb-4 text-amber-500">Existing Worlds in this Roadmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-200">
              <th className="text-left font-medium text-amber-500 py-2 px-2">Order</th>
              <th className="text-left font-medium text-amber-500 py-2 px-2">Name</th>
              <th className="text-left font-medium text-amber-500 py-2 px-2">Stories</th>
            </tr>
          </thead>
          <tbody>
            {worlds.map((world) => (
              <tr
                key={world.id}
                className="border-b border-amber-100"
              >
                <td className="py-2 px-2 font-medium">{world.order}</td>
                <td className="py-2 px-2">{world.name}</td>
                <td className="py-2 px-2">{world.stories?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
