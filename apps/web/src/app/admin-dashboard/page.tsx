import {
  Users,
  BookOpen,
  HelpCircle,
  CheckSquare,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { StatCard } from "./_components/StatCard";
import { ChartContainer } from "./_components/ChartContainer";
import Link from "next/link";
import {
  mockStories,
  mockChildProfiles,
  mockParents,
  mockApprovalQueue,
  mockAnalyticsMetrics,
} from "./_data/mockData";

export default function AdminDashboard() {
  // Calculate metrics
  const totalChildren = mockChildProfiles.length;
  const totalParents = mockParents.length;
  const totalStories = mockStories.length;
  const publishedStories = mockStories.filter((s) => s.status === "published")
    .length;
  const pendingApprovals = mockApprovalQueue.filter(
    (a) => a.status === "pending"
  ).length;
  const totalChildrenActive = mockChildProfiles.filter(
    (c) => c.status === "active"
  ).length;
  const totalStoriesCompleted = mockChildProfiles.reduce(
    (acc, child) => acc + child.totalStoriesCompleted,
    0
  );
  const latestMetric = mockAnalyticsMetrics[mockAnalyticsMetrics.length - 1];

  // Recent activity
  const recentActivity = [
    {
      id: 1,
      action: "New story published",
      details: "The Dragon's Gold",
      timestamp: "2 hours ago",
      type: "story",
    },
    {
      id: 2,
      action: "Parent account created",
      details: "Maria Garcia",
      timestamp: "4 hours ago",
      type: "user",
    },
    {
      id: 3,
      action: "Story submitted for review",
      details: "Space Explorer's Quest",
      timestamp: "1 day ago",
      type: "approval",
    },
    {
      id: 4,
      action: "Child completed story",
      details: "Emma - The Lost Treasure of Pirate's Cove",
      timestamp: "1 day ago",
      type: "activity",
    },
    {
      id: 5,
      action: "New riddle added",
      details: "What travels around the world...",
      timestamp: "2 days ago",
      type: "content",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome to Readly Admin
        </h1>
        <p className="text-slate-600 mt-2">
          Manage content, monitor users, and track platform performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Children"
          value={totalChildrenActive}
          icon={<Users className="w-8 h-8" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Published Stories"
          value={publishedStories}
          icon={<BookOpen className="w-8 h-8" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          label="Total Riddles"
          value={mockStories.reduce((acc, s) => acc + s.riddleCount, 0)}
          icon={<HelpCircle className="w-8 h-8" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals}
          icon={<CheckSquare className="w-8 h-8" />}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity & Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Parents</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalParents}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {mockParents.filter((p) => p.status === "active").length} active
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-600 mb-1">Stories Completed</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalStoriesCompleted}
              </p>
              <p className="text-xs text-slate-500 mt-2">By all children</p>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <ChartContainer title="Recent Activity" description="Latest updates across the platform">
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0"
                >
                  <div className="mt-1">
                    {activity.type === "story" && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    {activity.type === "user" && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                    {activity.type === "approval" && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    )}
                    {activity.type === "activity" && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                    {activity.type === "content" && (
                      <div className="w-2 h-2 rounded-full bg-pink-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-slate-600">{activity.details}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Right Column - Quick Actions & Important Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <ChartContainer title="Quick Actions">
            <div className="space-y-2">
              <Link href="/admin-dashboard/stories">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create Story
                </Button>
              </Link>
              <Link href="/admin-dashboard/approval-queue">
                <Button variant="outline" className="w-full justify-start">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Review Approvals
                </Button>
              </Link>
              <Link href="/admin-dashboard/users/children">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Children
                </Button>
              </Link>
              <Link href="/admin-dashboard/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </ChartContainer>

          {/* Platform Status */}
          <ChartContainer title="Platform Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-600">System Health</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">API Status</span>
                <span className="text-sm font-semibold text-green-600">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">Database</span>
                <span className="text-sm font-semibold text-green-600">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">
                  Latest Metric Update
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {latestMetric?.date.toLocaleDateString()}
                </span>
              </div>
            </div>
          </ChartContainer>

          {/* Pending Approvals Alert */}
          {pendingApprovals > 0 && (
            <Card className="p-4 bg-yellow-50 border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-900 mb-2">
                {pendingApprovals} Item{pendingApprovals > 1 ? "s" : ""}{" "}
                Awaiting Approval
              </p>
              <p className="text-sm text-yellow-700 mb-3">
                Please review pending content to keep the platform fresh
              </p>
              <Link href="/admin-dashboard/approval-queue">
                <Button size="sm" variant="outline" className="w-full">
                  Review Now
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
