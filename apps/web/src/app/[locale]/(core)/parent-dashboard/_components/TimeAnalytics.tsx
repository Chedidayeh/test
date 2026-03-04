"use client";

import { Progress, ChildProfile } from "@shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  calculateTimeEntries,
  calculateDailyTimeStats,
  getDateRangePresets,
  filterTimeEntriesByRange,
  fillTimeEntriesGaps,
  getReadingActivityRate,
  type TimeRange,
} from "../_lib/stats";
import { useMemo, useState } from "react";
import DateRangePicker from "./DateRangePicker";
import { useTranslations } from "next-intl";

interface TimeAnalyticsProps {
  childProgress: Progress[];
  childProfile: ChildProfile;
}

/**
 * TimeAnalytics Component
 * Displays reading time statistics and daily activity breakdown
 * Data is calculated from SessionCheckpoint records within GameSession objects
 * Includes date range selection for filtering the daily reading table
 * Shows all-time reading activity rate: days read / total days since joining
 */
export default function TimeAnalytics({ childProgress, childProfile }: TimeAnalyticsProps) {
  const t = useTranslations("ParentDashboard");
  // Initialize with "last 3 days" preset
  const presets = getDateRangePresets();
  const defaultRange = presets.last3Days || {
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    label: t("timeAnalytics.presets.last3Days"),
  };
  const [dateRange, setDateRange] = useState<TimeRange>(defaultRange);

  // Calculate time entries from real progress data
  const timeEntries = useMemo(
    () => calculateTimeEntries(childProgress),
    [childProgress],
  );

  // Calculate aggregated time stats (always all-time)
  const timeStats = useMemo(
    () => calculateDailyTimeStats(timeEntries),
    [timeEntries],
  );

  // Calculate reading activity rate (all-time)
  const activityRate = useMemo(
    () => getReadingActivityRate(childProfile),
    [childProfile],
  );

  // Filter and fill time entries based on selected date range
  const filteredTimeEntries = useMemo(() => {
    const filtered = filterTimeEntriesByRange(
      timeEntries,
      dateRange.startDate,
      dateRange.endDate,
    );
    return fillTimeEntriesGaps(
      filtered,
      dateRange.startDate,
      dateRange.endDate,
    );
  }, [timeEntries, dateRange]);

  const {
    totalMinutes,
    avgMinutesPerDay,
    totalStories,
    currentStreak,
  } = timeStats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-linear-to-br from-pink-200/20 to-rose-200/20 border border-pink-200 dark:border-pink-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("timeAnalytics.stats.totalReadingTime")}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-data font-bold text-pink-600">
              {totalMinutes}
            </p>
            <span className="text-sm text-pink-500">{t("timeAnalytics.tableHeaders.minutes")}</span>
            <span className="text-sm text-pink-500">
              ({Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m)
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-linear-to-br from-violet-200/20 to-purple-200/20 border border-violet-200 dark:border-violet-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("timeAnalytics.stats.averagePerDay")}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-data font-bold text-violet-600">
              {avgMinutesPerDay}
            </p>
            <span className="text-sm text-violet-500">{t("timeAnalytics.tableHeaders.minutes")}</span>
            <span className="text-sm text-violet-500">
              ({Math.floor(avgMinutesPerDay / 60)}h {avgMinutesPerDay % 60}m)
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-linear-to-br from-cyan-200/20 to-blue-200/20 border border-cyan-200 dark:border-cyan-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("timeAnalytics.stats.currentStreak")}</p>
                    <div className="flex items-baseline gap-1">

          <p className="text-3xl font-data font-bold text-cyan-600">
            {currentStreak}
          </p>
          <p className="text-sm text-cyan-500 mt-1">{t("timeAnalytics.stats.consecutiveDays")}</p>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-card border border-black/30 p-4 shadow-warm-lg">
          <p className="text-sm text-muted-foreground mb-2">{t("timeAnalytics.stats.readingActivityRate")}</p>
          <p className="text-2xl font-data font-bold text-foreground">
            {activityRate.daysRead}/{activityRate.totalDays}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{t("timeAnalytics.stats.sinceJoining")}</span>
            <span className="text-sm font-semibold text-green-600">
              {activityRate.percentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full mt-2">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${activityRate.percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-card border border-black/30 p-4 shadow-warm-lg">
          <p className="text-sm text-muted-foreground mb-2">{t("timeAnalytics.stats.totalStoriesRead")}</p>
          <p className="text-2xl font-data font-bold text-foreground">
            {totalStories}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            {activityRate.daysRead} {t("timeAnalytics.stats.consecutiveDays")}
          </p>
        </div>
      </div>
      <DateRangePicker value={dateRange} onRangeChange={setDateRange} />

      <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg overflow-x-auto">
        <h3 className="font-heading text-lg text-foreground mb-4">{t("timeAnalytics.stats.dailyReadingTime")}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("timeAnalytics.tableHeaders.date")}</TableHead>
              <TableHead>{t("timeAnalytics.tableHeaders.minutes")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTimeEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-4"
                >
                  {t("timeAnalytics.noActivityMessage")}
                </TableCell>
              </TableRow>
            ) : (
              filteredTimeEntries.map((entry) => (
                <TableRow key={entry.date}>
                  <TableCell className="font-medium">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </TableCell>
                  <TableCell className="">
                    {entry.minutes > 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="font-data">{entry.minutes}</span>
                        <span className="text-sm">{t("timeAnalytics.tableHeaders.minutes")}</span>
                        <span className="text-xs">
                          ({Math.floor(entry.minutes / 60)}h{" "}
                          {entry.minutes % 60}m)
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
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
