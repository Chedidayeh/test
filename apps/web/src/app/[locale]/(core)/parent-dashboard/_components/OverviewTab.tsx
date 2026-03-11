"use client";

import Link from "next/link";
import { TabsContent } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
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

interface OverviewTabProps {
  parentName?: string;
  selectedChild: ChildProfile | undefined;
}

export default function OverviewTab({
  parentName,
  selectedChild,
}: OverviewTabProps) {
  const t = useTranslations("ParentDashboard");
  const totalStars = selectedChild?.totalStars || 0;
  const storiesCompleted = getStoriesCompleted(selectedChild);
  const totalReadingTime = getTotalReadingTime(selectedChild);
  const riddlesSolved = getRiddlesSolved(selectedChild);
  const averagePerDay = getAverageReadingTimePerDay(selectedChild);
  const streak = getCurrentStreak(selectedChild);
  
  return (
    <TabsContent value="overview" className="space-y-4 md:space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 md:p-6 border border-black/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div>
            <h2 className="font-heading text-xl md:text-3xl text-foreground">
              {t("overview.welcome", { name: parentName || "Parent" })}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              {t("overview.description", { childName: selectedChild?.child?.name || "" })}
            </p>
          </div>
          {selectedChild?.childId && (
            <Link href={`/child-dashboard/${selectedChild.childId}`} className="w-full md:w-auto">
              <Button className="whitespace-nowrap w-full md:w-auto text-xs md:text-sm">
                {t("overview.childDashboardButton", { childName: selectedChild.child?.name || "Child" })}
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
    </TabsContent>
  );
}
