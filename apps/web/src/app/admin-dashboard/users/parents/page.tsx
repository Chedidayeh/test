"use client";

import { useState } from "react";
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
import { DataTable, Column } from "../../_components/DataTable";
import { FilterBar } from "../../_components/FilterBar";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { mockParents, Parent } from "../../_data/mockData";

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>(mockParents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || parent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (deletingId) {
      setParents((prev) => prev.filter((p) => p.id !== deletingId));
      toast.success("Parent account deleted");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleDeactivate = (id: string) => {
    setParents((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "inactive" as const } : p
      )
    );
    toast.success("Parent account deactivated");
  };

  const columns: Column<Parent>[] = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{row.email}</p>
        </div>
      ),
      width: "35%",
      sortable: true,
    },
    {
      key: "childrenIds",
      label: "Children",
      render: (value) => (
        <span className="font-medium text-slate-900">{value.length}</span>
      ),
      width: "15%",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
      width: "15%",
      sortable: true,
    },
    {
      key: "joinedAt",
      label: "Joined",
      render: (value) => <span className="text-slate-900">{new Date(value).toLocaleDateString()}</span>,
      width: "20%",
      sortable: true,
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (value) => <span className="text-slate-600">{new Date(value).toLocaleDateString()}</span>,
      width: "15%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
        <p className="text-slate-600 mt-1">Manage parent accounts</p>
      </div>

      <FilterBar
        searchPlaceholder="Search by name or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
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

      <DataTable<Parent>
        columns={columns}
        data={filteredParents}
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
              {parent.status === "active" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleDeactivate(parent.id)}
                >
                  <span>Deactivate</span>
                </DropdownMenuItem>
              )}
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
