'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MostFailedChallengeData {
  challengeId: string;
  failureRate: number;
  failureCount: number;
  totalAttempts: number;
  avgAttemptsPerChild: number;
}

interface MostFailedChallengesData {
  mostFailed: MostFailedChallengeData[];
  totalUniqueChallenges: number;
}

interface MostFailedChallengesCardProps {
  data: MostFailedChallengesData;
  isLoading?: boolean;
}

export default function MostFailedChallengesCard({
  data,
  isLoading = false,
}: MostFailedChallengesCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Failed Challenges</CardTitle>
          <CardDescription>Loading challenge data...</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-slate-500">
          Fetching metrics...
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data - top 15 challenges
  const chartData = data.mostFailed.slice(0, 15);

  // Calculate statistics
  const avgFailureRate =
    data.mostFailed.length > 0
      ? (data.mostFailed.reduce((sum, c) => sum + c.failureRate, 0) / data.mostFailed.length)
      : 0;

  const highestFailureRate =
    data.mostFailed.length > 0 ? Math.max(...data.mostFailed.map((c) => c.failureRate)) : 0;

  const totalFailures = data.mostFailed.reduce((sum, c) => sum + c.failureCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Failed Challenges</CardTitle>
        <CardDescription>Identify challenges that need improvement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Total Failed Challenges</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{data.mostFailed.length}</p>
              </div>
              <div className="rounded-lg bg-red-100 p-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Highest Failure Rate</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{highestFailureRate.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Average Failure Rate</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{avgFailureRate.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Total Unique Challenges</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {data.totalUniqueChallenges}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <h5 className="font-semibold text-slate-900 mb-4">Top 15 Most Failed Challenges</h5>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="challengeId" type="category" stroke="#64748b" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="failureRate" fill="#ef4444" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-red-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">
                      Challenge ID
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-red-900">
                      Failure Rate
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-red-900">
                      Failures
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-red-900">
                      Total Attempts
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-red-900">
                      Avg Attempts/Child
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.mostFailed.map((challenge, index) => (
                    <tr
                      key={challenge.challengeId}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-red-50'} ${
                        challenge.failureRate >= 50 ? 'border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {challenge.challengeId}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            challenge.failureRate >= 50
                              ? 'bg-red-100 text-red-800'
                              : challenge.failureRate >= 30
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {challenge.failureRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {challenge.failureCount}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700">
                        {challenge.totalAttempts}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {challenge.avgAttemptsPerChild.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-8 text-center">
            <p className="text-emerald-800 font-medium">
              Great news! No significantly failed challenges identified.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
