"use client";

import { useState, useMemo } from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";
import { User } from "@shared/types";
import { DataTable, Column, PaginationData } from "../../_components/DataTable";
import { FilterBar } from "../../_components/FilterBar";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { fetchParentsAction } from "@/src/lib/auth-service/server-actions";

interface ParentsPageProps {
  initialData?: User[];
  initialPagination?: PaginationData;
}

export default function ParentsPage({
  initialData = [],
  initialPagination,
}: ParentsPageProps) {
  const [parents, setParents] = useState<User[]>(initialData);
  const [pagination, setPagination] = useState<PaginationData | undefined>(
    initialPagination,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter parents based on search term
  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const matchesSearch =
        (parent.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [parents, searchTerm]);

  const handleDelete = () => {
    if (deletingId) {
      setParents((prev) => prev.filter((p) => p.id !== deletingId));
      toast.success("Parent account deleted");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (!pagination) return;

    setIsLoading(true);
    try {
      const offset = (newPage - 1) * pagination.pageSize;
      const result = await fetchParentsAction({
        limit: pagination.pageSize,
        offset,
      });

      if (result.success && result.data) {
        setParents(result.data.parents);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      } else {
        toast.error(result.error || "Failed to fetch parents");
      }
    } catch (error) {
      toast.error("Failed to fetch parents");
      console.error("Error fetching parents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div>
          <p className="font-medium ">{value || "N/A"}</p>
          <p className="text-sm text-slate-500">{row.email}</p>
        </div>
      ),
      width: "35%",
      sortable: true,
    },
    {
      key: "children",
      label: "Children",
      render: (value) => (
        <span className="font-medium ">{(value || []).length}</span>
      ),
      width: "15%",
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge variant={value === "ADMIN" ? "default" : "secondary"}>
          {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
        </Badge>
      ),
      width: "15%",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (value) => (
        <span className="">{new Date(value).toLocaleDateString()}</span>
      ),
      width: "20%",
      sortable: true,
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      render: (value) => (
        <span className="text-slate-500">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
      width: "15%",
    },
  ];

  // Show empty state if no data
  if (parents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold ">Parents</h1>
          <p className="text-slate-500 mt-1">Manage parent accounts</p>
        </div>
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-slate-500">No parent accounts found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold ">Parents</h1>
        <p className="text-slate-500 mt-1">
          Manage parent accounts ({pagination?.total || parents.length})
        </p>
      </div>

      <FilterBar
        searchPlaceholder="Search by name or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[]}
        isFiltered={searchTerm !== ""}
        onClear={() => {
          setSearchTerm("");
        }}
      />

      <DataTable<User>
        columns={columns}
        data={filteredParents}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        actions={(parent) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={() => {
                  setDeletingId(parent.id);
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
        title="Delete Parent Account"
        description="This will remove the parent account and all associations with children."
        confirmText="Delete"
        isDangerous
        onConfirm={handleDelete}
      />
    </div>
  );
}
