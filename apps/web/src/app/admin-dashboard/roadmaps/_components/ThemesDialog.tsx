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
import { ThemeForm } from "./ThemeForm";
import { Theme, Roadmap } from "@shared/types";
import { ThemeFormData } from "../schemas/roadmapSchemas";
import { toast } from "sonner";

interface ThemesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themes: Theme[];
  roadmaps: Roadmap[];
  onThemeCreate: (data: ThemeFormData) => Promise<boolean>;
  onThemeUpdate: (id: string, data: ThemeFormData) => Promise<boolean>;
  onThemeDelete: (id: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function ThemesDialog({
  open,
  onOpenChange,
  themes,
  roadmaps,
  onThemeCreate,
  onThemeUpdate,
  onThemeDelete,
  isLoading = false,
}: ThemesDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [view, setView] = useState<"list" | "create" | "edit">("list");

  // Deduplicate themes by ID to avoid showing the same theme multiple times
  const uniqueThemes = Array.from(
    new Map(themes.map((theme) => [theme.id, theme])).values()
  );

  const getThemeRoadmapCount = (themeId: string) => {
    return roadmaps.filter((r) => r.themeId === themeId).length;
  };

  const handleCreate = async (data: ThemeFormData) => {
    setIsFormLoading(true);
    try {
      const success = await onThemeCreate(data);
      if (success) {
        toast.success("Theme created");
        setView("list");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdate = async (data: ThemeFormData) => {
    if (!editingId) return;
    setIsFormLoading(true);
    try {
      const success = await onThemeUpdate(editingId, data);
      if (success) {
        toast.success("Theme updated");
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
      const success = await onThemeDelete(deletingId);
      if (success) {
        toast.success("Theme deleted");
        setDeletingId(null);
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const editingTheme = editingId
    ? themes.find((t) => t.id === editingId)
    : undefined;

  const deletingTheme = deletingId
    ? themes.find((t) => t.id === deletingId)
    : undefined;

  const roadmapCount = deletingTheme
    ? getThemeRoadmapCount(deletingTheme.id)
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {view === "list"
                ? "Themes"
                : view === "create"
                  ? "Create Theme"
                  : "Edit Theme"}
            </DialogTitle>
            <DialogDescription>
              {view === "list"
                ? "Manage themes for your roadmaps"
                : view === "create"
                  ? "Create a new theme"
                  : "Edit this theme"}
            </DialogDescription>
          </DialogHeader>

          {view === "list" ? (
            <div className="space-y-4">
              <Button
                onClick={() => setView("create")}
                className="w-full sm:w-auto"
              >
                Create Theme
              </Button>

              {themes.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No themes yet. Create one to get started.
                </p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Roadmaps</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueThemes.map((theme) => (
                        <TableRow key={theme.id}>
                          <TableCell className="font-medium">{theme.name}</TableCell>
                          <TableCell>
                            {getThemeRoadmapCount(theme.id)} roadmap(s)
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(theme.id);
                                setView("edit");
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => setDeletingId(theme.id)}
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
            <ThemeForm
              onSubmit={handleCreate}
              isLoading={isFormLoading}
              onCancel={() => setView("list")}
            />
          ) : (
            <ThemeForm
              theme={editingTheme}
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
            <AlertDialogTitle>Delete Theme?</AlertDialogTitle>
            <AlertDialogDescription>
              {roadmapCount > 0 ? (
                <>
                  This theme is assigned to {roadmapCount} roadmap(s). Deleting it
                  will affect all associated roadmaps. This action cannot be
                  undone.
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
