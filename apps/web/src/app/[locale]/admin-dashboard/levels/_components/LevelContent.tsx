/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Edit2, Trash2, Plus, Eye } from "lucide-react";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { toast } from "sonner";
import { Column, DataTable, PaginationData } from "../../_components/DataTable";
import { FilterBar } from "../../_components/FilterBar";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { Level, TranslationSourceType } from "@shared/types";
import {
  createLevelAction,
  updateLevelAction,
  deleteLevelAction,
} from "@/src/lib/content-service/server-actions";
import { useRouter } from "next/navigation";


interface LevelContentProps {
  levels: Level[];
}

interface EditingLevel {
  id: string;
  levelNumber: number;
  requiredStars: number;
  translationSource: TranslationSourceType;
  badge?: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
  };
}

interface ManualTranslationEdit {
  languageCode: string;
  name: string;
  description?: string;
}

interface NewLevelData {
  levelNumber: number;
  requiredStars: number;
  translationSource: TranslationSourceType;
  badge: {
    name: string;
    description?: string;
    iconUrl?: string;
  };
}

interface ValidationErrors {
  levelNumber?: string;
  requiredStars?: string;
  badgeName?: string;
  badgeDescription?: string;
  badgeIconUrl?: string;
}

// Validation schemas
const levelNumberSchema = z
  .number()
  .int("Level number must be an integer")
  .positive("Level number must be positive")
  .min(1, "Level number must be at least 1")
  .max(1000, "Level number cannot exceed 1000");

const requiredStarsSchema = z
  .number()
  .int("Required stars must be an integer")
  .nonnegative("Required stars cannot be negative")
  .max(10000, "Required stars cannot exceed 10000");

const badgeNameSchema = z
  .string()
  .trim()
  .min(1, "Badge name is required")
  .min(2, "Badge name must be at least 2 characters")
  .max(100, "Badge name cannot exceed 100 characters");

const badgeDescriptionSchema = z
  .string()
  .max(500, "Badge description cannot exceed 500 characters")
  .optional();

const badgeIconUrlSchema = z.string().optional();

// Helper functions
const getSourceLanguage = (source: TranslationSourceType): string => {
  switch (source) {
    case TranslationSourceType.EN_TO_FR_AR:
      return "en";
    case TranslationSourceType.FR_TO_AR_EN:
      return "fr";
    case TranslationSourceType.MANUAL:
      return "";
  }
};

const getSourceLanguageLabel = (source: TranslationSourceType): string => {
  switch (source) {
    case TranslationSourceType.EN_TO_FR_AR:
      return "English";
    case TranslationSourceType.FR_TO_AR_EN:
      return "French";
    case TranslationSourceType.MANUAL:
      return "Manual";
  }
};

const isAutoTranslateMode = (source: TranslationSourceType): boolean => {
  return source !== TranslationSourceType.MANUAL;
};

const getTargetLanguages = (source: TranslationSourceType): string[] => {
  switch (source) {
    case TranslationSourceType.EN_TO_FR_AR:
      return ["fr", "ar"];
    case TranslationSourceType.FR_TO_AR_EN:
      return ["ar", "en"];
    case TranslationSourceType.MANUAL:
      return [];
  }
};

