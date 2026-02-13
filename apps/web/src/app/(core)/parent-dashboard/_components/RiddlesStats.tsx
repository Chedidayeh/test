"use client";

import { Riddle } from "../_data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";

interface RiddlesStatsProps {
  riddles: Riddle[];
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Medium: "bg-amber-100 text-amber-800",
  Hard: "bg-red-100 text-red-800",
};

export default function RiddlesStats({ riddles }: RiddlesStatsProps) {
  const totalRiddles = riddles.length;
  const solvedRiddles = riddles.filter((r) => r.solved).length;
  const successRate =
    totalRiddles > 0 ? Math.round((solvedRiddles / totalRiddles) * 100) : 0;
  const totalAttempts = riddles.reduce((sum, r) => sum + r.attempts, 0);
  const avgAttempts =
    totalRiddles > 0 ? Math.round(totalAttempts / totalRiddles * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Riddles</p>
          <p className="text-3xl font-data font-bold text-purple-900">
            {totalRiddles}
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 p-4">
          <p className="text-sm text-muted-foreground mb-1">Solved</p>
          <p className="text-3xl font-data font-bold text-green-900">
            {solvedRiddles}
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
            {avgAttempts}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg overflow-x-auto">
        <h3 className="font-heading text-lg text-foreground mb-4">
          Detailed Riddle Statistics
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Riddle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riddles.map((riddle) => (
              <TableRow key={riddle.id}>
                <TableCell className="font-medium">{riddle.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {riddle.category}
                </TableCell>
                <TableCell>
                  <Badge className={difficultyColors[riddle.difficulty]}>
                    {riddle.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={riddle.solved ? "default" : "secondary"}>
                    {riddle.solved ? "✓ Solved" : "Unsolved"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{riddle.attempts}</TableCell>
                <TableCell className="text-right font-semibold">
                  {riddle.successRate}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
