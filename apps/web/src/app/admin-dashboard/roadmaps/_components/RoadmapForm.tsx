"use client";

import { useState, useMemo } from "react";
import {
  useForm,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { roadmapFormSchema, RoadmapFormData } from "../schemas/roadmapSchemas";
import { Roadmap, AgeGroup, Theme, ReadingLevel } from "@shared/types";

interface RoadmapFormProps {
  roadmap?: Roadmap & { ageGroup?: AgeGroup; theme?: Theme };
  ageGroups: AgeGroup[];
  themes: Theme[];
  allRoadmaps?: Roadmap[]; // For validation of unique theme assignment
  onSubmit: (data: RoadmapFormData) => void;
  isLoading?: boolean;
}

export function RoadmapForm({
  roadmap,
  ageGroups,
  themes,
  allRoadmaps = [],
  onSubmit,
  isLoading = false,
}: RoadmapFormProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues: roadmap
      ? {
          ageGroupId: roadmap.ageGroupId,
          themeId: roadmap.themeId,
          readingLevel: roadmap.readingLevel,
        }
      : {
          ageGroupId: "",
          themeId: "",
          readingLevel: ReadingLevel.BEGINNER,
        },
  });

  // Watch selected values for validation
  const selectedThemeId = watch("themeId");

  // Validate theme is not already assigned to another roadmap
  const isThemeAlreadyAssigned = useMemo(() => {
    if (!selectedThemeId) return false;
    return allRoadmaps.some(
      (r) =>
        r.themeId === selectedThemeId &&
        r.id !== roadmap?.id // Allow current roadmap to keep its theme
    );
  }, [selectedThemeId, allRoadmaps, roadmap?.id]);

  // Get themes that are not assigned to other roadmaps
  const availableThemes = useMemo(() => {
    return themes.filter(
      (t) =>
        !allRoadmaps.some(
          (r) =>
            r.themeId === t.id &&
            r.id !== roadmap?.id // Allow current roadmap to keep its theme
        )
    );
  }, [themes, allRoadmaps, roadmap?.id]);

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

    // Validate theme is not already assigned
    if (
      data.themeId &&
      allRoadmaps.some(
        (r) =>
          r.themeId === data.themeId &&
          r.id !== roadmap?.id
      )
    ) {
      newErrors.push("This theme is already assigned to another roadmap");
    }

    if (newErrors.length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors([]);
    onSubmit(data);
  };

  const readingLevels = Object.values(ReadingLevel);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Validation Errors</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectTrigger
                    className={`mt-1 ${
                      isThemeAlreadyAssigned ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableThemes.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">
                        No available themes (all are assigned to other roadmaps)
                      </div>
                    ) : (
                      availableThemes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {isThemeAlreadyAssigned && (
              <span className="text-xs text-red-600 mt-1">
                This theme is already assigned to another roadmap
              </span>
            )}
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
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}
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
        </div>

        {/* Theme Assignment Info */}
        {selectedThemeId && !isThemeAlreadyAssigned && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✓ Theme "{themes.find((t) => t.id === selectedThemeId)?.name}" is available for assignment
            </p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isThemeAlreadyAssigned}>
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
