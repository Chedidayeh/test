"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Eye, Trash2, Archive, Download } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";
import { DataTable, Column } from "../_components/DataTable";
import { FilterBar } from "../_components/FilterBar";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { mockStories, Story } from "../_data/mockData";

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Filter stories
  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || story.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (deletingId) {
      setStories((prev) => prev.filter((s) => s.id !== deletingId));
      toast.success("Story deleted successfully");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handlePublish = (id: string) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "published" as const, publishedAt: new Date() }
          : s
      )
    );
    toast.success("Story published successfully");
  };

  const handleArchive = (id: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "archived" as const } : s))
    );
    toast.success("Story archived successfully");
  };

  const columns: Column<Story>[] = [
    {
      key: "title",
      label: "Title",
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{row.author}</p>
        </div>
      ),
      width: "35%",
      sortable: true,
    },
    {
      key: "difficulty",
      label: "Difficulty",
      render: (value) => (
        <Badge
          variant={
            value === "Easy"
              ? "default"
              : value === "Medium"
                ? "secondary"
                : "destructive"
          }
        >
          {value}
        </Badge>
      ),
      width: "15%",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "published"
              ? "default"
              : value === "draft"
                ? "secondary"
                : "outline"
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
      width: "15%",
      sortable: true,
    },
    {
      key: "completionRate",
      label: "Completion Rate",
      render: (value) => (
        <div>
          <p className="font-medium text-slate-900">{value}%</p>
          <div className="w-16 h-1 bg-slate-200 rounded-full mt-1">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ),
      width: "15%",
    },
    {
      key: "riddleCount",
      label: "Riddles",
      render: (value) => <span className="font-medium">{value}</span>,
      width: "10%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stories</h1>
          <p className="text-slate-600 mt-1">
            Manage all stories and their associated riddles
          </p>
        </div>
        <Link href="/admin-dashboard/stories/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Story
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search by title or author..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" },
            ],
            onChange: setStatusFilter,
          },
        ]}
        isFiltered={statusFilter !== "all" || searchTerm !== ""}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("all");
        }}
      />

      {/* Table */}
      <DataTable<Story>
        columns={columns}
        data={filteredStories}
        actions={(story) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/admin-dashboard/stories/${story.id}`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                <span>Preview</span>
              </DropdownMenuItem>
              {story.status === "draft" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handlePublish(story.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span>Publish</span>
                </DropdownMenuItem>
              )}
              {story.status === "published" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleArchive(story.id)}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
              )}
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

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Story"
        description="This action cannot be undone. All associated riddles and data will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleDelete}
      />
    </div>
  );
}
