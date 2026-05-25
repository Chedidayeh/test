'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BookOpen, CheckCircle, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LearningCompletionData {
  totalStoryStarted: number;
  totalStoryCompleted: number;
  completionRate: number;
  byDifficulty: Array<{
    difficulty: string;
    completed: number;
    total: number;
    completionRate: number;
  }>;
}

interface LearningCompletionCardProps {
  data: LearningCompletionData;
  isLoading?: boolean;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  unit = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit?: string;
}) => (
  <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {typeof value === 'number' ? value.toFixed(2) : value}
          {unit}
        </p>
      </div>
      <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">{Icon}</div>
    </div>
  </div>
);

export default function LearningCompletionCard({
  data,
  isLoading = false,
}: LearningCompletionCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Story Completion Metrics</CardTitle>
          <CardDescription>Loading completion data...</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-slate-500">
          Fetching metrics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Completion Metrics</CardTitle>
        <CardDescription>Track children's progress through stories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Stories Started"
            value={data.totalStoryStarted}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Stories Completed"
            value={data.totalStoryCompleted}
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Overall Completion Rate"
            value={data.completionRate}
            unit="%"
          />
        </div>

        {/* Completion by Difficulty */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Completion by Difficulty</h4>

          {/* Bar Chart */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byDifficulty} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="difficulty" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                <Bar
                  dataKey="total"
                  fill="#cbd5e1"
                  name="Total Started"
                  radius={[8, 8, 0, 0]}
                  opacity={0.5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Difficulty Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Difficulty
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.byDifficulty.map((item, index) => (
                  <tr key={item.difficulty} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.difficulty}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{item.completed}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{item.total}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      {item.completionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
