"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Story } from "../../_data/mockData";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";

const storyFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  author: z.string().min(2, "Author name required"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  ageGroup: z.string(),
  readingLevel: z.string(),
});

type StoryFormData = z.infer<typeof storyFormSchema>;

interface StoryFormProps {
  story?: Story;
  onSubmit: (data: StoryFormData) => void;
  isLoading?: boolean;
}

export function StoryForm({
  story,
  onSubmit,
  isLoading = false,
}: StoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<StoryFormData>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: story
      ? {
          title: story.title,
          description: story.description,
          author: story.author,
          content: story.content,
          category: story.category,
          difficulty: story.difficulty,
          ageGroup: story.ageGroup,
          readingLevel: story.readingLevel,
        }
      : {},
  });

  const difficulty = watch("difficulty");
  const ageGroup = watch("ageGroup");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Story Title</Label>
            <Input
              id="title"
              placeholder="Enter story title"
              {...register("title")}
              className="mt-1"
            />
            {errors.title && (
              <span className="text-xs text-red-600 mt-1">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the story"
              {...register("description")}
              className="mt-1 h-20"
            />
            {errors.description && (
              <span className="text-xs text-red-600 mt-1">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                {...register("author")}
                className="mt-1"
              />
              {errors.author && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.author.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Adventure, Fantasy"
                {...register("category")}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Story Content */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Story Content</h3>
        <div>
          <Label htmlFor="content">Story Text</Label>
          <Textarea
            id="content"
            placeholder="Write your story here..."
            {...register("content")}
            className="mt-1 h-48 font-mono text-sm"
          />
          {errors.content && (
            <span className="text-xs text-red-600 mt-1">
              {errors.content.message}
            </span>
          )}
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={(val) => setValue("difficulty", val as any)}>
              <SelectTrigger id="difficulty" className="mt-1">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ageGroup">Age Group</Label>
            <Select value={ageGroup} onValueChange={(val) => setValue("ageGroup", val)}>
              <SelectTrigger id="ageGroup" className="mt-1">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6-7">6-7 years</SelectItem>
                <SelectItem value="8-9">8-9 years</SelectItem>
                <SelectItem value="10-11">10-11 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="readingLevel">Reading Level</Label>
            <Select defaultValue={story?.readingLevel || ""} onValueChange={(val) => setValue("readingLevel", val)}>
              <SelectTrigger id="readingLevel" className="mt-1">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : story ? "Update Story" : "Create Story"}
        </Button>
      </div>
    </form>
  );
}
