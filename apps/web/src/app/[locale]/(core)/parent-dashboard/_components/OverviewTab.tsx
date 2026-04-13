"use client";

import Link from "next/link";
import { TabsContent } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import StatsCards from "./StatsCards";
import { ChildProfile } from "@readdly/shared-types";
import {
  getStoriesCompleted,
  getTotalReadingTime,
  getRiddlesSolved,
  getAverageReadingTimePerDay,
  getCurrentStreak,
} from "../_lib/stats";
import { useTranslations } from "next-intl";
import { Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { updateNotificationSettingsAction } from "@/src/lib/progress-service/server-actions";
import { useRouter } from "next/navigation";

interface OverviewTabProps {
  parentName?: string;
  selectedChild: ChildProfile | undefined;
}

export default function OverviewTab({
  parentName,
  selectedChild,
}: OverviewTabProps) {
  const t = useTranslations("ParentDashboard");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationToggle, setNotificationToggle] = useState(
    selectedChild!.activateNotifications!,
  );
  useEffect(() => {
    setNotificationToggle(selectedChild?.activateNotifications || false);
  }, [selectedChild]);
  console.log("Notification Toggle:", notificationToggle);
  console.log(
    "Selected Child's activateNotifications:",
    selectedChild?.activateNotifications,
  );
  const [isSaving, setIsSaving] = useState(false);

  const totalStars = selectedChild?.totalStars || 0;
  const storiesCompleted = getStoriesCompleted(selectedChild);
  const totalReadingTime = getTotalReadingTime(selectedChild);
  const riddlesSolved = getRiddlesSolved(selectedChild);
  const averagePerDay = getAverageReadingTimePerDay(selectedChild);
  const streak = getCurrentStreak(selectedChild);
  const router = useRouter();
  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      if (!selectedChild?.id) {
        toast.error("Child ID not found");
        return;
      }

      const result = await updateNotificationSettingsAction(
        selectedChild.id,
        notificationToggle,
      );

      if (result.success) {
        toast.success(
          t("notificationSettings.savedSuccess") ||
            "Notification settings saved!",
        );
        setShowNotificationModal(false);
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

  const handleCancel = () => {
    setNotificationToggle(selectedChild?.activateNotifications || false);
    setShowNotificationModal(false);
  };

  return (
    <>
      <TabsContent value="overview" className="space-y-4 md:space-y-6">
        <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 md:p-6 border border-black/10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
            <div>
              <h2 className="font-heading text-xl md:text-3xl text-foreground">
                {t("overview.welcome", { name: parentName || "Parent" })}
              </h2>
              <p className="text-sm md:text-sm text-muted-foreground mt-2">
                {t("overview.description", {
                  childName: selectedChild?.child?.name || "",
                })}
              </p>
            </div>
            {selectedChild?.childId && (
              <Link
                href={`/child-dashboard/${selectedChild.childId}`}
                className="w-full md:w-auto"
              >
                <Button className="whitespace-nowrap w-full md:w-auto text-sm md:text-sm">
                  {t("overview.childDashboardButton", {
                    childName: selectedChild.child?.name || "Child",
                  })}
                </Button>
              </Link>
            )}
          </div>
        </div>

        <StatsCards
          totalStars={totalStars}
          storiesCompleted={storiesCompleted}
          totalReadingTime={totalReadingTime}
          riddlesSolved={riddlesSolved}
          averagePerDay={averagePerDay}
          currentStreak={streak}
        />

        <div className="bg-linear-to-r bg-primary/5 rounded-xl py-2 px-4 border border-black/10">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div>
              <h2 className="font-heading text-sm md:text-xl text-foreground">
                {t("notificationSettings.statusMessagePrefix", {
                  childName: selectedChild?.name || "your child",
                })}{" "}
                <span
                  className={`px-2 py-1 rounded font-semibold inline-block ${
                    notificationToggle
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                      : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200"
                  }`}
                >
                  {notificationToggle
                    ? t("notificationSettings.enabledStatus")
                    : t("notificationSettings.disabledStatus")}
                </span>
              </h2>
              <p className="text-sm md:text-sm text-muted-foreground mt-2">
                {t("notificationSettings.settingsDescription")}
              </p>
            </div>
            <Button
              variant={"outline"}
              onClick={() => setShowNotificationModal(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TabsContent>

      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-950 rounded-xl shadow-lg max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {t("notificationSettings.title") || "Notification Settings"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6">
              {t("notificationSettings.description", {
                childName: selectedChild?.name || "your child",
              })}
            </p>

            {/* Toggle Switch */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 space-y-3">
              <div className="flex items-center justify-between">
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

            {/* Status Message */}
            <div
              className={`p-3 rounded-lg mb-6 text-sm ${
                notificationToggle
                  ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                  : "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
              }`}
            >
              {notificationToggle
                ? `✓ ${t("notificationSettings.enabledStatus") || "Reminders are enabled"}`
                : `✗ ${t("notificationSettings.disabledStatus") || "Reminders are disabled"}`}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isSaving}
              >
                {t("notificationSettings.cancel") || "Cancel"}
              </Button>
              <Button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isSaving
                  ? t("notificationSettings.saving") || "Saving..."
                  : t("notificationSettings.save") || "Save"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
