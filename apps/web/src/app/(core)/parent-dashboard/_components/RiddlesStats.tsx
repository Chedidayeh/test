"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@shared/types";
import { calculateChallengeStats, getAggregatedChallengeStats } from "../_lib/stats";
import { useMemo } from "react";

interface RiddlesStatsProps {
  childProgress: Progress[];
}

export default function RiddlesStats({ childProgress }: RiddlesStatsProps) {
  // Calculate challenge statistics from real progress data
  const challengeStats = useMemo(
    () => calculateChallengeStats(childProgress),
    [childProgress]
  );

  // Get aggregated stats
  const aggregatedStats = useMemo(
    () => getAggregatedChallengeStats(childProgress),
    [childProgress]
  );

  const { totalChallenges, solvedChallenges, successRate, avgAttemptsPerChallenge } =
    aggregatedStats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Challenges</p>
          <p className="text-3xl font-data font-bold text-purple-900">
            {totalChallenges}
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Solved</p>
          <p className="text-3xl font-data font-bold text-green-900">
            {solvedChallenges}
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
          <p className="text-3xl font-data font-bold text-blue-900">
            {successRate}%
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-orange-50 to-red-50 border border-orange-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Attempts</p>
          <p className="text-3xl font-data font-bold text-orange-900">
            {avgAttemptsPerChallenge}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg overflow-x-auto">
        <h3 className="font-heading text-lg text-foreground mb-4">
          Detailed Challenge Statistics
        </h3>
        {challengeStats.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No challenge attempts yet. Start playing to see statistics!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challenge ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Time (sec)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challengeStats.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium font-mono text-xs">
                    {challenge.id.substring(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        challenge.status === "SOLVED"
                          ? "default"
                          : challenge.status === "SKIPPED"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {challenge.status === "SOLVED"
                        ? "✓ Solved"
                        : challenge.status === "SKIPPED"
                        ? "⊘ Skipped"
                        : "Not attempted yet (story in progress)"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{challenge.totalAttempts}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {challenge.successRate}%
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {challenge.timeSpentSeconds}s
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
