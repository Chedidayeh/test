'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Users, BookOpen, BarChart3 } from 'lucide-react';

interface EngagementMetricsData {
  avgSessionDurationMinutes: number;
  avgSessionDurationSeconds: number;
  sessionsPerChild: number;
  avgChaptersPerSession: number;
  avgStoriesCompletedPerDay: number;
  totalSessions: number;
  totalChildren: number;
}

interface EngagementMetricsCardProps {
  data: EngagementMetricsData;
  isLoading?: boolean;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  unit = '' 
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
          {typeof value === 'number' ? value.toFixed(2) : value}{unit}
        </p>
      </div>
      <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
        {Icon}
      </div>
    </div>
  </div>
);

export default function EngagementMetricsCard({ data, isLoading = false }: EngagementMetricsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Loading engagement data...</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-slate-500">
          Fetching metrics...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Avg Session Duration"
          value={data.avgSessionDurationMinutes}
          unit=" min"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Sessions per Child"
          value={data.sessionsPerChild}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Avg Chapters per Session"
          value={data.avgChaptersPerSession}
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Stories per Day"
          value={data.avgStoriesCompletedPerDay}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Sessions</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">{data.totalSessions}</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Total Children</p>
          <p className="mt-2 text-3xl font-bold text-purple-900">{data.totalChildren}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200">
          <p className="text-sm font-medium text-emerald-600">Total Reading Time</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">
            {(data.avgSessionDurationMinutes * data.totalSessions).toFixed(0)} min
          </p>
        </div>
      </div>
    </div>
  );
}
