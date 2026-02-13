"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
import { mockRiddles, Riddle } from "../_data/mockData";

export default function RiddlesPage() {
  const [riddles, setRiddles] = useState<Riddle[]>(mockRiddles);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredRiddles = riddles.filter((riddle) => {
    const matchesSearch = riddle.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchedDifficulty =
      difficultyFilter === "all" || riddle.difficulty === difficultyFilter;
    return matchesSearch && matchedDifficulty;
  });

  const handleDelete = () => {
    if (deletingId) {
      setRiddles((prev) => prev.filter((r) => r.id !== deletingId));
      toast.success("Riddle deleted successfully");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const columns: Column<Riddle>[] = [
    {
      key: "question",
      label: "Question",
      render: (value) => (
        <p className="text-sm font-medium text-slate-900 line-clamp-2">
          {value}
        </p>
      ),
      width: "40%",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <Badge variant="secondary">
          {value === "text" ? "Text Input" : "Multiple Choice"}
        </Badge>
      ),
      width: "15%",
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
      sortable: true,
    },
    {
      key: "successRate",
      label: "Success Rate",
      render: (value) => (
        <span className="font-medium text-slate-900">{value}%</span>
      ),
      width: "15%",
      sortable: true,
    },
    {
      key: "totalAttempts",
      label: "Attempts",
      render: (value) => <span className="text-slate-900">{value}</span>,
      width: "10%",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riddles</h1>
          <p className="text-slate-600 mt-1">Manage all riddles across stories</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Riddle
        </Button>
      </div>

      <FilterBar
        searchPlaceholder="Search by question..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Difficulty",
            value: difficultyFilter,
            options: [
              { label: "All", value: "all" },
              { label: "Easy", value: "Easy" },
              { label: "Medium", value: "Medium" },
              { label: "Hard", value: "Hard" },
            ],
            onChange: setDifficultyFilter,
          },
        ]}
        isFiltered={difficultyFilter !== "all" || searchTerm !== ""}
        onClear={() => {
          setSearchTerm("");
          setDifficultyFilter("all");
        }}
      />

      <DataTable<Riddle>
        columns={columns}
        data={filteredRiddles}
        actions={(riddle) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={() => {
                  setDeletingId(riddle.id);
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
        title="Delete Riddle"
        description="This riddle will be removed from all stories."
        confirmText="Delete"
        isDangerous
        onConfirm={handleDelete}
      />
    </div>
  );
}
