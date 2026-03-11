"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Map,
  Palette,
  Globe,
  Users,
  GripHorizontal,
} from "lucide-react";
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
import {
  RoadmapFormData,
  AgeGroupFormData,
  ThemeFormData,
  WorldFormData,
} from "./schemas/roadmapSchemas";
import { AgeGroup, Roadmap, World, Theme, ReadingLevel } from "@readdly/shared-types";
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
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  // Data state
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(initialRoadmaps);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(initialAgeGroups);
  const [worlds, setWorlds] = useState<World[]>(initialWorlds);
  const [themes, setThemes] = useState<Theme[]>(initialThemes);

  // Roadmap dialog state
  const [isCreateRoadmapDialogOpen, setIsCreateRoadmapDialogOpen] =
    useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [roadmapToDelete, setRoadmapToDelete] = useState<Roadmap | null>(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  // View roadmap details
  const [viewRoadmap, setViewRoadmap] = useState<Roadmap | null>(null);

  // Management dialog state
  const [isAgeGroupsDialogOpen, setIsAgeGroupsDialogOpen] = useState(false);
  const [isThemesDialogOpen, setIsThemesDialogOpen] = useState(false);
  const [isWorldsDialogOpen, setIsWorldsDialogOpen] = useState(false);

  /**
   * ============================================
   * AGE GROUP HANDLERS
   * ============================================
   */

  const handleCreateAgeGroup = async (
    data: AgeGroupFormData,
  ): Promise<boolean> => {
    try {
      const result = await createAgeGroupAction(data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setAgeGroups([...ageGroups, result.data]);
      router.refresh();
      return true;
    } catch (error) {
      toast.error("Failed to create age group");
      console.error(error);
      return false;
    }
  };

  const handleUpdateAgeGroup = async (
    id: string,
    data: AgeGroupFormData,
  ): Promise<boolean> => {
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
      router.refresh();

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
      router.refresh();
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
      router.refresh();
      return true;
    } catch (error) {
      toast.error("Failed to create theme");
      console.error(error);
      return false;
    }
  };

  const handleUpdateTheme = async (
    id: string,
    data: ThemeFormData,
  ): Promise<boolean> => {
    try {
      const result = await updateThemeAction(id, data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setThemes(themes.map((t) => (t.id === id ? result.data : t)));
      router.refresh();

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
      router.refresh();

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
      router.refresh();

      return true;
    } catch (error) {
      toast.error("Failed to create world");
      console.error(error);
      return false;
    }
  };

  const handleUpdateWorld = async (
    id: string,
    data: WorldFormData,
  ): Promise<boolean> => {
    try {
      const result = await updateWorldAction(id, data);
      if (!result.success) {
        toast.error(result.error);
        return false;
      }
      setWorlds(worlds.map((w) => (w.id === id ? result.data : w)));
      router.refresh();

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
      router.refresh();

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
      const result = await createRoadmapAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Add new roadmap with populated relationships
      const completeRoadmap: Roadmap = {
        ...result.data,
        ageGroup:
          ageGroups.find((ag) => ag.id === data.ageGroupId) || ({} as AgeGroup),
        theme: themes.find((t) => t.id === data.themeId) || ({} as Theme),
        worlds: [],
      };

      setRoadmaps([...roadmaps, completeRoadmap]);
      setIsCreateRoadmapDialogOpen(false);

      toast.success("Roadmap created successfully");
      router.refresh();
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  const handleUpdateRoadmap = async (data: RoadmapFormData) => {
    setIsRoadmapLoading(true);
    if (!editingRoadmap) return;

    try {
      const result = await updateRoadmapAction(editingRoadmap.id, data);
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
                ageGroup:
                  ageGroups.find((ag) => ag.id === data.ageGroupId) ||
                  r.ageGroup,
                theme: themes.find((t) => t.id === data.themeId) || r.theme,
              }
            : r,
        ),
      );

      setEditingRoadmap(null);
      setIsCreateRoadmapDialogOpen(false);
      toast.success("Roadmap updated successfully");
      router.refresh();
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
      router.refresh();
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-medium">Roadmaps Management</h1>
          <p className="text-slate-500 mt-1">
            Manage age groups, themes, worlds, and roadmaps
          </p>
        </div>
      </div>

      {/* Management Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
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
        <Button
          variant="outline"
          onClick={() => setIsCreateRoadmapDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Roadmap
        </Button>
      </div>

      {/* Age Groups with Roadmaps */}
      {ageGroups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...ageGroups]
            .sort((a, b) => a.minAge - b.minAge || a.maxAge - b.maxAge)
            .map((ageGroup) => {
            const ageGroupRoadmaps = roadmaps.filter(
              (r) => r.ageGroupId === ageGroup.id,
            );

            return (
              <div
                key={ageGroup.id}
                className="overflow-hidden border bg-card rounded-xl flex flex-col shadow-sm hover:shadow-md transition-all "
              >
                {/* Age Group Header */}
                <div className="px-6 py-3 border-b ">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-medium ">{ageGroup.name}</h2>
                    </div>
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-sm  font-medium transition-all ${
                        ageGroup.status === "ACTIVE"
                          ? "bg-green-100 text-green-500 ring-1 ring-green-200"
                          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                      }`}
                    >
                      {ageGroup.status === "ACTIVE" ? "● Active" : "○ Inactive"}
                    </span>
                  </div>
                  <p className=" text-slate-500 font-medium">
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
                        (w) => w.roadmapId === roadmap.id,
                      );

                      return (
                        <div
                          key={roadmap.id}
                          className="p-3 border  rounded-lg hover:border-primary hover:bg-primary/10 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {theme?.imageUrl && (
                                  <img
                                    src={theme.imageUrl}
                                    alt={theme.name}
                                    className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-200"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium  ">
                                    {roadmap.title ||
                                      theme?.name ||
                                      "Unknown Theme"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="inline-block px-2 py-0.5 text-sm rounded-full  font-medium bg-purple-100 text-purple-500">
                                      {roadmap.readingLevel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1.5 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                onClick={() => setViewRoadmap(roadmap)}
                                title="View roadmap"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-500 transition-colors"
                                onClick={() => setEditingRoadmap(roadmap)}
                                title="Edit roadmap"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-500 transition-colors"
                                onClick={() => setRoadmapToDelete(roadmap)}
                                title="Delete roadmap"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <span className=" text-slate-500 font-medium">
                            {roadmapWorlds.length} world
                            {roadmapWorlds.length !== 1 ? "s" : ""}
                          </span>
                          {/* Worlds List */}
                          {roadmapWorlds.length > 0 ? (
                            <div className="space-y-1.5  mt-3 pt-3 border-t ">
                              {roadmapWorlds.map((world) => (
                                <div
                                  key={world.id}
                                  className="flex items-center gap-2 text-slate-500 transition-colors"
                                >
                                  <span className="flex-1 font-medium">
                                    {world.name}
                                  </span>
                                  <span className="text-slate-400 ml-auto">
                                    {world.stories?.length || 0} stories
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className=" text-slate-400 italic pt-2 mt-2 border-t ">
                              No worlds yet
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div>
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Map className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500  mb-4 font-medium">
                        No roadmaps yet
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCreateRoadmapDialogOpen(true)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Create Roadmap
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border  bg-slate-50 p-12 text-center">
          <div className="w-16 h-16 rounded-full  border-2  flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium mb-4">
            No age groups available
          </p>
          <Button
            onClick={() => setIsAgeGroupsDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Age Group
          </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingRoadmap ? "Edit Roadmap" : "Create Roadmap"}
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500">
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
                    ageGroup:
                      ageGroups.find(
                        (ag) => ag.id === editingRoadmap.ageGroupId,
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
        <AlertDialogContent className="rounded-xl">
          <AlertDialogTitle className="text-xl">
            Delete Roadmap?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-500">
            Are you sure you want to delete this roadmap? This action cannot be
            undone and will remove all associated data.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="hover:bg-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                roadmapToDelete && handleDeleteRoadmap(roadmapToDelete)
              }
              className="bg-red-500 hover:bg-red-500 text-white"
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

      {/* View Roadmap Details Dialog */}
      <Dialog
        open={!!viewRoadmap}
        onOpenChange={(open) => !open && setViewRoadmap(null)}
      >
        <DialogContent className="max-w-xl overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Roadmap Details</DialogTitle>
            <DialogDescription className="text-base text-slate-500">
              Details for the selected roadmap
            </DialogDescription>
          </DialogHeader>

          {viewRoadmap && (
            <div className="space-y-4 py-2">
              <div>
                <h3 className="text-lg font-medium">{viewRoadmap.title}</h3>
                <p className="text-sm text-slate-500">
                  {viewRoadmap.ageGroup?.name || "No age group"} •{" "}
                  {viewRoadmap.readingLevel}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 mb-2">
                  Theme
                </h4>
                <div className="flex flex-col items-center gap-3">
                  {viewRoadmap.theme?.imageUrl && (
                    <img
                      src={viewRoadmap.theme.imageUrl}
                      alt={viewRoadmap.theme.name}
                      className="w-72 rounded-md object-cover ring-1 ring-slate-200"
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {viewRoadmap.theme?.name || "No theme"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {viewRoadmap.theme?.description}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-slate-500 mb-2">
                  Worlds
                </h4>
                {worlds.filter((w) => w.roadmapId === viewRoadmap.id).length >
                0 ? (
                  <div className="space-y-2">
                    {worlds
                      .filter((w) => w.roadmapId === viewRoadmap.id)
                      .map((w) => (
                        <div
                          key={w.id}
                          className="flex items-center justify-between"
                        >
                          <div className="font-medium">{w.name}</div>
                          <div className="text-sm text-slate-500">
                            {w.stories?.length || 0} stories
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic">
                    No worlds added to this roadmap yet.
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setViewRoadmap(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
