"use client";

import { Progress } from "@shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { calculateTimeEntries, calculateDailyTimeStats } from "../_lib/stats";
import { useMemo } from "react";

interface TimeAnalyticsProps {
  childProgress: Progress[];
}

/**
 * TimeAnalytics Component
 * Displays reading time statistics and daily activity breakdown
 * Data is calculated from SessionCheckpoint records within GameSession objects
 */
export default function TimeAnalytics({ childProgress }: TimeAnalyticsProps) {
  // Calculate time entries from real progress data
  const timeEntries = useMemo(
    () => calculateTimeEntries(childProgress),
    [childProgress]
  );

  // Calculate aggregated time stats
  const timeStats = useMemo(
    () => calculateDailyTimeStats(timeEntries),
    [timeEntries]
  );

  const {
    totalMinutes,
    totalHours,
    avgMinutesPerDay,
    totalStories,
    daysWithReading,
    currentStreak,
  } = timeStats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-linear-to-br from-pink-200/20 to-rose-200/20 border border-pink-200 dark:border-pink-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Reading Time</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-data font-bold text-pink-600">
              {totalMinutes}
            </p>
            <span className="text-sm text-pink-500">minutes</span>
            <span className="text-sm text-pink-500">
              ({Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m)
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-linear-to-br from-violet-200/20 to-purple-200/20 border border-violet-200 dark:border-violet-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Average Per Day</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-data font-bold text-violet-600">
              {avgMinutesPerDay}
            </p>
            <span className="text-sm text-violet-500">minutes</span>
            <span className="text-sm text-violet-500">
              ({Math.floor(avgMinutesPerDay / 60)}h {avgMinutesPerDay % 60}m)
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-linear-to-br from-cyan-200/20 to-blue-200/20 border border-cyan-200 dark:border-cyan-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
          <p className="text-3xl font-data font-bold text-cyan-600">
            {currentStreak}
          </p>
          <p className="text-xs text-cyan-500 mt-1">consecutive days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-card border border-black/30 p-4 shadow-warm-lg">
          <p className="text-sm text-muted-foreground mb-2">Days with Reading</p>
          <p className="text-2xl font-data font-bold text-foreground">
            {daysWithReading}/{timeEntries.length}
          </p>
          <div className="w-full h-2 bg-muted rounded-full mt-3">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${timeEntries.length > 0 ? (daysWithReading / timeEntries.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-card border border-black/30 p-4 shadow-warm-lg">
          <p className="text-sm text-muted-foreground mb-2">Total Stories Read</p>
          <p className="text-2xl font-data font-bold text-foreground">
            {totalStories}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            over {daysWithReading} reading days
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg overflow-x-auto">
        <h3 className="font-heading text-lg text-foreground mb-4">
          Daily Reading Time
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Minutes</TableHead>
              <TableHead className="text-right">Stories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                  No reading activity yet. Start playing to see reading statistics!
                </TableCell>
              </TableRow>
            ) : (
              timeEntries.map((entry) => (
                <TableRow key={entry.date}>
                  <TableCell className="font-medium">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.minutes > 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="font-data">{entry.minutes}</span>
                        <span className="text-sm">min</span>
                        <span className="text-xs">({Math.floor(entry.minutes / 60)}h {entry.minutes % 60}m)</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.storiesRead > 0 ? entry.storiesRead : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
