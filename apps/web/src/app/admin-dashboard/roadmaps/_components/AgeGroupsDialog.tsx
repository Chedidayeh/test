"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { AgeGroupForm } from "./AgeGroupForm";
import { AgeGroup, Roadmap } from "@shared/types";
import { AgeGroupFormData } from "../schemas/roadmapSchemas";
import { toast } from "sonner";

interface AgeGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ageGroups: AgeGroup[];
  roadmaps: Roadmap[];
  onAgeGroupCreate: (data: AgeGroupFormData) => Promise<boolean>;
  onAgeGroupUpdate: (id: string, data: AgeGroupFormData) => Promise<boolean>;
  onAgeGroupDelete: (id: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function AgeGroupsDialog({
  open,
  onOpenChange,
  ageGroups,
  roadmaps,
  onAgeGroupCreate,
  onAgeGroupUpdate,
  onAgeGroupDelete,
  isLoading = false,
}: AgeGroupsDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [view, setView] = useState<"list" | "create" | "edit">("list");

  const getAgeGroupRoadmapCount = (ageGroupId: string) => {
    return roadmaps.filter((r) => r.ageGroupId === ageGroupId).length;
  };

  const handleCreate = async (data: AgeGroupFormData) => {
    setIsFormLoading(true);
    try {
      const success = await onAgeGroupCreate(data);
      if (success) {
        toast.success("Age group created");
        setView("list");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdate = async (data: AgeGroupFormData) => {
    if (!editingId) return;
    setIsFormLoading(true);
    try {
      const success = await onAgeGroupUpdate(editingId, data);
      if (success) {
        toast.success("Age group updated");
        setView("list");
        setEditingId(null);
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsFormLoading(true);
    try {
      const success = await onAgeGroupDelete(deletingId);
      if (success) {
        toast.success("Age group deleted");
        setDeletingId(null);
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const editingAgeGroup = editingId
    ? ageGroups.find((ag) => ag.id === editingId)
    : undefined;

  const deletingAgeGroup = deletingId
    ? ageGroups.find((ag) => ag.id === deletingId)
    : undefined;

  const roadmapCount = deletingAgeGroup
    ? getAgeGroupRoadmapCount(deletingAgeGroup.id)
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {view === "list"
                ? "Age Groups"
                : view === "create"
                  ? "Create Age Group"
                  : "Edit Age Group"}
            </DialogTitle>
            <DialogDescription>
              {view === "list"
                ? "Manage age groups for your roadmaps"
                : view === "create"
                  ? "Create a new age group"
                  : "Edit this age group"}
            </DialogDescription>
          </DialogHeader>

          {view === "list" ? (
            <div className="space-y-4">
              <Button
                onClick={() => setView("create")}
                className="w-full sm:w-auto"
              >
                Create Age Group
              </Button>

              {ageGroups.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No age groups yet. Create one to get started.
                </p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age Range</TableHead>
                        <TableHead>Roadmaps</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ageGroups.map((ag) => (
                        <TableRow key={ag.id}>
                          <TableCell className="font-medium">{ag.name}</TableCell>
                          <TableCell>
                            {ag.minAge} - {ag.maxAge} years
                          </TableCell>
                          <TableCell>
                            {getAgeGroupRoadmapCount(ag.id)} roadmap(s)
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(ag.id);
                                setView("edit");
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => setDeletingId(ag.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : view === "create" ? (
            <AgeGroupForm
              onSubmit={handleCreate}
              isLoading={isFormLoading}
              onCancel={() => setView("list")}
            />
          ) : (
            <AgeGroupForm
              ageGroup={editingAgeGroup}
              onSubmit={handleUpdate}
              isLoading={isFormLoading}
              onCancel={() => {
                setView("list");
                setEditingId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Age Group?</AlertDialogTitle>
            <AlertDialogDescription>
              {roadmapCount > 0 ? (
                <>
                  This age group has {roadmapCount} roadmap(s) assigned to it.
                  Deleting it will remove all associated data. This action cannot
                  be undone.
                </>
              ) : (
                <>
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700"
              disabled={isFormLoading}
            >
              {isFormLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
