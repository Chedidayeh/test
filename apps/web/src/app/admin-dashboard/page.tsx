import {
  Users,
  BookOpen,
  HelpCircle,
  CheckSquare,
  TrendingUp,
  Activity,
  Globe,
  Globe2,
  MapPin,
  BookMarked,
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
  mockAgeGroups,
  mockWorlds,
} from "./_data/mockData";

export default function AdminDashboard() {
  // Calculate metrics based on new hierarchy
  const totalChildren = mockChildProfiles.length;
  const totalParents = mockParents.length;
  const totalAgeGroups = mockAgeGroups.length;
  const totalStories = mockStories.length;
  const totalWorlds = mockWorlds.length;
  const totalChapters = mockStories.reduce((acc, s) => acc + s.chapters.length, 0);
  const totalChallenges = mockStories.reduce(
    (acc, s) => acc + s.chapters.reduce((c, ch) => c + ch.challenges.length, 0),
    0
  );
  
  const publishedStories = mockStories.filter(
    (s) => s.status === "published",
  ).length;
  const pendingApprovals = mockApprovalQueue.filter(
    (a) => a.status === "pending",
  ).length;
  const totalChildrenActive = mockChildProfiles.filter(
    (c) => c.status === "active",
  ).length;
  const totalStoriesCompleted = mockChildProfiles.reduce(
    (acc, child) => acc + child.totalStoriesCompleted,
    0
  );
  const totalChallengesSolved = mockChildProfiles.reduce(
    (acc, child) => acc + child.totalChallengesSolved,
    0
  );
  const latestMetric = mockAnalyticsMetrics[mockAnalyticsMetrics.length - 1];

  // Recent activity
  const recentActivity = [
    {
      id: 1,
      action: "New world created",
      details: "Future Cities - Science Fiction",
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
      action: "Challenge added to chapter",
      details: "What has cities but no houses...",
      timestamp: "2 days ago",
      type: "content",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to Readly Admin</h1>
        <p className="text-slate-500 mt-2">
          Manage content hierarchy, monitor users, and track platform performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Active Children"
          value={totalChildrenActive}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Total Worlds"
          value={totalWorlds}
          icon={<Globe className="w-6 h-6" />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          label="Published Stories"
          value={publishedStories}
          icon={<BookOpen className="w-6 h-6" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          label="Total Chapters"
          value={totalChapters}
          icon={<BookMarked className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          label="Total Challenges"
          value={totalChallenges}
          icon={<HelpCircle className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity & Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-slate-500 mb-1">Total Age Groups</p>
              <p className="text-2xl font-bold">{totalAgeGroups}</p>
              <p className="text-xs text-slate-500 mt-2">Defined content paths</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500 mb-1">Stories Completed</p>
              <p className="text-2xl font-bold">{totalStoriesCompleted}</p>
              <p className="text-xs text-slate-500 mt-2">By all children</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500 mb-1">Challenges Solved</p>
              <p className="text-2xl font-bold">{totalChallengesSolved}</p>
              <p className="text-xs text-slate-500 mt-2">Total attempts</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold">{pendingApprovals}</p>
              <p className="text-xs text-slate-500 mt-2">Awaiting review</p>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <ChartContainer
            title="Recent Activity"
            description="Latest updates across the platform"
          >
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
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-slate-500">{activity.details}</p>
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
                  Manage Stories
                </Button>
              </Link>
              <Link href="/admin-dashboard/stories/new">
                <Button variant="outline" className="w-full justify-start">
                  <BookMarked className="w-4 h-4 mr-2" />
                  Create Story
                </Button>
              </Link>
              <Link href="/admin-dashboard/approval-queue">
                <Button variant="outline" className="w-full justify-start">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Review Queue ({pendingApprovals})
                </Button>
              </Link>
            </div>
          </ChartContainer>

          {/* Content Overview */}
          <ChartContainer title="Content Overview">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-blue-500" />
                  <span>Age Groups</span>
                </div>
                <span className="font-semibold">{totalAgeGroups}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>Worlds</span>
                </div>
                <span className="font-semibold">{totalWorlds}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span>Stories</span>
                </div>
                <span className="font-semibold">{totalStories}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-orange-500" />
                  <span>Chapters</span>
                </div>
                <span className="font-semibold">{totalChapters}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-red-500" />
                  <span>Challenges</span>
                </div>
                <span className="font-semibold">{totalChallenges}</span>
              </div>
            </div>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
