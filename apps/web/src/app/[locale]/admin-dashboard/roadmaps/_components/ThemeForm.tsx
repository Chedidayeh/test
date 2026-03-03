"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { themeSchema, ThemeFormData } from "../schemas/roadmapSchemas";
import { Theme } from "@shared/types";

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
        }
      : {
          name: "",
          description: "",
          imageUrl: "",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              className="mt-1 min-h-[100px]"
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
