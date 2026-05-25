'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Clock, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReadingSpeedData {
  byStory: Array<{
    storyId: string;
    storyTitle?: string;
    difficulty?: string;
    avgCompletionSeconds: number;
    count: number;
  }>;
  byAgeGroup: Array<{
    ageGroupId: string;
    ageGroupName: string;
    avgCompletionSeconds: number;
    count: number;
  }>;
  overallAverageSeconds: number;
}

interface ReadingSpeedTrendsCardProps {
  data: ReadingSpeedData;
  isLoading?: boolean;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  unit = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) => (
  <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900 font-mono">
          {value}
          {unit}
        </p>
      </div>
      <div className="rounded-lg bg-blue-100 p-2 text-blue-600">{Icon}</div>
    </div>
  </div>
);

export default function ReadingSpeedTrendsCard({
  data,
  isLoading = false,
}: ReadingSpeedTrendsCardProps) {
  const [activeTab, setActiveTab] = useState('by-story');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reading Speed Trends</CardTitle>
          <CardDescription>Loading reading speed data...</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-slate-500">
          Fetching metrics...
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data with formatted times
  const storyChartData = data.byStory.map((item) => ({
    ...item,
    avgTimeFormatted: formatTime(item.avgCompletionSeconds),
  }));

  const ageGroupChartData = data.byAgeGroup.map((item) => ({
    ...item,
    avgTimeFormatted: formatTime(item.avgCompletionSeconds),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Speed Trends</CardTitle>
        <CardDescription>Track average reading/completion times by story and age group</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Average */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Overall Average Time"
            value={formatTime(data.overallAverageSeconds)}
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            label="Fastest Story"
            value={data.byStory.length > 0 ? formatTime(Math.min(...data.byStory.map((s) => s.avgCompletionSeconds))) : 'N/A'}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-story">By Story</TabsTrigger>
            <TabsTrigger value="by-age">By Age Group</TabsTrigger>
          </TabsList>

          {/* By Story Tab */}
          <TabsContent value="by-story" className="space-y-4">
            {/* Bar Chart */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <h5 className="font-semibold text-slate-900 mb-4">Average Completion Time by Story (Top 10)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={storyChartData.slice(0, 10).map(item => ({
                    ...item,
                    displayName: item.storyTitle || item.storyId
                  }))}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="displayName"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    height={80}
                  />
                  <YAxis
                    stroke="#64748b"
                    label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [formatTime(value as number), 'Time']}
                  />
                  <Bar dataKey="avgCompletionSeconds" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stories Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Story Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Avg Time
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      Completions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {storyChartData.map((item, index) => (
                    <tr key={item.storyId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.storyTitle || item.storyId}</td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.difficulty || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-mono text-slate-700">
                        {item.avgTimeFormatted}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* By Age Group Tab */}
          <TabsContent value="by-age" className="space-y-4">
            {/* Bar Chart */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <h5 className="font-semibold text-slate-900 mb-4">Average Completion Time by Age Group</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={ageGroupChartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="ageGroupName" stroke="#64748b" />
                  <YAxis
                    stroke="#64748b"
                    label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [formatTime(value as number), 'Time']}
                  />
                  <Bar dataKey="avgCompletionSeconds" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Age Group Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Age Group
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Avg Time
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      Completions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ageGroupChartData.map((item, index) => (
                    <tr key={item.ageGroupId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {item.ageGroupName}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-mono text-slate-700">
                        {item.avgTimeFormatted}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
