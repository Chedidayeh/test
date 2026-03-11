"use client";

import { useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
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
import { World, Roadmap } from "@readdly/shared-types";
import { WorldFormData } from "../schemas/roadmapSchemas";
import { toast } from "sonner";
import { WorldForm } from "./WorldForm";

interface WorldsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worlds: World[];
  roadmaps: Roadmap[];
  onWorldCreate: (data: WorldFormData) => Promise<boolean>;
  onWorldUpdate: (id: string, data: WorldFormData) => Promise<boolean>;
  onWorldDelete: (id: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function WorldsDialog({
  open,
  onOpenChange,
  worlds,
  roadmaps,
  onWorldCreate,
  onWorldUpdate,
  onWorldDelete,
  isLoading = false,
}: WorldsDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [view, setView] = useState<"list" | "create" | "edit">("list");

  const getRoadmapName = (roadmapId: string) => {
    const roadmap = roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return "Unknown";
    const ageGroupName = roadmap.ageGroup?.name || "Unknown Age Group";
    const title = roadmap.title || "";
    const themeName = roadmap.theme?.name || "Unknown Theme";
    return `${ageGroupName} - ${title} - ${themeName}`;
  };

  const handleCreate = async (data: WorldFormData) => {
    setIsFormLoading(true);
    try {
      const success = await onWorldCreate(data);
      if (success) {
        toast.success("World created");
        setView("list");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdate = async (data: WorldFormData) => {
    if (!editingId) return;
    setIsFormLoading(true);
    try {
      const success = await onWorldUpdate(editingId, data);
      if (success) {
        toast.success("World updated");
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
      const success = await onWorldDelete(deletingId);
      if (success) {
        toast.success("World deleted");
        setDeletingId(null);
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const editingWorld = editingId ? worlds.find((w) => w.id === editingId) : undefined;

  // Group worlds by roadmap
  const worldsByRoadmap = roadmaps.reduce(
    (acc, roadmap) => {
      const roadmapWorlds = worlds.filter((w) => w.roadmapId === roadmap.id);
      if (roadmapWorlds.length > 0) {
        acc.push({ roadmap, worlds: roadmapWorlds });
      }
      return acc;
    },
    [] as Array<{ roadmap: Roadmap; worlds: World[] }>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {view === "list" ? "Worlds" : view === "create" ? "Create World" : "Edit World"}
            </DialogTitle>
            <DialogDescription>
              {view === "list"
                ? "Manage worlds for your roadmaps"
                : view === "create"
                  ? "Create a new world"
                  : "Edit this world"}
            </DialogDescription>
          </DialogHeader>

          {view === "list" ? (
            <div className="space-y-4">
              <Button onClick={() => setView("create")} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Create World
              </Button>

              {worlds.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No worlds yet. Create one to get started.
                </p>
              ) : worldsByRoadmap.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No roadmaps available. Create a roadmap first.
                </p>
              ) : (
                <div className="space-y-6">
                  {worldsByRoadmap.map(({ roadmap, worlds: roadmapWorlds }) => (
                    <div key={roadmap.id}>
                      <h3 className="font-medium text-sm mb-2">
                        {getRoadmapName(roadmap.id)} Roadmap
                      </h3>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Order</TableHead>
                              <TableHead>Stories</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {roadmapWorlds.map((world) => (
                              <TableRow key={world.id}>
                                <TableCell className="font-medium">{world.name}</TableCell>
                                <TableCell>{world.order}</TableCell>
                                <TableCell>{world.stories?.length || 0}</TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingId(world.id);
                                      setView("edit");
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => setDeletingId(world.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : view === "create" ? (
            <WorldForm
              worlds={worlds}
              roadmaps={roadmaps}
              onSubmit={handleCreate}
              isLoading={isFormLoading}
              onCancel={() => setView("list")}
            />
          ) : (
            <WorldForm
              world={editingWorld}
              worlds={worlds}
              roadmaps={roadmaps}
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
            <AlertDialogTitle>Delete World?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the world and all associated stories. This action
              cannot be undone.
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
