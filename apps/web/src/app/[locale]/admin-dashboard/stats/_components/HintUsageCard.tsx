'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Lightbulb, TrendingDown, Users } from 'lucide-react';
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

interface HintUsageData {
  overallHintUsageRate: number;
  successWithoutHints: number;
  successWithHints: number;
  hintEffectiveness: number;
  byChallenge: Array<{
    type: string;
    hintUsageRate: number;
    avgHintsUsed: number;
    totalAttempts: number;
  }>;
  childrenNeedingSupport: Array<{
    childId: string;
    childName: string;
    hintUsageRate: number;
    successRate: number;
  }>;
}

interface HintUsageCardProps {
  data: HintUsageData;
  isLoading?: boolean;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  unit = '',
  color = 'blue',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {typeof value === 'number' ? value.toFixed(2) : value}
            {unit}
          </p>
        </div>
        <div className={`rounded-lg p-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
          {Icon}
        </div>
      </div>
    </div>
  );
};

export default function HintUsageCard({ data, isLoading = false }: HintUsageCardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hint Usage Analytics</CardTitle>
          <CardDescription>Loading hint data...</CardDescription>
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
        <CardTitle>Hint Usage Analytics</CardTitle>
        <CardDescription>Track hint effectiveness and support needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Lightbulb className="w-5 h-5" />}
            label="Overall Hint Usage"
            value={data.overallHintUsageRate}
            unit="%"
            color="amber"
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            label="Success Without Hints"
            value={data.successWithoutHints}
            unit="%"
            color="emerald"
          />
          <StatCard
            icon={<Lightbulb className="w-5 h-5" />}
            label="Success With Hints"
            value={data.successWithHints}
            unit="%"
            color="blue"
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            label="Hint Effectiveness"
            value={data.hintEffectiveness}
            unit="%"
            color="purple"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">By Challenge</TabsTrigger>
            <TabsTrigger value="support">Children Needing Support</TabsTrigger>
          </TabsList>

          {/* By Challenge Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Line Chart */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <h5 className="font-semibold text-slate-900 mb-4">Hint Usage Trend by Challenge</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={data.byChallenge}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="type" stroke="#64748b" angle={-45} height={80} />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hintUsageRate"
                    stroke="#f59e0b"
                    dot={false}
                    name="Usage Rate %"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgHintsUsed"
                    stroke="#8b5cf6"
                    dot={false}
                    name="Avg Hints Used"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Challenge Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Challenge Type
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Usage Rate
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Avg Hints
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      Attempts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.byChallenge.slice(0, 15).map((item, index) => (
                    <tr key={item.type} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {item.type}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {item.hintUsageRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {item.avgHintsUsed.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {item.totalAttempts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                <strong>{data.childrenNeedingSupport.length}</strong> children need additional support
                (high hint usage &gt; 50% AND low success rate &lt; 60%)
              </p>
            </div>

            {/* Support Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-amber-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">
                      Child Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-900">
                      Hint Usage
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-900">
                      Success Rate
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-amber-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.childrenNeedingSupport.map((item, index) => (
                    <tr key={item.childId} className={index % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {item.childName}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {item.hintUsageRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {item.successRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Users className="w-3 h-3 mr-1" />
                          Needs Support
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.childrenNeedingSupport.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500">
                  No children need additional support at this time.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
