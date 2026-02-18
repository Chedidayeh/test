"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { RoadmapForm } from "./_components/RoadmapForm";
import { RoadmapFormData } from "./schemas/roadmapSchemas";
import { AgeGroup, Roadmap, World, Theme } from "@shared/types";



interface RoadmapsContentProps {
  roadmaps: Roadmap[];
  ageGroups: AgeGroup[];
  worlds: World[];
  themes: Theme[];
}

export function RoadmapsContent({
  roadmaps: initialRoadmaps,
  ageGroups,
  worlds: initialWorlds,
  themes,
}: RoadmapsContentProps) {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(initialRoadmaps);
  const [worlds, setWorlds] = useState<World[]>(initialWorlds);
  console.log("Initial Roadmaps:", initialRoadmaps);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [roadmapToDelete, setRoadmapToDelete] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleCreateRoadmap = (data: RoadmapFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      const newWorlds: World[] = data.worlds.map((w, idx) => ({
        id: w.id || `world-new-${Date.now()}-${idx}`,
        roadmapId: `roadmap-new-${Date.now()}`,
        name: w.name,
        description: w.description,
        imageUrl: w.imageUrl,
        order: w.order,
        locked: w.locked,
        requiredStarCount: w.requiredStarCount,
        createdAt: new Date(),
        updatedAt: new Date(),
        roadmap: {} as Roadmap,
        stories: [],
      }));

      const newRoadmap: Roadmap = {
        id: `roadmap-new-${Date.now()}`,
        ageGroupId: data.ageGroupId,
        themeId: data.themeId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ageGroup: ageGroups.find(ag => ag.id === data.ageGroupId) || ({} as AgeGroup),
        theme: themes.find(t => t.id === data.themeId) || ({} as Theme),
        worlds: newWorlds,
      };

      setRoadmaps([...roadmaps, newRoadmap]);
      setWorlds([...worlds, ...newWorlds]);
      setIsCreateDialogOpen(false);
      setIsLoading(false);
    }, 800);
  };

  const handleUpdateRoadmap = (data: RoadmapFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      if (!editingRoadmap) return;

      setRoadmaps(
        roadmaps.map((r) =>
          r.id === editingRoadmap.id
            ? {
                ...r,
                ageGroupId: data.ageGroupId,
                themeId: data.themeId,
                ageGroup: ageGroups.find(ag => ag.id === data.ageGroupId) || r.ageGroup,
                theme: themes.find(t => t.id === data.themeId) || r.theme,
              }
            : r
        )
      );

      // Update or add worlds
      const oldWorldIds = new Set(
        worlds
          .filter((w) => w.roadmapId === editingRoadmap.id)
          .map((w) => w.id)
      );
      const newWorldIds = new Set(data.worlds.map((w) => w.id || ""));
      const worldsToRemove = Array.from(oldWorldIds).filter(
        (id) => !newWorldIds.has(id)
      );

      const newWorlds = data.worlds
        .filter((w) => !w.id)
        .map((w, idx): World => ({
          id: `world-new-${Date.now()}-${idx}`,
          roadmapId: editingRoadmap.id,
          name: w.name,
          description: w.description,
          imageUrl: w.imageUrl,
          order: w.order,
          locked: w.locked,
          requiredStarCount: w.requiredStarCount,
          createdAt: new Date(),
          updatedAt: new Date(),
          roadmap: editingRoadmap,
          stories: [],
        }));

      setWorlds(
        worlds
          .filter((w) => !worldsToRemove.includes(w.id))
          .map((w) => {
            const updated = data.worlds.find((nw) => nw.id === w.id);
            return updated ? { ...w, name: updated.name, description: updated.description, imageUrl: updated.imageUrl, order: updated.order, locked: updated.locked, requiredStarCount: updated.requiredStarCount, updatedAt: new Date() } : w;
          })
          .concat(newWorlds)
      );

      setEditingRoadmap(null);
      setIsLoading(false);
    }, 800);
  };

  const handleDeleteRoadmap = (roadmap: Roadmap) => {
    setRoadmaps(roadmaps.filter((r) => r.id !== roadmap.id));
    setWorlds(worlds.filter((w) => w.roadmapId !== roadmap.id));
    setRoadmapToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roadmaps Management</h1>
          <p className="text-slate-500 mt-1">
            Manage age groups, themes, and worlds
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Roadmap
        </Button>
      </div>

      {/* Age Groups with Roadmaps */}
      {ageGroups.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {ageGroups.map((ageGroup) => {
            const ageGroupRoadmaps = roadmaps.filter(
              (r) => r.ageGroupId === ageGroup.id
            );

            return (
              <div
                key={ageGroup.id}
                className="overflow-hidden border rounded-2xl flex flex-col"
              >
                {/* Age Group Header */}
                <div className="bg-linear-to-r from-primary/10 to-primary/5 px-6 py-4 border-b">
                  <h2 className="text-xl font-bold text-primary">
                    {ageGroup.name}
                  </h2>
                  <p className=" text-slate-500 mt-2">
                    {ageGroupRoadmaps.length} roadmap
                    {ageGroupRoadmaps.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Roadmaps List */}
                {ageGroupRoadmaps.length > 0 ? (
                  <div className="flex-1 p-4 space-y-3">
                    {ageGroupRoadmaps.map((roadmap) => {
                      const theme = roadmap.theme;
                      const roadmapWorlds = worlds.filter(
                        (w) => w.roadmapId === roadmap.id
                      );

                      return (
                        <div key={roadmap.id} className="p-2 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-medium">
                                {theme?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {roadmapWorlds.length} world
                                {roadmapWorlds.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditingRoadmap(roadmap)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setRoadmapToDelete(roadmap)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Worlds List */}
                          {roadmapWorlds.length > 0 && (
                            <div className="space-y-2 text-sm">
                              {roadmapWorlds.map((world) => (
                                <div
                                  key={world.id}
                                  className="flex items-center gap-2 text-slate-500"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                                  <span className="flex-1">{world.name}</span>
                                  {world.locked && (
                                    <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded">
                                      Locked
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div>
                      <p className="text-slate-500 text-sm mb-3">
                        No roadmaps yet
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        Create one
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">No age groups available.</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingRoadmap}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingRoadmap(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoadmap ? "Edit Roadmap" : "Create Roadmap"}
            </DialogTitle>
            <DialogDescription>
              {editingRoadmap
                ? "Update the roadmap configuration and worlds"
                : "Create a new roadmap with age group, theme, and worlds"}
            </DialogDescription>
          </DialogHeader>

          <RoadmapForm
            roadmap={
              editingRoadmap
                ? {
                    ...editingRoadmap,
                    ageGroup: ageGroups.find(
                      (ag) => ag.id === editingRoadmap.ageGroupId
                    ) || editingRoadmap.ageGroup,
                    theme: editingRoadmap.theme,
                    worlds: worlds.filter((w) => w.roadmapId === editingRoadmap.id),
                  }
                : undefined
            }
            ageGroups={ageGroups}
            themes={themes}
            onSubmit={
              editingRoadmap ? handleUpdateRoadmap : handleCreateRoadmap
            }
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!roadmapToDelete}
        onOpenChange={(open) => !open && setRoadmapToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Roadmap?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the roadmap and all its worlds. This action cannot
            be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                roadmapToDelete && handleDeleteRoadmap(roadmapToDelete)
              }
              className="bg-red-500 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
