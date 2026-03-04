/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Edit2, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Column, DataTable, PaginationData } from "../../_components/DataTable";
import { FilterBar } from "../../_components/FilterBar";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { Chapter, Story } from "@shared/types";
import {
  fetchStoriesAction,
  deleteStoryAction,
} from "@/src/lib/content-service/server-actions";

interface StoriesContentProps {
  stories: Story[];
  pagination: PaginationData;
}

export function StoriesContent({
  stories: initialStories,
  pagination: initialPagination,
}: StoriesContentProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [pagination, setPagination] =
    useState<PaginationData>(initialPagination);
  const [searchTerm, setSearchTerm] = useState("");
  const [worldFilter, setWorldFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique worlds from stories
  const availableWorlds = useMemo(() => {
    const worlds = new Set<string>();
    stories.forEach((story) => {
      if (story.world?.name) {
        worlds.add(story.world.name);
      }
    });
    return Array.from(worlds).sort();
  }, [stories]);

  // Filter stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesSearch = story.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesWorld =
        worldFilter === "all" || story.world?.name === worldFilter;
      return matchesSearch && matchesWorld;
    });
  }, [stories, searchTerm, worldFilter]);

  const handleDelete = async () => {
    if (deletingId) {
      setIsLoading(true);
      try {
        const result = await deleteStoryAction(deletingId);

        if (result.success) {
          setStories((prev) => prev.filter((s) => s.id !== deletingId));
          toast.success("Story deleted successfully");
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        } else {
          toast.error(result.error || "Failed to delete story");
        }
      } catch (error) {
        toast.error("Failed to delete story");
        console.error("Error deleting story:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    try {
      const offset = (newPage - 1) * pagination.pageSize;
      const result = await fetchStoriesAction({
        limit: pagination.pageSize,
        offset,
      });

      if (result.success) {
        setStories(result.data.stories);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      } else {
        toast.error(result.error || "Failed to fetch stories");
      }
    } catch (error) {
      toast.error("Failed to fetch stories");
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Story>[] = [
    {
      key: "title",
      label: "Title",
      render: (value) => (
        <div>
          <p className="font-medium">{value}</p>
        </div>
      ),
      width: "40%",
      sortable: true,
    },
    {
      key: "difficulty",
      label: "Difficulty",
      render: (value) => (
        <Badge
          variant={
            value <= 2 ? "default" : value <= 3 ? "secondary" : "destructive"
          }
        >
          Level {value}
        </Badge>
      ),
      width: "15%",
    },
    {
      key: "chapters",
      label: "Chapters",
      render: (value: any) => (
        <span className="font-medium">{value?.length || 0}</span>
      ),
      width: "12%",
    },
    {
      key: "chapters",
      label: "Challenges",
      render: (value: any) => {
        const totalChallenges =
          value?.reduce(
            (acc: number, ch: Chapter) => acc + (ch.challenge ? 1 : 0),
            0,
          ) || 0;
        return <span className="font-medium">{totalChallenges}</span>;
      },
      width: "12%",
    },
    {
      key: "world",
      label: "World",
      render: (value) => {
        return (
          <div>
            <p className="font-medium">{value?.name || "Unknown"}</p>
          </div>
        );
      },
      width: "15%",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search by title..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "World",
            value: worldFilter,
            options: [
              { label: "All", value: "all" },
              ...availableWorlds.map((world) => ({
                label: world,
                value: world,
              })),
            ],
            onChange: setWorldFilter,
          },
        ]}
        isFiltered={searchTerm !== "" || worldFilter !== "all"}
        onClear={() => {
          setSearchTerm("");
          setWorldFilter("all");
        }}
      />

      {/* Stories Table */}
      {filteredStories.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-slate-500">
            {searchTerm || worldFilter !== "all"
              ? "No stories found matching your filters."
              : "No stories available, create one first."}
          </p>
        </div>
      ) : (
        <DataTable<Story>
          columns={columns}
          data={filteredStories}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          actions={(story) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  •••
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/story-preview-interface/${story.id}`} target="_blank">
                  <DropdownMenuItem className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Preview</span>
                  </DropdownMenuItem>
                </Link>
                <Link href={`/admin-dashboard/stories/edit/${story.id}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Edit2 className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => {
                    setDeletingId(story.id);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Story"
        description="This action cannot be undone. All associated chapters, challenges, and data will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
