"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
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
import { AgeGroupsDialog } from "./_components/AgeGroupsDialog";
import { ThemesDialog } from "./_components/ThemesDialog";
import { WorldsDialog } from "./_components/WorldsDialog";
import { RoadmapFormData, AgeGroupFormData, ThemeFormData, WorldFormData } from "./schemas/roadmapSchemas";
import { AgeGroup, Roadmap, World, Theme, ReadingLevel } from "@shared/types";
import {
  createAgeGroupAction,
  updateAgeGroupAction,
  deleteAgeGroupAction,
  createThemeAction,
  updateThemeAction,
  deleteThemeAction,
  createRoadmapAction,
  updateRoadmapAction,
  deleteRoadmapAction,
  createWorldAction,
  updateWorldAction,
  deleteWorldAction,
} from "@/src/lib/content-service/server-actions";
import { toast } from "sonner";



interface RoadmapsContentProps {
  roadmaps: Roadmap[];
  ageGroups: AgeGroup[];
  worlds: World[];
  themes: Theme[];
}

export function RoadmapsContent({
  roadmaps: initialRoadmaps,
  ageGroups: initialAgeGroups,
  worlds: initialWorlds,
  themes: initialThemes,
}: RoadmapsContentProps) {
  // Data state
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(initialRoadmaps);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(initialAgeGroups);
  const [worlds, setWorlds] = useState<World[]>(initialWorlds);
  const [themes, setThemes] = useState<Theme[]>(initialThemes);

  // Roadmap dialog state
  const [isCreateRoadmapDialogOpen, setIsCreateRoadmapDialogOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [roadmapToDelete, setRoadmapToDelete] = useState<Roadmap | null>(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);

  // Management dialog state
  const [isAgeGroupsDialogOpen, setIsAgeGroupsDialogOpen] = useState(false);
  const [isThemesDialogOpen, setIsThemesDialogOpen] = useState(false);
  const [isWorldsDialogOpen, setIsWorldsDialogOpen] = useState(false);

  /**
   * ============================================
   * AGE GROUP HANDLERS
   * ============================================
   */

  const handleCreateAgeGroup = async (data: AgeGroupFormData): Promise<boolean> => {
    try {
      const result = await createAgeGroupAction(data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setAgeGroups([...ageGroups, result.data]);
      return true;
    } catch (error) {
      toast.error("Failed to create age group");
      console.error(error);
      return false;
    }
  };

  const handleUpdateAgeGroup = async (id: string, data: AgeGroupFormData): Promise<boolean> => {
    try {
      const result = await updateAgeGroupAction(id, data);
      if (!result.success) {
        // Show detailed error message for incomplete content validation
        const errorMessage =
          result.error.includes("INCOMPLETE_CONTENT") ||
          result.error.includes("incomplete content") ||
          result.error.includes("Cannot activate")
            ? `${result.error}. Please add worlds, stories, and chapters to all roadmaps before activating.`
            : result.error;

        toast.error(errorMessage);
        return false;
      }
      setAgeGroups(ageGroups.map((ag) => (ag.id === id ? result.data : ag)));
      toast.success("Age group updated successfully");
      return true;
    } catch (error) {
      toast.error("Failed to update age group");
      console.error(error);
      return false;
    }
  };

  const handleDeleteAgeGroup = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteAgeGroupAction(id);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setAgeGroups(ageGroups.filter((ag) => ag.id !== id));
      setRoadmaps(roadmaps.filter((r) => r.ageGroupId !== id));
      return true;
    } catch (error) {
      toast.error("Failed to delete age group");
      console.error(error);
      return false;
    }
  };

  /**
   * ============================================
   * THEME HANDLERS
   * ============================================
   */

  const handleCreateTheme = async (data: ThemeFormData): Promise<boolean> => {
    try {
      const result = await createThemeAction(data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setThemes([...themes, result.data]);
      return true;
    } catch (error) {
      toast.error("Failed to create theme");
      console.error(error);
      return false;
    }
  };

  const handleUpdateTheme = async (id: string, data: ThemeFormData): Promise<boolean> => {
    try {
      const result = await updateThemeAction(id, data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setThemes(themes.map((t) => (t.id === id ? result.data : t)));
      return true;
    } catch (error) {
      toast.error("Failed to update theme");
      console.error(error);
      return false;
    }
  };

  const handleDeleteTheme = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteThemeAction(id);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setThemes(themes.filter((t) => t.id !== id));
      setRoadmaps(roadmaps.filter((r) => r.themeId !== id));
      return true;
    } catch (error) {
      toast.error("Failed to delete theme");
      console.error(error);
      return false;
    }
  };

  /**
   * ============================================
   * WORLD HANDLERS
   * ============================================
   */

  const handleCreateWorld = async (data: WorldFormData): Promise<boolean> => {
    try {
      const result = await createWorldAction(data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setWorlds([...worlds, result.data]);
      return true;
    } catch (error) {
      toast.error("Failed to create world");
      console.error(error);
      return false;
    }
  };

  const handleUpdateWorld = async (id: string, data: WorldFormData): Promise<boolean> => {
    try {
      const result = await updateWorldAction(id, data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setWorlds(worlds.map((w) => (w.id === id ? result.data : w)));
      return true;
    } catch (error) {
      toast.error("Failed to update world");
      console.error(error);
      return false;
    }
  };

  const handleDeleteWorld = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteWorldAction(id);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setWorlds(worlds.filter((w) => w.id !== id));
      return true;
    } catch (error) {
      toast.error("Failed to delete world");
      console.error(error);
      return false;
    }
  };

  /**
   * ============================================
   * ROADMAP HANDLERS
   * ============================================
   */

  const handleCreateRoadmap = async (data: RoadmapFormData) => {
    setIsRoadmapLoading(true);
    try {
      const roadmapData = {
        ageGroupId: data.ageGroupId,
        themeId: data.themeId,
        readingLevel: data.readingLevel,
      };

      const result = await createRoadmapAction(roadmapData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Add new roadmap with populated relationships
      const completeRoadmap: Roadmap = {
        ...result.data,
        ageGroup: ageGroups.find((ag) => ag.id === data.ageGroupId) || ({} as AgeGroup),
        theme: themes.find((t) => t.id === data.themeId) || ({} as Theme),
        worlds: [],
      };

      setRoadmaps([...roadmaps, completeRoadmap]);
      setIsCreateRoadmapDialogOpen(false);
      toast.success("Roadmap created successfully");
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  const handleUpdateRoadmap = async (data: RoadmapFormData) => {
    setIsRoadmapLoading(true);
    if (!editingRoadmap) return;

    try {
      const roadmapData = {
        ageGroupId: data.ageGroupId,
        themeId: data.themeId,
        readingLevel: data.readingLevel,
      };

      const result = await updateRoadmapAction(editingRoadmap.id, roadmapData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Update roadmaps list
      setRoadmaps(
        roadmaps.map((r) =>
          r.id === editingRoadmap.id
            ? {
                ...r,
                ...result.data,
                ageGroup: ageGroups.find((ag) => ag.id === data.ageGroupId) || r.ageGroup,
                theme: themes.find((t) => t.id === data.themeId) || r.theme,
              }
            : r
        )
      );

      setEditingRoadmap(null);
      setIsCreateRoadmapDialogOpen(false);
      toast.success("Roadmap updated successfully");
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  const handleDeleteRoadmap = async (roadmap: Roadmap) => {
    setIsRoadmapLoading(true);
    try {
      const result = await deleteRoadmapAction(roadmap.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setRoadmaps(roadmaps.filter((r) => r.id !== roadmap.id));
      setRoadmapToDelete(null);
      toast.success("Roadmap deleted successfully");
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roadmaps Management</h1>
          <p className="text-slate-500 mt-1">
            Manage age groups, themes, worlds, and roadmaps
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAgeGroupsDialogOpen(true)}
            title="Manage age groups"
          >
            <Settings className="w-4 h-4 mr-2" /> Age Groups
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsThemesDialogOpen(true)}
            title="Manage themes"
          >
            <Settings className="w-4 h-4 mr-2" /> Themes
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsWorldsDialogOpen(true)}
            title="Manage worlds"
          >
            <Settings className="w-4 h-4 mr-2" /> Worlds
          </Button>
          <Button onClick={() => setIsCreateRoadmapDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Roadmap
          </Button>
        </div>
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
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-primary">
                      {ageGroup.name}
                    </h2>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        ageGroup.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {ageGroup.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
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
                               Roadmap: {theme?.name || "Unknown"}
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
                          {roadmapWorlds.length > 0 ? (
                            <div className="space-y-2 text-sm">
                              {roadmapWorlds.map((world) => (
                                <div
                                  key={world.id}
                                  className="flex items-center gap-2 text-slate-500"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                                  <span className="flex-1">{world.name}</span>
                                  <span className="text-xs text-slate-400">{world.stories?.length || 0} stories</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No worlds yet</p>
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
                        onClick={() => setIsCreateRoadmapDialogOpen(true)}
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

      {/* Create/Edit Roadmap Dialog */}
      <Dialog
        open={isCreateRoadmapDialogOpen || !!editingRoadmap}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateRoadmapDialogOpen(false);
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
                ? "Update the roadmap configuration (age group, theme, reading level)"
                : "Create a new roadmap with age group, theme, and reading level"}
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
                  }
                : undefined
            }
            ageGroups={ageGroups}
            themes={themes}
            allRoadmaps={roadmaps}
            onSubmit={
              editingRoadmap ? handleUpdateRoadmap : handleCreateRoadmap
            }
            isLoading={isRoadmapLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Roadmap Confirmation Dialog */}
      <AlertDialog
        open={!!roadmapToDelete}
        onOpenChange={(open) => !open && setRoadmapToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Roadmap?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the roadmap. This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                roadmapToDelete && handleDeleteRoadmap(roadmapToDelete)
              }
              className="bg-red-500 hover:bg-red-700"
              disabled={isRoadmapLoading}
            >
              {isRoadmapLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Age Groups Management Dialog */}
      <AgeGroupsDialog
        open={isAgeGroupsDialogOpen}
        onOpenChange={setIsAgeGroupsDialogOpen}
        ageGroups={ageGroups}
        roadmaps={roadmaps}
        onAgeGroupCreate={handleCreateAgeGroup}
        onAgeGroupUpdate={handleUpdateAgeGroup}
        onAgeGroupDelete={handleDeleteAgeGroup}
      />

      {/* Themes Management Dialog */}
      <ThemesDialog
        open={isThemesDialogOpen}
        onOpenChange={setIsThemesDialogOpen}
        themes={themes}
        roadmaps={roadmaps}
        onThemeCreate={handleCreateTheme}
        onThemeUpdate={handleUpdateTheme}
        onThemeDelete={handleDeleteTheme}
      />

      {/* Worlds Management Dialog */}
      <WorldsDialog
        open={isWorldsDialogOpen}
        onOpenChange={setIsWorldsDialogOpen}
        worlds={worlds}
        roadmaps={roadmaps}
        onWorldCreate={handleCreateWorld}
        onWorldUpdate={handleUpdateWorld}
        onWorldDelete={handleDeleteWorld}
      />
    </div>
  );
}
