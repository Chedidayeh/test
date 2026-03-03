"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/src/components/ui/button";
import { StatCard } from "../_components/StatCard";
import { ChartContainer } from "../_components/ChartContainer";
import { DataTable, Column } from "../_components/DataTable";
import {
  mockAnalyticsMetrics,
  mockRiddleAnalytics,
  RiddleAnalytics,
} from "../_data/mockData";
import { Users, TrendingUp, BookOpen, HelpCircle } from "lucide-react";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7days");

  const latestMetric = mockAnalyticsMetrics[mockAnalyticsMetrics.length - 1];
  const totalActiveUsers = mockAnalyticsMetrics.reduce(
    (acc, m) => acc + m.activeUsers,
    0
  );
  const avgCompletion =
    mockAnalyticsMetrics.reduce((acc, m) => acc + m.completionRate, 0) /
    mockAnalyticsMetrics.length;

  // Prepare data for charts
 const chartData = mockAnalyticsMetrics.map((m) => ({
    date: m.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    activeUsers: m.activeUsers,
    storiesCompleted: m.storiesCompleted,
    riddlesSolved: m.riddlesSolved,
    completionRate: m.completionRate,
    hintUsageRate: m.hintUsageRate,
  }));

  const hintDistribution = [
    { name: "No Hints", value: 65 },
    { name: "1 Hint", value: 20 },
    { name: "2 Hints", value: 10 },
    { name: "3 Hints", value: 5 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const riddleColumns: Column<RiddleAnalytics>[] = [
    {
      key: "riddleQuestion",
      label: "Riddle",
      render: (value) => (
        <p className="text-sm font-medium  line-clamp-2">{value}</p>
      ),
      width: "40%",
    },
    {
      key: "successRate",
      label: "Success Rate",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="font-medium ">{value}%</span>
        </div>
      ),
      width: "20%",
    },
    {
      key: "avgTimeToSolve",
      label: "Avg Time",
      render: (value) => (
        <span className="">{value.toFixed(1)}s</span>
      ),
      width: "15%",
    },
    {
      key: "totalAttempts",
      label: "Attempts",
      render: (value) => <span className="">{value}</span>,
      width: "12%",
    },
    {
      key: "difficulty",
      label: "Level",
      render: (value) => (
        <Badge
          variant={
            value === "Easy"
              ? "default"
              : value === "Medium"
                ? "secondary"
                : "destructive"
          }
        >
          {value}
        </Badge>
      ),
      width: "13%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold ">Analytics</h1>
          <p className="text-slate-500 mt-1">Platform performance and insights</p>
        </div>
        <div className="flex gap-2">
          {["7days", "30days", "90days"].map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === "7days"
                ? "Last 7 Days"
                : range === "30days"
                  ? "Last 30 Days"
                  : "Last 90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Users"
          value={latestMetric?.activeUsers || 0}
          icon={<Users className="w-8 h-8" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          label="Stories Completed"
          value={mockAnalyticsMetrics.reduce((acc, m) => acc + m.storiesCompleted, 0)}
          icon={<BookOpen className="w-8 h-8" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          label="Riddles Solved"
          value={mockAnalyticsMetrics.reduce((acc, m) => acc + m.riddlesSolved, 0)}
          icon={<HelpCircle className="w-8 h-8" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Avg Completion"
          value={`${avgCompletion.toFixed(1)}%`}
          icon={<TrendingUp className="w-8 h-8" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <ChartContainer
          title="Daily Active Users"
          description="Number of active users over time"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Riddles Solved vs Completion Rate */}
        <ChartContainer
          title="Content Interaction"
          description="Stories completed and riddles solved"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Legend />
              <Bar
                dataKey="storiesCompleted"
                fill="#10b981"
                name="Stories"
              />
              <Bar dataKey="riddlesSolved" fill="#3b82f6" name="Riddles" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Completion Rate */}
        <ChartContainer
          title="Completion Rate Trend"
          description="Percentage of riddles successfully completed"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Hint Usage Distribution */}
        <ChartContainer
          title="Hint Usage Distribution"
          description="How many children use hints"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hintDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name} ${value}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {hintDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Riddle Performance Table */}
      <div>
        <h2 className="text-lg font-semibold  mb-4">
          Riddle Performance
        </h2>
        <DataTable<RiddleAnalytics>
          columns={riddleColumns}
          data={mockRiddleAnalytics}
          emptyMessage="No riddle analytics available"
        />
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Top Insight</h3>
          <p className="text-sm text-blue-800">
            Children using hint level 2 have 23% higher success rates compared
            to those using hints level 1 or 3.
          </p>
        </Card>
        <Card className="p-6 bg-green-50 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">
            Engagement Trend
          </h3>
          <p className="text-sm text-green-800">
            Daily active users increased by 15% in the last 7 days, with a 12%
            increase in riddles solved.
          </p>
        </Card>
      </div>
    </div>
  );
}
