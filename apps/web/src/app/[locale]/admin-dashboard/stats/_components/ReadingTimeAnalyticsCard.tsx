'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';

interface ReadingTimeAnalyticsData {
  totalReadingMinutes: number;
  avgReadingMinutesPerChild: number;
  byAgeGroup: Array<{
    ageGroupId: string;
    ageGroupName: string;
    readingMinutes: number;
    percentageOfTotal: number;
  }>;
  byGender: Array<{
    gender: string;
    readingMinutes: number;
    percentageOfTotal: number;
  }>;
  byChild: Array<{
    childId: string;
    childName: string;
    readingMinutes: number;
  }>;
}

interface ReadingTimeAnalyticsCardProps {
  data: ReadingTimeAnalyticsData;
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'];

export default function ReadingTimeAnalyticsCard({ data, isLoading = false }: ReadingTimeAnalyticsCardProps) {
  const [activeTab, setActiveTab] = useState('age-group');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reading Time Analytics</CardTitle>
          <CardDescription>Loading reading time data...</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-slate-500">
          Fetching analytics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Reading Time Analytics</CardTitle>
            <CardDescription>Reading time breakdown by demographics</CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-600">
              Total: <span className="font-bold text-slate-900">{data.totalReadingMinutes.toFixed(0)} minutes</span>
            </p>
            <p className="text-sm text-slate-600">
              Avg per Child: <span className="font-bold text-slate-900">{data.avgReadingMinutesPerChild.toFixed(2)} min</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="age-group">By Age Group</TabsTrigger>
          <TabsTrigger value="gender">By Gender</TabsTrigger>
          </TabsList>
          {/* By Age Group Tab */}
          <TabsContent value="age-group" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Reading Minutes by Age Group</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.byAgeGroup} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="ageGroupName" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value} min`}
                    />
                    <Bar dataKey="readingMinutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Distribution (%)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.byAgeGroup}
                      dataKey="percentageOfTotal"
                      nameKey="ageGroupName"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.byAgeGroup.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Age Group Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Age Group</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Reading Minutes</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byAgeGroup.map((item, index) => (
                    <tr key={item.ageGroupId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-sm text-slate-900">{item.ageGroupName}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{item.readingMinutes.toFixed(0)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{item.percentageOfTotal.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* By Gender Tab */}
          <TabsContent value="gender" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Reading Minutes by Gender</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.byGender} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="gender" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value} min`}
                    />
                    <Bar dataKey="readingMinutes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900 mb-4">Distribution (%)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.byGender}
                      dataKey="percentageOfTotal"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.byGender.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gender Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Gender</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Reading Minutes</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byGender.map((item, index) => (
                    <tr key={item.gender} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-sm text-slate-900">{item.gender}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{item.readingMinutes.toFixed(0)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{item.percentageOfTotal.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Top Children Tab */}
          <TabsContent value="children" className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900 mb-4">Top 10 Most Active Readers</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={data.byChild.slice(0, 10)} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="childName" type="category" stroke="#64748b" width={140} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => `${value} min`}
                  />
                  <Bar dataKey="readingMinutes" fill="#ec4899" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Children Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Child Name</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Reading Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byChild.map((item, index) => (
                    <tr key={item.childId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">#{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{item.childName}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">{item.readingMinutes}</td>
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
