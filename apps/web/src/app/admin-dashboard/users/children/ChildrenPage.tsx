"use client";

import { useState, useMemo } from "react";
import { Edit2, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
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
import { ChildProfile, ProgressStatus } from "@shared/types";
import { fetchChildrenAction } from "@/src/lib/progress-service/server-actions";

/**
 * Helper function to calculate stories completed from progress
 * Counts unique stories that have COMPLETED status
 */
function getStoriesCompleted(profile: ChildProfile): number {
  return new Set(
    profile.progress
      .filter((p) => p.status === ProgressStatus.COMPLETED)
      .map((p) => p.storyId)
  ).size;
}

/**
 * Helper function to calculate current streak from session checkpoints
 * Counts consecutive days from today going backwards where child had at least one completed checkpoint
 */
function getCurrentStreak(profile: ChildProfile): number {
  if (profile.progress.length === 0) return 0;

  // Collect all completed checkpoints from all game sessions
  const allCheckpoints = profile.progress
    .flatMap((p) => p.gameSession?.checkpoints || [])
    .filter((checkpoint) => checkpoint.pausedAt !== null);

  if (allCheckpoints.length === 0) return 0;

  // Get unique dates from completed checkpoints
  const checkpointDates = new Set(
    allCheckpoints.map((checkpoint) => {
      const date = new Date(checkpoint.pausedAt!);
      return date.toISOString().split("T")[0]; // YYYY-MM-DD format
    })
  );

  // Sort dates in descending order
  const sortedDates = Array.from(checkpointDates).sort().reverse();

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if today has a checkpoint
  const todayString = currentDate.toISOString().split("T")[0];
  const checkingDate = new Date(currentDate);

  // If no checkpoint today, start from yesterday
  if (!checkpointDates.has(todayString)) {
    checkingDate.setDate(checkingDate.getDate() - 1);
  }

  // Count consecutive days
  for (const checkpointDate of sortedDates) {
    const checkingDateString = checkingDate.toISOString().split("T")[0];

    if (checkpointDate === checkingDateString) {
      streak++;
      checkingDate.setDate(checkingDate.getDate() - 1);
    } else if (new Date(checkpointDate) < checkingDate) {
      // Gap found, streak is broken
      break;
    }
  }

  return streak;
}


export default function ChildrenPage(
  {childrenData} : { childrenData: { children: ChildProfile[]; pagination: { total: number; page: number; pageSize: number; hasMore: boolean } } }
) {
  // Data state
  const [children, setChildren] = useState<ChildProfile[]>(childrenData.children);
  const [pagination, setPagination] = useState(childrenData.pagination);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique age groups from children
  const availableAgeGroups = useMemo(() => {
    const ageGroups = new Set<string>();
    children.forEach((profile) => {
      if (profile.child?.ageGroup) {
        ageGroups.add(profile.child.ageGroup);
      }
    });
    return Array.from(ageGroups).sort();
  }, [children]);

  const filteredChildren = children.filter((profile) => {
    const childName = profile.child?.name || "";
    const matchesSearch = childName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesAgeGroup =
      ageGroupFilter === "all" || profile.child?.ageGroup === ageGroupFilter;
    return matchesSearch && matchesAgeGroup;
  });

  const handleDelete = () => {
    if (deletingId) {
      setChildren((prev) => prev.filter((c) => c.id !== deletingId));
      toast.success("Child profile deleted");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    try {
      const offset = (newPage - 1) * pagination.pageSize;
      const result = await fetchChildrenAction({
        limit: pagination.pageSize,
        offset,
      });

      if (result.success) {
        setChildren(result.data.children);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      } else {
        toast.error(result.error || "Failed to fetch children");
      }
    } catch (error) {
      toast.error("Failed to fetch children");
      console.error("Error fetching children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<ChildProfile>[] = [
    {
      key: "child",
      label: "Name",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{row.child?.avatar || "👧"}</span>
          <span className="font-medium">{row.child?.name || "N/A"}</span>
        </div>
      ),
      width: "20%",
      sortable: true,
    },
    {
      key: "child",
      label: "Age Group",
      render: (_, row) => <span>{row.child?.ageGroup || "N/A"}</span>,
      width: "10%",
    },
    {
      key: "child",
      label: "Parent Name",
      render: (_, row) => <span>{row.child?.parent?.name || "N/A"}</span>,
      width: "15%",
    },
    {
      key: "child",
      label: "Parent Email",
      render: (_, row) => <span className="text-sm">{row.child?.parent?.email || "N/A"}</span>,
      width: "20%",
    },
    {
      key: "progress",
      label: "Stories Completed",
      render: (_, row) => (
        <span className="font-medium">{getStoriesCompleted(row)}</span>
      ),
      width: "15%",
    },
    {
      key: "totalStars",
      label: "Stars Earned",
      render: (value) => (
        <span className="font-medium text-yellow-600">{value || 0}</span>
      ),
      width: "15%",
    },
    {
      key: "progress",
      label: "Current Streak",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{getCurrentStreak(row)}</span>
        </div>
      ),
      width: "15%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Children</h1>
        <p className="text-slate-500 mt-1">
          Manage child profiles and accounts
        </p>
      </div>



      <FilterBar
        searchPlaceholder="Search by name..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Age Group",
            value: ageGroupFilter,
            options: [
              { label: "All", value: "all" },
              ...availableAgeGroups.map((ageGroup) => ({
                label: ageGroup,
                value: ageGroup,
              })),
            ],
            onChange: setAgeGroupFilter,
          },
        ]}
        isFiltered={searchTerm !== "" || ageGroupFilter !== "all"}
        onClear={() => {
          setSearchTerm("");
          setAgeGroupFilter("all");
        }}
      />

      {/* Loading State */}
      {filteredChildren.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">
            {children.length === 0
              ? "No children found. Create a child profile to get started."
              : "No children match your filters."}
          </p>
        </div>
      ) : (
          <DataTable<ChildProfile>
            columns={columns}
            data={filteredChildren}
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
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
      )}

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
