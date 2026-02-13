"use client";

import { TimeEntry } from "../_data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

interface TimeAnalyticsProps {
  timeData: TimeEntry[];
}

export default function TimeAnalytics({ timeData }: TimeAnalyticsProps) {
  const totalMinutes = timeData.reduce((sum, entry) => sum + entry.minutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const avgMinutesPerDay =
    timeData.length > 0 ? Math.round(totalMinutes / timeData.length) : 0;
  const totalStories = timeData.reduce((sum, entry) => sum + entry.storiesRead, 0);
  const daysWithReading = timeData.filter((entry) => entry.minutes > 0).length;
  const streak = calculateStreak(timeData);

  function calculateStreak(data: TimeEntry[]): number {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].minutes > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-linear-to-br from-pink-50 to-rose-50 border border-pink-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Reading Time</p>
          <p className="text-3xl font-data font-bold text-pink-900">
            {totalHours}h
          </p>
          <p className="text-xs text-pink-700 mt-1">({totalMinutes} minutes)</p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-violet-50 to-purple-50 border border-violet-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Average Per Day</p>
          <p className="text-3xl font-data font-bold text-violet-900">
            {avgMinutesPerDay}
          </p>
          <p className="text-xs text-violet-700 mt-1">minutes</p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-cyan-50 to-blue-50 border border-cyan-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
          <p className="text-3xl font-data font-bold text-cyan-900">
            {streak}
          </p>
          <p className="text-xs text-cyan-700 mt-1">consecutive days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-card border border-black/30 p-4 shadow-warm-lg">
          <p className="text-sm text-muted-foreground mb-2">Days with Reading</p>
          <p className="text-2xl font-data font-bold text-foreground">
            {daysWithReading}/{timeData.length}
          </p>
          <div className="w-full h-2 bg-muted rounded-full mt-3">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${(daysWithReading / timeData.length) * 100}%`,
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
          Daily Reading Time (Past 2 Weeks)
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Minutes</TableHead>
              <TableHead className="text-right">Stories</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeData.map((entry) => (
              <TableRow key={entry.date}>
                <TableCell className="font-medium">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {entry.minutes > 0 ? `${entry.minutes} min` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {entry.storiesRead > 0 ? entry.storiesRead : "—"}
                </TableCell>
                <TableCell>
                  <div className="w-16 h-2 bg-muted rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${
                        entry.minutes > 60
                          ? "bg-amber-500"
                          : entry.minutes > 30
                            ? "bg-blue-500"
                            : entry.minutes > 0
                              ? "bg-green-500"
                              : "bg-transparent"
                      }`}
                      style={{
                        width: `${Math.min((entry.minutes / 120) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
