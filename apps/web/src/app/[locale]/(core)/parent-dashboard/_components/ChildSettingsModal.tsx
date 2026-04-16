"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X, AlertTriangle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useTranslations } from "next-intl";
import {
  AgeGroup,
  ChildProfile,
  LanguageCode,
  Theme,
} from "@readdly/shared-types";
import {
  deleteChildAction,
  updateNotificationSettingsAction,
  updateChildGeneralSettingsAction,
} from "@/src/lib/progress-service/server-actions";
import { useLocale } from "@/src/contexts/LocaleContext";
import { getLanguageCode } from "@/src/lib/translation-utils";

interface ChildSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChild: ChildProfile | undefined;
  notificationToggle: boolean | undefined;
  setNotificationToggle: (value: boolean) => void;
  ageGroups: AgeGroup[];
    handleChildAdded: () => void;
}

export default function ChildSettingsModal({
  isOpen,
  onClose,
  selectedChild,
  notificationToggle,
  setNotificationToggle,
  ageGroups,
  handleChildAdded,
}: ChildSettingsModalProps) {
  const t = useTranslations("ParentDashboard");
  const { isRTL, locale } = useLocale();
  const langCode = getLanguageCode(locale);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // General settings
  const [childName, setChildName] = useState(selectedChild?.name || "");
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState(
    selectedChild?.ageGroupId || "",
  );
  const [ageGroup, setAgeGroup] = useState(selectedChild!.ageGroupName);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(selectedChild?.sessionsPerWeek || 3);
  const [selectedThemes, setSelectedThemes] = useState<string[]>(
    selectedChild?.favoriteThemes || [],
  );
  const getThemesForAgeGroup = (ageGroupId: string): Theme[] => {
    const ag = ageGroups?.find((a) => a.id === ageGroupId);
    if (!ag) return [];
    const themes = ag.roadmaps!.map((roadmap) => roadmap.theme);
    return Array.from(
      new Map(themes.map((t) => [t!.id, t])).values(),
    ) as Theme[];
  };

  const availableThemes = selectedAgeGroupId
    ? getThemesForAgeGroup(selectedAgeGroupId)
    : [];

  const selectedAgeGroupData = ageGroups.find((ag) => ag.id === selectedAgeGroupId);

  const allocatedRoadmaps =
    selectedAgeGroupData?.roadmaps
      ?.filter((roadmap) => selectedThemes.includes(roadmap.themeId))
      .map((roadmap) => roadmap.id) || [];

  if (!isOpen || !selectedChild) return null;

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      if (!selectedChild?.id) {
        toast.error("Child ID not found");
        return;
      }

      const result = await updateNotificationSettingsAction(
        selectedChild.id,
        notificationToggle ?? false,
      );

      if (result.success) {
        setNotificationToggle(notificationToggle ?? false);
        toast.success(
          t("notificationSettings.savedSuccess") ||
            "Notification settings saved!",
        );
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save notification settings");
      }
    } catch (error) {
      toast.error("Failed to save notification settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      if (!selectedChild?.id) {
        toast.error("Child ID not found");
        return;
      }

      const result = await updateChildGeneralSettingsAction(
        selectedChild.id,
        childName,
        selectedAgeGroupId,
        selectedThemes,
        allocatedRoadmaps,
        sessionsPerWeek,
        ageGroup!,
      );

      if (result.success) {
        toast.success(
          t("childSettings.savedSuccess") ||
            "General settings saved successfully!",
        );
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save general settings");
      }
    } catch (error) {
      toast.error("Failed to save general settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChild = async () => {
    if (deleteConfirmText !== selectedChild.name) {
      toast.error("Child name does not match");
      return;
    }

    setIsDeleting(true);
    try {
      if (!selectedChild?.id) {
        toast.error("Child ID not found");
        return;
      }

      const result = await deleteChildAction(selectedChild.id);

      if (result.success) {
        toast.success(
          t("childSettings.deleteSuccess") ||
            "Child deleted successfully",
        );
        setShowDeleteConfirm(false);
        setDeleteConfirmText("");
        handleChildAdded()
        // Refresh the page to reload the children list
        setTimeout(() => {
          router.refresh();
          onClose();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to delete child");
      }
    } catch (error) {
      toast.error("Failed to delete child");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setNotificationToggle(selectedChild?.activateNotifications || false);
    setChildName(selectedChild?.name || "");
    setAgeGroup(selectedChild?.ageGroupName);
    setSelectedAgeGroupId(selectedChild?.ageGroupId || "");
    setSelectedThemes(selectedChild?.favoriteThemes || []);
    setSessionsPerWeek(selectedChild?.sessionsPerWeek || 3);
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-card rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-medium text-foreground">
            {t("childSettings.title") || "Child Settings"}
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs and Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="general">
                {t("childSettings.generalTab") || "General"}
              </TabsTrigger>
              <TabsTrigger value="notifications">
                {t("childSettings.notificationsTab") || "Notifications"}
              </TabsTrigger>
              <TabsTrigger value="deleteChild" className="text-red-600">
                {t("childSettings.deleteChildTab")}
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("childSettings.childName") || "Child Name"}
                </label>
                <Input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder={
                    t("childSettings.childNamePlaceholder") ||
                    "Enter child's name"
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  {t("childSettings.ageGroup") || "Age Group"}
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {ageGroups?.map((group) => {
                    const localizedageGroupName = (() => {
                      const translation = group.translations?.find(
                        (tr: { languageCode: LanguageCode }) =>
                          tr.languageCode === langCode,
                      );
                      return {
                        name: translation?.name || group.name,
                      };
                    })();
                    return (
                      <motion.button
                        key={group.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setAgeGroup(group.name);
                          setSelectedAgeGroupId(group.id);
                        }}
                        className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          ageGroup === group.name
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-primary/50"
                        }`}
                      >
                        <p
                          className={`font-medium text-center ${
                            ageGroup === group.name
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {localizedageGroupName.name}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  {t("childSettings.favoriteThemes") || "Favorite Themes"}
                </label>
                {availableThemes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {availableThemes.map((theme) => (
                      <motion.button
                        key={theme.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedThemes((prev) =>
                            prev.includes(theme.id)
                              ? prev.filter((id) => id !== theme.id)
                              : [...prev, theme.id],
                          );
                        }}
                        className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedThemes.includes(theme.id)
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-primary/50"
                        }`}
                      >
                        <p
                          className={`font-medium text-center text-sm ${
                            selectedThemes.includes(theme.id)
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {theme.name}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("childSettings.selectAgeGroupFirst") ||
                      "Please select an age group first"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  {t("childSettings.sessionsPerWeek") || "Sessions Per Week"}
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((sessions) => (
                    <motion.button
                      key={sessions}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSessionsPerWeek(sessions)}
                      className={`p-2 rounded-lg border-2 transition-all cursor-pointer font-medium text-sm ${
                        sessionsPerWeek === sessions
                          ? "border-primary bg-primary/10 shadow-md text-primary"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {sessions}
                    </motion.button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className=""
              >
                {isSaving
                  ? t("childSettings.saving") || "Saving..."
                  : t("childSettings.saveGeneral") || "Save Changes"}
              </Button>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                <div className="flex md:items-center flex-col md:flex-row md:justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {t("notificationSettings.enableReminders") ||
                        "Enable Reminders"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("notificationSettings.remindersDescription", {
                        childName: selectedChild?.name || "your child",
                      })}
                    </p>
                  </div>
                  <Switch
                    checked={notificationToggle}
                    onCheckedChange={setNotificationToggle}
                  />
                </div>
              </div>

              <div
                className={`p-4 rounded-lg text-sm ${
                  notificationToggle
                    ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {notificationToggle
                  ? `✓ ${t("notificationSettings.enabledStatus") || "Reminders are enabled"}`
                  : `✗ ${t("notificationSettings.disabledStatus") || "Reminders are disabled"}`}
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className=""
              >
                {isSaving
                  ? t("notificationSettings.saving") || "Saving..."
                  : t("notificationSettings.save") || "Save Changes"}
              </Button>
            </TabsContent>

            {/* Delete Child Tab */}
            <TabsContent value="deleteChild" className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {t("childSettings.dangerZone") || "Danger Zone"}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {t("childSettings.dangerZoneDescription") ||
                        "These actions cannot be undone. Please proceed with caution."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    {t("childSettings.deleteChildTitle") ||
                      "Delete Child Profile"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("childSettings.deleteChildDescription", {
                      childName: selectedChild?.name,
                    }) ||
                      `This will permanently delete ${selectedChild?.name}'s profile and all associated data.`}
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className=""
                  >
                    {t("childSettings.deleteChild") || "Delete Child Profile"}
                  </Button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-4 space-y-3"
                >
                  <p className="text-sm font-medium text-red-800 dark:text-red-100">
                    {t("childSettings.deleteConfirmation") ||
                      "Please type the child's name to confirm deletion"}
                  </p>
                  <Input
                    type="text"
                    placeholder={
                      t("childSettings.confirmPlaceholder") || "Type child name"
                    }
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950"
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      className="flex-1"
                      disabled={isDeleting}
                    >
                      {t("childSettings.cancel") || "Cancel"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteChild}
                      className="flex-1"
                      disabled={
                        isDeleting || deleteConfirmText !== selectedChild?.name
                      }
                    >
                      {isDeleting
                        ? t("childSettings.deleting") || "Deleting..."
                        : t("childSettings.confirmDelete") || "Delete"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || isDeleting}
          >
            {t("childSettings.close") || "Close"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
