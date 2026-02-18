"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {roadmapFormSchema, RoadmapFormData} from "../schemas/roadmapSchemas";
import { Roadmap, AgeGroup, Theme, World } from "@shared/types";

interface RoadmapFormProps {
  roadmap?: Roadmap & { ageGroup?: AgeGroup; theme?: Theme; worlds?: World[] };
  ageGroups: AgeGroup[];
  themes: Theme[];
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
  const [expandedWorlds, setExpandedWorlds] = useState<Set<number>>(
    new Set([0])
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues: roadmap
      ? {
          ageGroupId: roadmap.ageGroupId,
          themeId: roadmap.themeId,
          worlds: roadmap.worlds || [],
        }
      : {
          ageGroupId: "",
          themeId: "",
          worlds: [
            {
              id: undefined,
              roadmapId: "",
              name: "",
              description: "",
              imageUrl: "",
              order: 1,
              locked: false,
              requiredStarCount: 0,
            },
          ],
        },
  });

  const {
    fields: worldFields,
    append: appendWorld,
    remove: removeWorld,
  } = useFieldArray({
    control,
    name: "worlds",
  });

  const toggleWorld = (index: number) => {
    const newExpanded = new Set(expandedWorlds);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedWorlds(newExpanded);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Roadmap Configuration */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Roadmap Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageGroupId">Age Group</Label>
            <Controller
              control={control}
              name="ageGroupId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((ag) => (
                      <SelectItem key={ag.id} value={ag.id}>
                        {ag.name}
                      </SelectItem>
                    ))}
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
            <Label htmlFor="themeId">Theme</Label>
            <Controller
              control={control}
              name="themeId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
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
        </div>
      </Card>

      {/* Worlds Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Worlds ({worldFields.length})</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newIndex = worldFields.length;
              appendWorld({
                id: undefined,
                roadmapId: "",
                name: "",
                description: "",
                imageUrl: "",
                order: newIndex + 1,
                locked: false,
                requiredStarCount: 0,
              });
              setExpandedWorlds(new Set([...expandedWorlds, newIndex]));
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add World
          </Button>
        </div>

        <div className="space-y-3">
          {worldFields.map((world, worldIndex) => (
            <WorldItem
              key={world.id}
              worldIndex={worldIndex}
              isExpanded={expandedWorlds.has(worldIndex)}
              onToggle={() => toggleWorld(worldIndex)}
              onRemove={() => worldFields.length > 1 && removeWorld(worldIndex)}
              register={register}
              errors={errors}
            />
          ))}
        </div>

        {errors.worlds && typeof errors.worlds === "object" && (
          <span className="text-xs text-red-600 mt-4">
            Worlds configuration error
          </span>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : roadmap ? "Update Roadmap" : "Create Roadmap"}
        </Button>
      </div>
    </form>
  );
}

// World Item Component
interface WorldItemProps {
  worldIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  register: UseFormRegister<RoadmapFormData>;
  errors: FieldErrors<RoadmapFormData>;
}

function WorldItem({
  worldIndex,
  isExpanded,
  onToggle,
  onRemove,
  register,
  errors,
}: WorldItemProps) {
  return (
    <div className="border rounded-lg">
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer flex items-center justify-between"
      >
        <div className="flex-1">
          <p className="font-medium">World {worldIndex + 1}</p>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-t">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={onRemove}
            >
              Remove World
            </Button>
          </div>

          <div>
            <Label className="text-sm">World Name</Label>
            <Input
              placeholder="e.g., Enchanted Forest"
              {...register(`worlds.${worldIndex}.name`)}
              className="mt-1"
            />
            {errors.worlds?.[worldIndex]?.name && (
              <span className="text-xs text-red-600 mt-1">
                {errors.worlds[worldIndex].name.message}
              </span>
            )}
          </div>

          <div>
            <Label className="text-sm">Description (Optional)</Label>
            <Input
              placeholder="Brief description of the world"
              {...register(`worlds.${worldIndex}.description`)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Image URL (Optional)</Label>
            <Input
              placeholder="/images/world-name.jpg"
              {...register(`worlds.${worldIndex}.imageUrl`)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Order</Label>
              <Input
                type="number"
                min="1"
                {...register(`worlds.${worldIndex}.order`, {
                  valueAsNumber: true,
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Locked</Label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register(`worlds.${worldIndex}.locked`)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-600">
                  Lock until stars earned
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm">Required Stars</Label>
              <Input
                type="number"
                min="0"
                {...register(`worlds.${worldIndex}.requiredStarCount`, {
                  valueAsNumber: true,
                })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
