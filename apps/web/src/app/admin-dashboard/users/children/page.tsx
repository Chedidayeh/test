"use client";

import { useState } from "react";
import { Edit2, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";
import { DataTable, Column } from "../../_components/DataTable";
import { FilterBar } from "../../_components/FilterBar";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { mockChildProfiles, ChildProfile } from "../../_data/mockData";

export default function ChildrenPage() {
  const [children, setChildren] = useState<ChildProfile[]>(mockChildProfiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredChildren = children.filter((child) => {
    const matchesSearch = child.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel =
      levelFilter === "all" || child.readingLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleDelete = () => {
    if (deletingId) {
      setChildren((prev) => prev.filter((c) => c.id !== deletingId));
      toast.success("Child profile deleted");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const columns: Column<ChildProfile>[] = [
    {
      key: "name",
      label: "Name",
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="text-2xl">👧</span>
          <span className="font-medium text-slate-900">{value}</span>
        </div>
      ),
      width: "20%",
      sortable: true,
    },
    {
      key: "age",
      label: "Age",
      render: (value) => <span className="text-slate-900">{value} years</span>,
      width: "10%",
    },
    {
      key: "readingLevel",
      label: "Reading Level",
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      ),
      width: "15%",
    },
    {
      key: "totalStoriesCompleted",
      label: "Stories Completed",
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
      width: "15%",
    },
    {
      key: "totalStarsEarned",
      label: "Stars Earned",
      render: (value) => <span className="font-medium text-yellow-600">{value}</span>,
      width: "15%",
    },
    {
      key: "currentStreak",
      label: "Current Streak",
      render: (value) => (
        <div className="flex items-center gap-1">
          <span className="text-xl">🔥</span>
          <span className="font-medium text-slate-900">{value}</span>
        </div>
      ),
      width: "15%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Children</h1>
        <p className="text-slate-600 mt-1">Manage child profiles and accounts</p>
      </div>

      <FilterBar
        searchPlaceholder="Search by name..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Reading Level",
            value: levelFilter,
            options: [
              { label: "All", value: "all" },
              { label: "Easy", value: "Easy" },
              { label: "Medium", value: "Medium" },
              { label: "Hard", value: "Hard" },
            ],
            onChange: setLevelFilter,
          },
        ]}
        isFiltered={levelFilter !== "all" || searchTerm !== ""}
        onClear={() => {
          setSearchTerm("");
          setLevelFilter("all");
        }}
      />

      <DataTable<ChildProfile>
        columns={columns}
        data={filteredChildren}
        actions={(child) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>View Progress</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={() => {
                  setDeletingId(child.id);
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Child Profile"
        description="This will remove the child profile and all associated progress data."
        confirmText="Delete"
        isDangerous
        onConfirm={handleDelete}
      />
    </div>
  );
}
