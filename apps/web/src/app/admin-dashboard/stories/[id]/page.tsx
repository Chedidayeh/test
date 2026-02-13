"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { StoryForm } from "../_components/StoryForm";
import { toast } from "sonner";
import Link from "next/link";
import { mockStories } from "../../_data/mockData";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ConfirmDialog } from "../../_components/ConfirmDialog";

export default function EditStoryPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const story = mockStories.find((s) => s.id === params.id);

  if (!story) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Story not found</p>
        <Link href="/admin-dashboard/stories">
          <Button variant="outline" className="mt-4">
            Back to Stories
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Story updated successfully");
      router.push("/admin-dashboard/stories");
    } catch (error) {
      toast.error("Failed to update story");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Story deleted successfully");
      router.push("/admin-dashboard/stories");
    } catch (error) {
      toast.error("Failed to delete story");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin-dashboard/stories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Story</h1>
            <p className="text-slate-600 mt-1">{story.title}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">More Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-red-600"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Story</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Story Info Card */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Status</p>
              <Badge
                variant={
                  story.status === "published"
                    ? "default"
                    : story.status === "draft"
                      ? "secondary"
                      : "outline"
                }
                className="mt-1"
              >
                {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
              </Badge>
            </div>
            <div className="border-l border-slate-300 pl-4">
              <p className="text-sm font-medium text-slate-600">Created</p>
              <p className="text-sm text-slate-900 mt-1">
                {story.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div className="border-l border-slate-300 pl-4">
              <p className="text-sm font-medium text-slate-600">Completion Rate</p>
              <p className="text-sm text-slate-900 mt-1">{story.completionRate}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <StoryForm story={story} onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Story"
        description="This action cannot be undone. All associated riddles and data will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
