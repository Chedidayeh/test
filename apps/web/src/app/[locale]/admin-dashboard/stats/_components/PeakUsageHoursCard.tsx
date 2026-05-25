/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface PeakUsageHoursData {
  hour: number;
  hourLabel: string;
  sessionCount: number;
  percentageOfTotal: number;
}

interface PeakUsageHoursCardProps {
  data: Array<PeakUsageHoursData>;
  isLoading?: boolean;
}

export default function PeakUsageHoursCard({ data, isLoading = false }: PeakUsageHoursCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Peak Usage Hours</CardTitle>
          <CardDescription>Loading peak usage data...</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-slate-500">
          Fetching hours data...
        </CardContent>
      </Card>
    );
  }

  // Find peak hours (top 3 hours with most sessions)
  const peakHours = [...data]
    .sort((a, b) => b.sessionCount - a.sessionCount)
    .slice(0, 3);

  const totalSessions = data.reduce((sum, d) => sum + d.sessionCount, 0);

  // Highlight peak hours in the chart
  const dataWithHighlight = data.map(item => ({
    ...item,
    isPeak: peakHours.some(peak => peak.hour === item.hour),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Usage Hours</CardTitle>
        <CardDescription>When children are most active using the app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Peak Hours Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {peakHours.map((hour, index) => (
            <div 
              key={hour.hour}
              className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 p-4 border border-amber-200"
            >
              <p className="text-sm font-medium text-amber-700">
                Peak #{index + 1}
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-900">
                {hour.hourLabel}
              </p>
              <p className="mt-1 text-sm text-amber-600">
                {hour.sessionCount} sessions ({hour.percentageOfTotal.toFixed(1)}%)
              </p>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Peak usage is between <span className="font-semibold">{peakHours[0]?.hourLabel}</span> hours. 
              Consider scheduling maintenance outside these hours.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900 mb-4">Session Count by Hour</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dataWithHighlight} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hourLabel" 
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `${value} sessions`}
                />
                <Bar 
                  dataKey="sessionCount"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  shape={<CustomBar isPeak={false} />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hour</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Sessions</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">% of Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(item => item.sessionCount > 0).map((item, index) => {
                const isPeak = peakHours.some(peak => peak.hour === item.hour);
                return (
                  <tr key={item.hour} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.hourLabel}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">{item.sessionCount}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">{item.percentageOfTotal.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-center">
                      {isPeak && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                          <span className="h-2 w-2 rounded-full bg-red-600"></span>
                          Peak
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">Total Sessions</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalSessions}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">Hours with Activity</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {data.filter(d => d.sessionCount > 0).length}/24
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">Avg Sessions per Hour</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {(totalSessions / 24).toFixed(0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom bar shape to highlight peak hours
function CustomBar(props: any) {
  const { fill, x, y, width, height, isPeak } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={isPeak ? '#ef4444' : fill}
      radius={[8, 8, 0, 0]}
    />
  );
}
