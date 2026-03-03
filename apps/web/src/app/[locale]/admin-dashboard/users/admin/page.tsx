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
import { DataTable, Column } from "../../_components/DataTable";
import { FilterBar } from "../../_components/FilterBar";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { mockAdminUsers, AdminUser } from "../../_data/mockData";

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdminUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = () => {
    if (deletingId) {
      setAdmins((prev) => prev.filter((a) => a.id !== deletingId));
      toast.success("Admin user deleted");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Name",
      render: (value, row) => (
        <div>
          <p className="font-medium ">{value}</p>
          <p className="text-sm text-slate-500">{row.email}</p>
        </div>
      ),
      width: "35%",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge
          variant={
            value === "superadmin"
              ? "default"
              : value === "editor"
                ? "secondary"
                : "outline"
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
      width: "20%",
      sortable: true,
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
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => <span className="text-slate-500">{new Date(value).toLocaleDateString()}</span>,
      width: "15%",
      sortable: true,
    },
    {
      key: "lastActive",
      label: "Last Active",
      render: (value) => <span className="text-slate-500">{new Date(value).toLocaleDateString()}</span>,
      width: "15%",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold ">Admin Users</h1>
          <p className="text-slate-500 mt-1">Manage administrator accounts and permissions</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      <FilterBar
        searchPlaceholder="Search by name or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Role",
            value: roleFilter,
            options: [
              { label: "All", value: "all" },
              { label: "Superadmin", value: "superadmin" },
              { label: "Editor", value: "editor" },
              { label: "Reviewer", value: "reviewer" },
            ],
            onChange: setRoleFilter,
          },
        ]}
        isFiltered={roleFilter !== "all" || searchTerm !== ""}
        onClear={() => {
          setSearchTerm("");
          setRoleFilter("all");
        }}
      />

      <DataTable<AdminUser>
        columns={columns}
        data={filteredAdmins}
        actions={(admin) => (
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
                  setDeletingId(admin.id);
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
        title="Delete Admin Account"
        description="This will remove the admin account and revoke all permissions."
        confirmText="Delete"
        isDangerous
        onConfirm={handleDelete}
      />
    </div>
  );
}
