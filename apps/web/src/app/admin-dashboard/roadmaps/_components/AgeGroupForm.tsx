"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import { ageGroupSchema, AgeGroupFormData } from "../schemas/roadmapSchemas";
import { AgeGroup } from "@shared/types";

interface AgeGroupFormProps {
  ageGroup?: AgeGroup;
  onSubmit: (data: AgeGroupFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function AgeGroupForm({
  ageGroup,
  onSubmit,
  isLoading = false,
  onCancel,
}: AgeGroupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgeGroupFormData>({
    resolver: zodResolver(ageGroupSchema),
    defaultValues: ageGroup
      ? {
          name: ageGroup.name,
          minAge: ageGroup.minAge,
          maxAge: ageGroup.maxAge,
        }
      : {
          name: "",
          minAge: 1,
          maxAge: 1,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="font-medium mb-4">Age Group Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Age Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., 6-7 years"
              {...register("name")}
              className="mt-1"
            />
            {errors.name && (
              <span className="text-xs text-red-600 mt-1">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAge">Minimum Age</Label>
              <Input
                id="minAge"
                type="number"
                min="1"
                {...register("minAge", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.minAge && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.minAge.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="maxAge">Maximum Age</Label>
              <Input
                id="maxAge"
                type="number"
                min="1"
                {...register("maxAge", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.maxAge && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.maxAge.message}
                </span>
              )}
            </div>
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
          {isLoading
            ? "Saving..."
            : ageGroup
              ? "Update Age Group"
              : "Create Age Group"}
        </Button>
      </div>
    </form>
  );
}
