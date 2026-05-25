'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Target, AlertCircle, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChallengeSuccessData {
  overallSuccessRate: number;
  totalChallenges: number;
  successfulAttempts: number;
  byType: Array<{
    type: string;
    successCount: number;
    totalCount: number;
    successRate: number;
  }>;
  topFailedChallenges: Array<{
    challengeId: string;
    failureRate: number;
    failureCount: number;
    totalAttempts: number;
  }>;
}

interface ChallengeSuccessCardProps {
  data: ChallengeSuccessData;
  isLoading?: boolean;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

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
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
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

export default function ChallengeSuccessCard({
  data,
  isLoading = false,
}: ChallengeSuccessCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Success Metrics</CardTitle>
          <CardDescription>Loading challenge data...</CardDescription>
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
        <CardTitle>Challenge Success Metrics</CardTitle>
        <CardDescription>Track challenge completion and success rates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Overall Success Rate"
            value={data.overallSuccessRate}
            unit="%"
            color="emerald"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Total Unique Challenges"
            value={data.totalChallenges}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Successful Attempts"
            value={data.successfulAttempts}
            color="amber"
          />
        </div>

        {/* Success by Challenge Type */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Success Rate by Challenge Type</h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byType} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="type" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <h5 className="font-medium text-slate-900 mb-4">Distribution by Type</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.byType}
                    dataKey="totalCount"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.byType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Challenge Type Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Challenge Type
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Successful
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.byType.map((item, index) => (
                  <tr key={item.type} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.type}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{item.successCount}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-700">{item.totalCount}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
                      {item.successRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Failed Challenges */}
        {data.topFailedChallenges.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-slate-900">Top Failed Challenges</h4>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                      Challenge ID
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-red-900">
                      Failures
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-red-900">
                      Total Attempts
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-red-900">
                      Failure Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topFailedChallenges.slice(0, 10).map((item, index) => (
                    <tr
                      key={item.challengeId}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-red-50'}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {item.challengeId}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {item.failureCount}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {item.totalAttempts}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                        {item.failureRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper icon component (add if not imported)
function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
