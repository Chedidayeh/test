"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { worldSchema, WorldFormData } from "../schemas/roadmapSchemas";
import { World, Roadmap } from "@shared/types";

interface WorldFormProps {
  world?: World;
  roadmaps: Roadmap[];
  onSubmit: (data: WorldFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function WorldForm({
  world,
  roadmaps,
  onSubmit,
  isLoading = false,
  onCancel,
}: WorldFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<WorldFormData>({
    resolver: zodResolver(worldSchema),
    defaultValues: world
      ? {
          roadmapId: world.roadmapId,
          name: world.name,
          description: world.description,
          imageUrl: world.imageUrl || "",
          order: world.order,
        }
      : {
          roadmapId: "",
          name: "",
          description: "",
          imageUrl: "",
          order: 1,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  onValueChange={field.onChange}
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
              className="mt-1"
            />
            {errors.order && (
              <span className="text-xs text-red-600 mt-1">
                {errors.order.message}
              </span>
            )}
          </div>
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
          {isLoading ? "Saving..." : world ? "Update World" : "Create World"}
        </Button>
      </div>
    </form>
  );
}