export function LevelContent({ levels: initialLevels }: LevelContentProps) {
    const router = useRouter();
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EditingLevel | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<ValidationErrors>({});
  const [newLevelDialogOpen, setNewLevelDialogOpen] = useState(false);
  const [newLevelData, setNewLevelData] = useState<NewLevelData>({
    levelNumber: 1,
    requiredStars: 0,
    translationSource: TranslationSourceType.MANUAL,
    badge: {
      name: "",
      description: "",
      iconUrl: "",
    },
  });
  const [newLevelErrors, setNewLevelErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [viewingLevel, setViewingLevel] = useState<Level | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingTranslations, setEditingTranslations] = useState<ManualTranslationEdit[]>([]);
  const [newLevelTranslations, setNewLevelTranslations] = useState<ManualTranslationEdit[]>([
    { languageCode: "EN", name: "", description: "" },
    { languageCode: "FR", name: "", description: "" },
    { languageCode: "AR", name: "", description: "" },
  ]);

  // Filter levels
  const filteredLevels = useMemo(() => {
    return levels.filter((level) => {
      const matchesSearch =
        level.levelNumber.toString().includes(searchTerm) ||
        level.badge?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [levels, searchTerm]);

  // Validation functions
  const validateLevelData = (
    levelNumber: number,
    requiredStars: number,
    badgeName: string,
    badgeDescription: string | undefined,
    excludeLevelId?: string,
    translationSource: TranslationSourceType = TranslationSourceType.MANUAL,
  ): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Validate level number
    try {
      levelNumberSchema.parse(levelNumber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.levelNumber = error.issues[0]?.message || "Invalid level number";
      }
    }

    // Check for duplicate level number
    const levelExists = levels.some(
      (l) => l.levelNumber === levelNumber && l.id !== excludeLevelId,
    );
    if (levelExists) {
      errors.levelNumber = `Level number ${levelNumber} already exists`;
    }

    // Validate required stars
    try {
      requiredStarsSchema.parse(requiredStars);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.requiredStars =
          error.issues[0]?.message || "Invalid required stars";
      }
    }

    // Validate badge name based on translation source
    try {
      badgeNameSchema.parse(badgeName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldName = isAutoTranslateMode(translationSource) 
          ? `Badge name (${getSourceLanguageLabel(translationSource)})`
          : "Badge name";
        errors.badgeName = error.issues[0]?.message || `Invalid ${fieldName}`;
      }
    }

    // Validate badge description based on translation source (optional, but if provided, must be valid)
    try {
      badgeDescriptionSchema.parse(badgeDescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldName = isAutoTranslateMode(translationSource)
          ? `Badge description (${getSourceLanguageLabel(translationSource)})`
          : "Badge description";
        errors.badgeDescription =
          error.issues[0]?.message || `Invalid ${fieldName}`;
      }
    }

    // For manual mode, validate that translations exist if we're editing
    if (translationSource === TranslationSourceType.MANUAL && editingTranslations.length === 0 && editingLevel) {
      // We're editing but have no translations loaded
      // This is okay - user might add them later
    }

    return errors;
  };

  const handleEdit = (level: Level) => {
    // Load existing translations if available
    let translations: ManualTranslationEdit[] = [];
    if (level.badge?.translations && level.badge.translations.length > 0) {
      translations = level.badge.translations.map((t) => ({
        languageCode: t.languageCode,
        name: t.name,
        description: t.description,
      }));
    }

    // Determine translation source based on available translations
    let defaultTranslationSource = TranslationSourceType.MANUAL;
    
    // If there are translations, check if French exists (implies FR_TO_AR_EN mode)
    if (translations.length > 0) {
      const hasFrench = translations.some((t) => t.languageCode === "FR");
      const hasEnglish = translations.some((t) => t.languageCode === "EN");
      const hasArabic = translations.some((t) => t.languageCode === "AR");
      
      // If French and (Arabic or English) exist, might be FR_TO_AR_EN
      if (hasFrench && (hasArabic || hasEnglish) && !hasEnglish) {
        defaultTranslationSource = TranslationSourceType.FR_TO_AR_EN;
      } else if (hasEnglish && (hasFrench || hasArabic)) {
        defaultTranslationSource = TranslationSourceType.EN_TO_FR_AR;
      }
    }

    setEditingLevel({
      id: level.id,
      levelNumber: level.levelNumber,
      requiredStars: level.requiredStars,
      translationSource: defaultTranslationSource,
      badge: level.badge
        ? {
            id: level.badge.id,
            name: level.badge.name,
            description: level.badge.description,
            iconUrl: level.badge.iconUrl,
          }
        : undefined,
    });
    
    setEditingTranslations(translations);
    setEditErrors({});
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (levelId: string) => {
    setDeletingId(levelId);
    setDeleteConfirmOpen(true);
  };

  const handleView = (level: Level) => {
    setViewingLevel(level);
    setViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      setIsLoading(true);
      try {
        const result = await deleteLevelAction(deletingId);

        if (result.success) {
          setLevels((prev) => prev.filter((l) => l.id !== deletingId));
          toast.success("Level deleted successfully");
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        } else {
          toast.error(result.error || "Failed to delete level");
        }
      } catch (error) {
        toast.error("Failed to delete level");
        console.error("Error deleting level:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLevel) return;

    // Validate input
    const errors = validateLevelData(
      editingLevel.levelNumber,
      editingLevel.requiredStars,
      editingLevel.badge?.name || "",
      editingLevel.badge?.description,
      editingLevel.id,
      editingLevel.translationSource,
    );

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      toast.error("Please fix the errors before saving");
      return;
    }

    setEditErrors({});
    setIsLoading(true);
    try {
      // Prepare update payload
      const updatePayload: Partial<Omit<Level, "id" | "createdAt" | "updatedAt" | "badge">> & {
        badge?: {
          id: string;
          name: string;
          description?: string;
          iconUrl?: string;
        };
        translations?: Array<{
          languageCode: string;
          name: string;
          description?: string;
        }>;
      } = {
        levelNumber: editingLevel.levelNumber,
        requiredStars: editingLevel.requiredStars,
      };

      if (editingLevel.badge) {
        updatePayload.badge = {
          id: editingLevel.badge.id,
          name: editingLevel.badge.name,
          description: editingLevel.badge.description,
          iconUrl: editingLevel.badge.iconUrl,
        };
      }

      // Include translations only for manual mode
      if (editingLevel.translationSource === TranslationSourceType.MANUAL && editingTranslations.length > 0) {
        updatePayload.translations = editingTranslations;
      }

      // Update level with badge in one action
      const result = await updateLevelAction(
        editingLevel.id,
        updatePayload,
        isAutoTranslateMode(editingLevel.translationSource),
        editingLevel.translationSource,
      );

      if (!result.success) {
        toast.error(result.error || "Failed to update level");
        setIsLoading(false);
        return;
      }

      // Update local state
      setLevels((prev) =>
        prev.map((l) =>
          l.id === editingLevel.id
            ? {
                ...l,
                levelNumber: editingLevel.levelNumber,
                requiredStars: editingLevel.requiredStars,
                badge:
                  editingLevel.badge && l.badge
                    ? {
                        ...l.badge,
                        name: editingLevel.badge.name,
                        description: editingLevel.badge.description,
                        iconUrl: editingLevel.badge.iconUrl,
                      }
                    : l.badge,
              }
            : l,
        ),
      );

      toast.success("Level updated successfully");
      setEditDialogOpen(false);
      setEditingLevel(null);
      setEditingTranslations([]);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update level");
      console.error("Error updating level:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLevel = async () => {
    // Validate input
    const errors = validateLevelData(
      newLevelData.levelNumber,
      newLevelData.requiredStars,
      newLevelData.badge.name,
      newLevelData.badge.description,
      undefined,
      newLevelData.translationSource,
    );

    if (Object.keys(errors).length > 0) {
      setNewLevelErrors(errors);
      toast.error("Please fix the errors before creating");
      return;
    }

    // Validate that translations have at least names in manual mode
    if (newLevelData.translationSource === TranslationSourceType.MANUAL) {
      const hasValidTranslations = newLevelTranslations.some((t) => t.name.trim().length > 0);
      if (!hasValidTranslations) {
        toast.error("Please provide translations for at least one language in manual mode");
        return;
      }
    }

    setNewLevelErrors({});
    setIsLoading(true);
    try {
      // Filter translations to only include those with content in manual mode
      const translationsToInclude = newLevelData.translationSource === TranslationSourceType.MANUAL
        ? newLevelTranslations.filter((t) => t.name.trim().length > 0)
        : [];

      // Create level with badge in one action
      const result = await createLevelAction(
        {
          levelNumber: newLevelData.levelNumber,
          requiredStars: newLevelData.requiredStars,
          badge: {
            name: newLevelData.badge.name,
            description: newLevelData.badge.description || undefined,
            iconUrl: newLevelData.badge.iconUrl || undefined,
          },
        },
        isAutoTranslateMode(newLevelData.translationSource),
        newLevelData.translationSource,
        newLevelData.translationSource === TranslationSourceType.MANUAL ? translationsToInclude : undefined,
      );

      if (!result.success) {
        toast.error(result.error || "Failed to create level");
        setIsLoading(false);
        return;
      }

      // Update local state with the new level and badge
      const newLevel: Level = {
        id: result.data.id,
        levelNumber: newLevelData.levelNumber,
        requiredStars: newLevelData.requiredStars,
        badge: result.data.badge,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setLevels((prev) => [...prev, newLevel]);
      toast.success("Level and badge created successfully");
      setNewLevelDialogOpen(false);
      setNewLevelData({
        levelNumber: 1,
        requiredStars: 0,
        translationSource: TranslationSourceType.MANUAL,
        badge: {
          name: "",
          description: "",
          iconUrl: "",
        },
      });
      setNewLevelTranslations([
        { languageCode: "EN", name: "", description: "" },
        { languageCode: "FR", name: "", description: "" },
        { languageCode: "AR", name: "", description: "" },
      ]);
      router.refresh();
    } catch (error) {
      toast.error("Failed to create level");
      console.error("Error creating level:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Level>[] = [
    {
      key: "levelNumber",
      label: "Level",
      render: (value) => (
        <div>
          <p className="font-medium text-lg">Level {value}</p>
        </div>
      ),
      width: "15%",
      sortable: true,
    },
    {
      key: "requiredStars",
      label: "Required Stars",
      render: (value) => <span className="font-medium">{value} ⭐</span>,
      width: "20%",
    },
    {
      key: "badge",
      label: "Badge Name",
      render: (value: any) => {
        if (!value) return <span className="text-slate-500">No badge</span>;
        return (
          <div>
            <p className="font-medium">{value.name}</p>
          </div>
        );
      },
      width: "25%",
    },
    {
      key: "badge",
      label: "Badge Description",
      render: (value: any) => {
        if (!value) return <span className="text-slate-500">-</span>;
        return (
          <p className="text-sm text-slate-500">
            {value.description || "No description"}
          </p>
        );
      },
      width: "30%",
    },
    {
      key: "badge",
      label: "Icon",
      render: (value: any) => {
        if (!value?.iconUrl) {
          return <span className="text-slate-500">-</span>;
        }
        return (
          <img
            src={value.iconUrl}
            alt={value.name}
            className="h-10 w-10 rounded object-cover"
          />
        );
      },
      width: "10%",
    },
  ];

  const paginationData: PaginationData = {
    total: filteredLevels.length,
    page: 1,
    pageSize: filteredLevels.length,
    hasMore: false,
  };

  return (
    <div className="space-y-4">
      {/* Filters and Create Button */}
      <div className="flex items-center justify-between gap-2">
        <FilterBar
          searchPlaceholder="Search by level number or badge name..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          isFiltered={searchTerm !== ""}
          onClear={() => {
            setSearchTerm("");
          }}
        />
        <Button
          onClick={() => {
            setNewLevelDialogOpen(true);
            setNewLevelErrors({});
          }}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Level
        </Button>
      </div>

      {/* Levels Table */}
      {filteredLevels.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-slate-500">
            {searchTerm
              ? "No levels found matching your search."
              : "No levels available."}
          </p>
        </div>
      ) : (
        <DataTable<Level>
          columns={columns}
          data={filteredLevels}
          pagination={paginationData}
          isLoading={isLoading}
          actions={(level) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  •••
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleView(level)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleEdit(level)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer text-red-500"
                  onClick={() => handleDeleteClick(level.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      {/* Create Level Dialog */}
      <Dialog open={newLevelDialogOpen} onOpenChange={setNewLevelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Level</DialogTitle>
            <DialogDescription>
              Add a new level with its badge details. Click save when done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Level Information */}
            <div className="space-y-2 pb-4 border-b">
              <h3 className="font-semibold text-sm">Level Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="newLevelNumber">Level Number</Label>
                <Input
                  id="newLevelNumber"
                  type="number"
                  value={newLevelData.levelNumber}
                  onChange={(e) =>
                    setNewLevelData((prev) => ({
                      ...prev,
                      levelNumber: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  disabled={isLoading}
                  min="1"
                  className={newLevelErrors.levelNumber ? "border-red-500" : ""}
                />
                {newLevelErrors.levelNumber && (
                  <p className="text-sm text-red-500">
                    {newLevelErrors.levelNumber}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newRequiredStars">Required Stars</Label>
                <Input
                  id="newRequiredStars"
                  type="number"
                  value={newLevelData.requiredStars}
                  onChange={(e) =>
                    setNewLevelData((prev) => ({
                      ...prev,
                      requiredStars: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  disabled={isLoading}
                  min="0"
                  className={
                    newLevelErrors.requiredStars ? "border-red-500" : ""
                  }
                />
                {newLevelErrors.requiredStars && (
                  <p className="text-sm text-red-500">
                    {newLevelErrors.requiredStars}
                  </p>
                )}
              </div>
            </div>

            {/* Auto-Translate Option */}
            <div className="space-y-3 pb-4 border-b">
              <h3 className="font-semibold text-sm">Translation Settings</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                  <input
                    type="radio"
                    name="translationSource"
                    checked={newLevelData.translationSource === TranslationSourceType.EN_TO_FR_AR}
                    onChange={() =>
                      setNewLevelData((prev) => ({
                        ...prev,
                        translationSource: TranslationSourceType.EN_TO_FR_AR,
                      }))
                    }
                    disabled={isLoading}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium text-sm">Auto-translate from English</div>
                    <div className="text-xs text-slate-500">Create in English → auto-translate to French & Arabic</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                  <input
                    type="radio"
                    name="translationSource"
                    checked={newLevelData.translationSource === TranslationSourceType.FR_TO_AR_EN}
                    onChange={() =>
                      setNewLevelData((prev) => ({
                        ...prev,
                        translationSource: TranslationSourceType.FR_TO_AR_EN,
                      }))
                    }
                    disabled={isLoading}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium text-sm">Auto-translate from French</div>
                    <div className="text-xs text-slate-500">Create in French → auto-translate to Arabic & English</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                  <input
                    type="radio"
                    name="translationSource"
                    checked={newLevelData.translationSource === TranslationSourceType.MANUAL}
                    onChange={() =>
                      setNewLevelData((prev) => ({
                        ...prev,
                        translationSource: TranslationSourceType.MANUAL,
                      }))
                    }
                    disabled={isLoading}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-medium text-sm">Manual Translations</div>
                    <div className="text-xs text-slate-500">Enter content for all languages manually</div>
                  </div>
                </label>
              </div>
              {isAutoTranslateMode(newLevelData.translationSource) && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  ✓ Badge content will be auto-translated to {getTargetLanguages(newLevelData.translationSource).join(" and ")} using DeepL
                </p>
              )}
            </div>

            {/* Badge Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Badge Information</h3>
              
              {/* Auto-translate Mode: Show source language fields only */}
              {isAutoTranslateMode(newLevelData.translationSource) && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    {getSourceLanguageLabel(newLevelData.translationSource)} Content
                  </p>
                  <p className="text-xs text-blue-800">
                    Enter the badge content in {getSourceLanguageLabel(newLevelData.translationSource).toLowerCase()} and it will be automatically translated to {getTargetLanguages(newLevelData.translationSource).join(" and ")}
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="newBadgeName">
                  Badge Name * {isAutoTranslateMode(newLevelData.translationSource) && `(${getSourceLanguageLabel(newLevelData.translationSource)})`}
                </Label>
                <Input
                  id="newBadgeName"
                  type="text"
                  value={newLevelData.badge.name}
                  onChange={(e) =>
                    setNewLevelData((prev) => ({
                      ...prev,
                      badge: {
                        ...prev.badge,
                        name: e.target.value,
                      },
                    }))
                  }
                  disabled={isLoading}
                  placeholder="e.g., Story Explorer"
                  className={newLevelErrors.badgeName ? "border-red-500" : ""}
                />
                {newLevelErrors.badgeName && (
                  <p className="text-sm text-red-500">
                    {newLevelErrors.badgeName}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newBadgeDescription">
                  Badge Description {isAutoTranslateMode(newLevelData.translationSource) && `(${getSourceLanguageLabel(newLevelData.translationSource)})`}
                </Label>
                <Input
                  id="newBadgeDescription"
                  type="text"
                  value={newLevelData.badge.description || ""}
                  onChange={(e) =>
                    setNewLevelData((prev) => ({
                      ...prev,
                      badge: {
                        ...prev.badge,
                        description: e.target.value,
                      },
                    }))
                  }
                  disabled={isLoading}
                  placeholder="Enter badge description"
                  className={
                    newLevelErrors.badgeDescription ? "border-red-500" : ""
                  }
                />
                {newLevelErrors.badgeDescription && (
                  <p className="text-sm text-red-500">
                    {newLevelErrors.badgeDescription}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newBadgeIconUrl">Badge Icon URL</Label>
                <Input
                  id="newBadgeIconUrl"
                  type="text"
                  value={newLevelData.badge.iconUrl || ""}
                  onChange={(e) =>
                    setNewLevelData((prev) => ({
                      ...prev,
                      badge: {
                        ...prev.badge,
                        iconUrl: e.target.value,
                      },
                    }))
                  }
                  disabled={isLoading}
                  placeholder="https://example.com/badge.png"
                  className={
                    newLevelErrors.badgeIconUrl ? "border-red-500" : ""
                  }
                />
                {newLevelErrors.badgeIconUrl && (
                  <p className="text-sm text-red-500">
                    {newLevelErrors.badgeIconUrl}
                  </p>
                )}
              </div>
              {newLevelData.badge.iconUrl && (
                <div className="flex justify-center py-2">
                  <img
                    src={newLevelData.badge.iconUrl}
                    alt="Badge preview"
                    className="h-16 w-16 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/64?text=Invalid";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Manual Translation Editing - Show when in MANUAL mode */}
            {newLevelData.translationSource === TranslationSourceType.MANUAL && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Badge Translations</h3>
                <p className="text-xs text-slate-500">
                  Enter translations for each language
                </p>

                {/* English */}
                <div className="space-y-2 rounded-lg p-3 ">
                  <p className="font-medium text-sm">🇬🇧 English (EN)</p>
                  <div className="grid gap-2">
                    <Input
                      placeholder="English name"
                      value={newLevelTranslations.find((t) => t.languageCode === "EN")?.name || ""}
                      onChange={(e) =>
                        setNewLevelTranslations((prev) =>
                          prev.map((t) =>
                            t.languageCode === "EN"
                              ? { ...t, name: e.target.value }
                              : t
                          )
                        )
                      }
                      disabled={isLoading}
                      className="text-sm"
                    />
                    <Input
                      placeholder="English description"
                      value={newLevelTranslations.find((t) => t.languageCode === "EN")?.description || ""}
                      onChange={(e) =>
                        setNewLevelTranslations((prev) =>
                          prev.map((t) =>
                            t.languageCode === "EN"
                              ? { ...t, description: e.target.value }
                              : t
                          )
                        )
                      }
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* French */}
                <div className="space-y-2 rounded-lg p-3 ">
                  <p className="font-medium text-sm">🇫🇷 French (FR)</p>
                  <div className="grid gap-2">
                    <Input
                      placeholder="French name"
                      value={newLevelTranslations.find((t) => t.languageCode === "FR")?.name || ""}
                      onChange={(e) =>
                        setNewLevelTranslations((prev) =>
                          prev.map((t) =>
                            t.languageCode === "FR"
                              ? { ...t, name: e.target.value }
                              : t
                          )
                        )
                      }
                      disabled={isLoading}
                      className="text-sm"
                    />
                    <Input
                      placeholder="French description"
                      value={newLevelTranslations.find((t) => t.languageCode === "FR")?.description || ""}
                      onChange={(e) =>
                        setNewLevelTranslations((prev) =>
                          prev.map((t) =>
                            t.languageCode === "FR"
                              ? { ...t, description: e.target.value }
                              : t
                          )
                        )
                      }
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Arabic */}
                <div className="space-y-2 rounded-lg p-3 ">
                  <p className="font-medium text-sm">🇸🇦 Arabic (AR)</p>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Arabic name"
                      value={newLevelTranslations.find((t) => t.languageCode === "AR")?.name || ""}
                      onChange={(e) =>
                        setNewLevelTranslations((prev) =>
                          prev.map((t) =>
                            t.languageCode === "AR"
                              ? { ...t, name: e.target.value }
                              : t
                          )
                        )
                      }
                      disabled={isLoading}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Arabic description"
                      value={newLevelTranslations.find((t) => t.languageCode === "AR")?.description || ""}
                      onChange={(e) =>
                        setNewLevelTranslations((prev) =>
                          prev.map((t) =>
                            t.languageCode === "AR"
                              ? { ...t, description: e.target.value }
                              : t
                          )
                        )
                      }
                      disabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewLevelDialogOpen(false);
                setNewLevelData({
                  levelNumber: 1,
                  requiredStars: 0,
                  translationSource: TranslationSourceType.MANUAL,
                  badge: {
                    name: "",
                    description: "",
                    iconUrl: "",
                  },
                });
                setNewLevelTranslations([
                  { languageCode: "EN", name: "", description: "" },
                  { languageCode: "FR", name: "", description: "" },
                  { languageCode: "AR", name: "", description: "" },
                ]);
                setNewLevelErrors({});
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateLevel} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Level"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Level</DialogTitle>
            <DialogDescription>
              Update the level number, required stars, and badge details. Click
              save when done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Level Information */}
            <div className="space-y-2 pb-4 border-b">
              <h3 className="font-semibold text-sm">Level Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="levelNumber">Level Number</Label>
                <Input
                  id="levelNumber"
                  type="number"
                  value={editingLevel?.levelNumber ?? ""}
                  onChange={(e) =>
                    setEditingLevel((prev) =>
                      prev
                        ? {
                            ...prev,
                            levelNumber: parseInt(e.target.value, 10) || 0,
                          }
                        : null,
                    )
                  }
                  disabled={isLoading}
                  className={editErrors.levelNumber ? "border-red-500" : ""}
                />
                {editErrors.levelNumber && (
                  <p className="text-sm text-red-500">
                    {editErrors.levelNumber}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requiredStars">Required Stars</Label>
                <Input
                  id="requiredStars"
                  type="number"
                  value={editingLevel?.requiredStars ?? ""}
                  onChange={(e) =>
                    setEditingLevel((prev) =>
                      prev
                        ? {
                            ...prev,
                            requiredStars: parseInt(e.target.value, 10) || 0,
                          }
                        : null,
                    )
                  }
                  disabled={isLoading}
                  className={editErrors.requiredStars ? "border-red-500" : ""}
                />
                {editErrors.requiredStars && (
                  <p className="text-sm text-red-500">
                    {editErrors.requiredStars}
                  </p>
                )}
              </div>
            </div>

            {/* Auto-Translate Option */}
            {editingLevel && (
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold text-sm">Translation Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                    <input
                      type="radio"
                      name="editTranslationSource"
                      checked={editingLevel.translationSource === TranslationSourceType.EN_TO_FR_AR}
                      onChange={() =>
                        setEditingLevel((prev) =>
                          prev
                            ? {
                                ...prev,
                                translationSource: TranslationSourceType.EN_TO_FR_AR,
                              }
                            : null,
                        )
                      }
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-medium text-sm">Auto-translate from English</div>
                      <div className="text-xs text-slate-500">Update English → auto-translate to French & Arabic</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                    <input
                      type="radio"
                      name="editTranslationSource"
                      checked={editingLevel.translationSource === TranslationSourceType.FR_TO_AR_EN}
                      onChange={() =>
                        setEditingLevel((prev) =>
                          prev
                            ? {
                                ...prev,
                                translationSource: TranslationSourceType.FR_TO_AR_EN,
                              }
                            : null,
                        )
                      }
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-medium text-sm">Auto-translate from French</div>
                      <div className="text-xs text-slate-500">Update French → auto-translate to Arabic & English</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                    <input
                      type="radio"
                      name="editTranslationSource"
                      checked={editingLevel.translationSource === TranslationSourceType.MANUAL}
                      onChange={() =>
                        setEditingLevel((prev) =>
                          prev
                            ? {
                                ...prev,
                                translationSource: TranslationSourceType.MANUAL,
                              }
                            : null,
                        )
                      }
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-medium text-sm">Manual Translations</div>
                      <div className="text-xs text-slate-500">Edit translations for all languages manually</div>
                    </div>
                  </label>
                </div>
                {isAutoTranslateMode(editingLevel.translationSource) && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    ✓ Badge content will be auto-translated to {getTargetLanguages(editingLevel.translationSource).join(" and ")} using DeepL
                  </p>
                )}
              </div>
            )}

            {/* Badge Information */}
            {editingLevel?.badge && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Badge Information</h3>

                {/* Auto-translate Mode: Show source language fields only */}
                {isAutoTranslateMode(editingLevel.translationSource) && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      {getSourceLanguageLabel(editingLevel.translationSource)} Content
                    </p>
                    <p className="text-xs text-blue-800">
                      Update the badge content in {getSourceLanguageLabel(editingLevel.translationSource).toLowerCase()} and it will be automatically translated to {getTargetLanguages(editingLevel.translationSource).join(" and ")}
                    </p>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="badgeName">
                    Badge Name {isAutoTranslateMode(editingLevel.translationSource) && `(${getSourceLanguageLabel(editingLevel.translationSource)})`}
                  </Label>
                  <Input
                    id="badgeName"
                    type="text"
                    value={
                      isAutoTranslateMode(editingLevel.translationSource)
                        ? editingTranslations.find(
                            (t) => t.languageCode === getSourceLanguage(editingLevel.translationSource).toUpperCase()
                          )?.name ?? ""
                        : editingLevel.badge.name ?? ""
                    }
                    onChange={(e) => {
                      if (isAutoTranslateMode(editingLevel.translationSource)) {
                        const sourceLangCode = getSourceLanguage(editingLevel.translationSource).toUpperCase();
                        setEditingTranslations((prev) => {
                          const existing = prev.find((t) => t.languageCode === sourceLangCode);
                          if (existing) {
                            return prev.map((t) =>
                              t.languageCode === sourceLangCode
                                ? { ...t, name: e.target.value }
                                : t
                            );
                          } else {
                            return [...prev, { languageCode: sourceLangCode, name: e.target.value }];
                          }
                        });
                      } else {
                        setEditingLevel((prev) =>
                          prev && prev.badge
                            ? {
                                ...prev,
                                badge: {
                                  ...prev.badge,
                                  name: e.target.value,
                                },
                              }
                            : prev,
                        );
                      }
                    }}
                    disabled={isLoading}
                    placeholder="e.g., Story Explorer"
                    className={editErrors.badgeName ? "border-red-500" : ""}
                  />
                  {editErrors.badgeName && (
                    <p className="text-sm text-red-500">
                      {editErrors.badgeName}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="badgeDescription">
                    Badge Description {isAutoTranslateMode(editingLevel.translationSource) && `(${getSourceLanguageLabel(editingLevel.translationSource)})`}
                  </Label>
                  <Input
                    id="badgeDescription"
                    type="text"
                    value={
                      isAutoTranslateMode(editingLevel.translationSource)
                        ? editingTranslations.find(
                            (t) => t.languageCode === getSourceLanguage(editingLevel.translationSource).toUpperCase()
                          )?.description ?? ""
                        : editingLevel.badge.description ?? ""
                    }
                    onChange={(e) => {
                      if (isAutoTranslateMode(editingLevel.translationSource)) {
                        const sourceLangCode = getSourceLanguage(editingLevel.translationSource).toUpperCase();
                        setEditingTranslations((prev) => {
                          const existing = prev.find((t) => t.languageCode === sourceLangCode);
                          if (existing) {
                            return prev.map((t) =>
                              t.languageCode === sourceLangCode
                                ? { ...t, description: e.target.value }
                                : t
                            );
                          } else {
                            return [...prev, { languageCode: sourceLangCode, name: "", description: e.target.value }];
                          }
                        });
                      } else {
                        setEditingLevel((prev) =>
                          prev && prev.badge
                            ? {
                                ...prev,
                                badge: {
                                  ...prev.badge,
                                  description: e.target.value,
                                },
                              }
                            : prev,
                        );
                      }
                    }}
                    disabled={isLoading}
                    placeholder="Enter badge description"
                    className={
                      editErrors.badgeDescription ? "border-red-500" : ""
                    }
                  />
                  {editErrors.badgeDescription && (
                    <p className="text-sm text-red-500">
                      {editErrors.badgeDescription}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="badgeIconUrl">Badge Icon URL</Label>
                  <Input
                    id="badgeIconUrl"
                    type="text"
                    value={editingLevel.badge.iconUrl ?? ""}
                    onChange={(e) =>
                      setEditingLevel((prev) =>
                        prev && prev.badge
                          ? {
                              ...prev,
                              badge: {
                                ...prev.badge,
                                iconUrl: e.target.value,
                              },
                            }
                          : prev,
                      )
                    }
                    disabled={isLoading}
                    placeholder="https://example.com/badge.png"
                    className={editErrors.badgeIconUrl ? "border-red-500" : ""}
                  />
                  {editErrors.badgeIconUrl && (
                    <p className="text-sm text-red-500">
                      {editErrors.badgeIconUrl}
                    </p>
                  )}
                </div>
                {editingLevel.badge.iconUrl && (
                  <div className="flex justify-center py-2">
                    <img
                      src={editingLevel.badge.iconUrl}
                      alt="Badge preview"
                      className="h-16 w-16 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/64?text=Invalid";
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Manual Translation Editing - Show when in MANUAL mode and translations exist */}
            {editingLevel?.translationSource === TranslationSourceType.MANUAL &&
              editingTranslations.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm">
                    Badge Translations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edit translations for each language
                  </p>

                  {/* Arabic */}
                  {editingTranslations.find((t) => t.languageCode === "AR") && (
                    <div className="space-y-2 rounded-lg  p-3">
                      <p className="font-medium text-sm">🇸🇦 Arabic (AR)</p>
                      <div className="grid gap-2">
                        <Input
                          placeholder="Arabic name"
                          value={
                            editingTranslations.find(
                              (t) => t.languageCode === "AR"
                            )?.name || ""
                          }
                          onChange={(e) =>
                            setEditingTranslations((prev) =>
                              prev.map((t) =>
                                t.languageCode === "AR"
                                  ? { ...t, name: e.target.value }
                                  : t
                              )
                            )
                          }
                          disabled={isLoading}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Arabic description"
                          value={
                            editingTranslations.find(
                              (t) => t.languageCode === "AR"
                            )?.description || ""
                          }
                          onChange={(e) =>
                            setEditingTranslations((prev) =>
                              prev.map((t) =>
                                t.languageCode === "AR"
                                  ? { ...t, description: e.target.value }
                                  : t
                              )
                            )
                          }
                          disabled={isLoading}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* French */}
                  {editingTranslations.find((t) => t.languageCode === "FR") && (
                    <div className="space-y-2 rounded-lg  p-3">
                      <p className="font-medium text-sm">🇫🇷 French (FR)</p>
                      <div className="grid gap-2">
                        <Input
                          placeholder="French name"
                          value={
                            editingTranslations.find(
                              (t) => t.languageCode === "FR"
                            )?.name || ""
                          }
                          onChange={(e) =>
                            setEditingTranslations((prev) =>
                              prev.map((t) =>
                                t.languageCode === "FR"
                                  ? { ...t, name: e.target.value }
                                  : t
                              )
                            )
                          }
                          disabled={isLoading}
                          className="text-sm"
                        />
                        <Input
                          placeholder="French description"
                          value={
                            editingTranslations.find(
                              (t) => t.languageCode === "FR"
                            )?.description || ""
                          }
                          onChange={(e) =>
                            setEditingTranslations((prev) =>
                              prev.map((t) =>
                                t.languageCode === "FR"
                                  ? { ...t, description: e.target.value }
                                  : t
                              )
                            )
                          }
                          disabled={isLoading}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingLevel(null);
                setEditingTranslations([]);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Level Details</DialogTitle>
            <DialogDescription>
              View complete information about this level and its badge
            </DialogDescription>
          </DialogHeader>

          {viewingLevel && (
            <div className="space-y-6 py-4">
              {/* Level Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Level Information</h3>
                <div className="grid grid-cols-2 gap-4 rounded-lg  p-4">
                  <div>
                    <p className="text-xs text-slate-500">Level Number</p>
                    <p className="font-medium text-lg">
                      {viewingLevel.levelNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Required Stars</p>
                    <p className="font-medium text-lg">
                      {viewingLevel.requiredStars} ⭐
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="text-sm text-slate-500">
                      {new Date(viewingLevel.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Last Updated</p>
                    <p className="text-sm text-slate-500">
                      {new Date(viewingLevel.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge Information */}
              {viewingLevel.badge ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Badge Information</h3>
                  <div className="space-y-4 rounded-lg  p-4">
                    <div>
                      <p className="text-xs text-slate-500">Badge Name</p>
                      <p className="font-medium">{viewingLevel.badge.name}</p>
                    </div>
                    {viewingLevel.badge.description && (
                      <div>
                        <p className="text-xs text-slate-500">Description</p>
                        <p className="text-sm text-slate-500">
                          {viewingLevel.badge.description}
                        </p>
                      </div>
                    )}
                    {viewingLevel.badge.iconUrl && (
                      <div>
                        <p className="text-xs text-slate-500">Icon Preview</p>
                        <img
                          src={viewingLevel.badge.iconUrl}
                          alt={viewingLevel.badge.name}
                          className="h-24 w-24 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/96?text=Invalid";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Badge Translations */}
                  {viewingLevel.badge.translations &&
                    viewingLevel.badge.translations.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <h4 className="font-semibold text-sm">Translations</h4>
                        <div className="space-y-3">
                          {viewingLevel.badge.translations.map(
                            (translation) => (
                              <div
                                key={translation.id}
                                className="rounded-lg border p-3"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="font-medium text-sm">
                                    {translation.languageCode === "EN"
                                      ? "🇺🇸 English"
                                      : translation.languageCode === "AR"
                                        ? "🇸🇦 Arabic"
                                        : "🇫🇷 French"}
                                  </p>
                                  <span className="rounded  px-2 py-1 text-xs font-mono">
                                    {translation.languageCode}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Name</p>
                                  <p className="text-sm text-slate-500">
                                    {translation.name}
                                  </p>
                                </div>
                                {translation.description && (
                                  <div className="mt-2">
                                    <p className="text-xs text-slate-500">
                                      Description
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {translation.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-slate-500">
                    No badge assigned to this level
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Level"
        description="This action cannot be undone. The level and associated badge will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        isLoading={isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
