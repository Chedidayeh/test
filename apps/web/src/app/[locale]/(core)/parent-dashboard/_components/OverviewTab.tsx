/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { TabsContent } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import StatsCards from "./StatsCards";
import ChildSettingsModal from "./ChildSettingsModal";
import { AgeGroup, ChildProfile, RoleType } from "@readdly/shared-types";
import {
  getStoriesCompleted,
  getTotalReadingTime,
  getRiddlesSolved,
  getAverageReadingTimePerDay,
  getCurrentStreak,
  getDaysSinceLastRead,
  shouldShowInactivityReminder,
  getWeeklySessionProgress,
} from "../_lib/stats";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
interface OverviewTabProps {
  parentName?: string;
  selectedChild: ChildProfile | undefined;
  ageGroups: AgeGroup[];
  handleChildAdded: () => void;
  userRole : RoleType
}

export default function OverviewTab({
  parentName,
  selectedChild,
  ageGroups,
  handleChildAdded,
  userRole,
}: OverviewTabProps) {
  const t = useTranslations("ParentDashboard");
  const [showChildSettings, setShowChildSettings] = useState(false);

  const [notificationToggle, setNotificationToggle] = useState(
    selectedChild?.activateNotifications,
  );

  // Sync notification toggle state with selectedChild whenever it changes
  useEffect(() => {
    setNotificationToggle(selectedChild?.activateNotifications);
  }, [selectedChild?.activateNotifications, selectedChild?.id]);

  const totalStars = selectedChild?.totalStars || 0;
  const storiesCompleted = getStoriesCompleted(selectedChild);
  const totalReadingTime = getTotalReadingTime(selectedChild);
  const riddlesSolved = getRiddlesSolved(selectedChild);
  const averagePerDay = getAverageReadingTimePerDay(selectedChild);
  const streak = getCurrentStreak(selectedChild);

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

        {selectedChild?.dailyActivity?.lastActiveAt &&
          shouldShowInactivityReminder(selectedChild) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-linear-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 md:p-6 border border-amber-200/50 dark:border-amber-800/50"
            >
              <div className="flex flex-col gap-3">
                <h3 className="font-heading text-lg md:text-xl text-amber-900 dark:text-amber-100">
                  {t("inactivityReminder.title")}
                </h3>
                <p className="text-sm md:text-sm text-amber-800 dark:text-amber-200">
                  {t("inactivityReminder.description", {
                    childName: selectedChild?.name || "your child",
                    daysSince: getDaysSinceLastRead(selectedChild) || 0,
                    daysLabel:
                      (getDaysSinceLastRead(selectedChild) || 0) === 1
                        ? t("stats.day")
                        : t("stats.days"),
                    sessionsPerWeek: selectedChild?.sessionsPerWeek || 3,
                    daysBetweenSessions:
                      Math.round(
                        (7 / (selectedChild?.sessionsPerWeek || 3)) * 10,
                      ) / 10,
                  })}
                </p>
                <div className="mt-2">
                  <p className="text-xs md:text-sm font-medium text-amber-900 dark:text-amber-100">
                    {t("inactivityReminder.weeklyProgress", {
                      sessionsThisWeek:
                        getWeeklySessionProgress(selectedChild)
                          .sessionsThisWeek,
                      sessionsNeeded:
                        getWeeklySessionProgress(selectedChild).sessionsNeeded,
                      percentage:
                        getWeeklySessionProgress(selectedChild).percentage,
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        <StatsCards
          totalStars={totalStars}
          storiesCompleted={storiesCompleted}
          totalReadingTime={totalReadingTime}
          riddlesSolved={riddlesSolved}
          averagePerDay={averagePerDay}
          currentStreak={streak}
        />
        {userRole === RoleType.PARENT && (
          <div className="bg-linear-to-r bg-primary/5 rounded-xl py-2 px-4 border border-black/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              <div>
                <h2 className="font-heading text-sm md:text-xl text-foreground">
                  {t("notificationSettings.statusMessagePrefix", {
                    childName: selectedChild?.name || "your child",
                  })}{" "}
                  <span
                    className={` font-medium inline-block ${
                      notificationToggle
                        ? " text-green-700 dark:text-green-200"
                        : " text-amber-700 dark:text-amber-200"
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
                onClick={() => setShowChildSettings(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Child Settings
              </Button>
            </div>
          </div>
        )}
      </TabsContent>

      {/* Child Settings Modal */}
      <ChildSettingsModal
        isOpen={showChildSettings}
        onClose={() => setShowChildSettings(false)}
        selectedChild={selectedChild}
        notificationToggle={notificationToggle}
        setNotificationToggle={setNotificationToggle}
        ageGroups={ageGroups}
        handleChildAdded={handleChildAdded}
      />
    </>
  );
}
