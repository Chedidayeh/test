"use client";

import Link from "next/link";
import { TabsContent } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import StatsCards from "./StatsCards";
import { ChildProfile } from "@shared/types";
import {
  getStoriesCompleted,
  getTotalReadingTime,
  getRiddlesSolved,
  getAverageReadingTimePerDay,
  getCurrentStreak,
} from "../_lib/stats";

interface OverviewTabProps {
  parentName?: string;
  selectedChild: ChildProfile | undefined;
}

export default function OverviewTab({
  parentName,
  selectedChild,
}: OverviewTabProps) {
  const totalStars = selectedChild?.totalStars || 0;
  const storiesCompleted = getStoriesCompleted(selectedChild);
  const totalReadingTime = getTotalReadingTime(selectedChild);
  const riddlesSolved = getRiddlesSolved(selectedChild);
  const averagePerDay = getAverageReadingTimePerDay(selectedChild);
  const streak = getCurrentStreak(selectedChild);

  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-6 border border-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-foreground">
              Welcome back, {parentName || "Parent"}! 👋
            </h2>
            <p className="text-muted-foreground mt-2">
              Here&apos;s a quick overview of{" "}
              <span className="font-medium text-foreground">
                {selectedChild?.child?.name}
              </span>
              &apos;s reading journey and achievements.
            </p>
          </div>
          {selectedChild?.childId && (
            <Link href={`/child-dashboard/${selectedChild.childId}`}>
              <Button className="whitespace-nowrap">{selectedChild.child?.name || "Child"}&apos;s dashboard →</Button>
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
