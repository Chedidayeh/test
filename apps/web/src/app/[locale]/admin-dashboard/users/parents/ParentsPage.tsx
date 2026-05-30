"use client";

import { useState, useMemo } from "react";
import { Trash2, Eye, Users, Baby, CalendarDays, KeyRound } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";
import { User, Child } from "@readdly/shared-types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/src/components/ui/sheet";
import { DataTable, Column, PaginationData } from "../../_components/DataTable";
import { FilterBar } from "../../_components/FilterBar";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { fetchParentsAction } from "@/src/lib/auth-service/server-actions";
import Link from "next/link";
import Image from "next/image";

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
  const [selectedParent, setSelectedParent] = useState<User | null>(null);

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
              {parent.children && parent.children.length > 0 && (
                <Link
                  href={`/parent-dashboard?parentId=${parent.id}`}
                  target="_blank"
                >
                  <DropdownMenuItem className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setSelectedParent(parent)}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>View Children</span>
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

      <ChildrenSheet
        parent={selectedParent}
        open={!!selectedParent}
        onOpenChange={(open) => {
          if (!open) setSelectedParent(null);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChildrenSheet
// ---------------------------------------------------------------------------

interface ChildrenSheetProps {
  parent: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ChildrenSheet({ parent, open, onOpenChange }: ChildrenSheetProps) {
  const children: Child[] = (parent?.children as Child[]) ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Children of {parent?.name || parent?.email || "Parent"}
          </SheetTitle>
          <SheetDescription>
            {children.length === 0
              ? "This parent has no children yet."
              : `${children.length} child${children.length !== 1 ? "ren" : ""} registered`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <Baby className="w-10 h-10 opacity-40" />
              <p className="text-sm">No children registered for this parent.</p>
            </div>
          ) : (
            children.map((child) => (
              <div
                key={child.id}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                {/* Avatar + Name row */}
                <div className="flex items-center gap-3">
                  {child.avatar ? (
                    <Image
                      src={child.avatar}
                      alt={child.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{child.name}</p>
                    <Badge
                      variant="secondary"
                      className="text-xs capitalize mt-0.5"
                    >
                      {child.gender ?? "Unknown gender"}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  {/* <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">Login code:</span>
                    <code className="bg-slate-100 rounded px-1.5 py-0.5 font-mono tracking-wide">
                      {child.loginCode ?? "—"}
                    </code>
                  </div> */}
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">Joined:</span>
                    <span>{new Date(child.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
