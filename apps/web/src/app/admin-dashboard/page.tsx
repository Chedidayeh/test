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
  Map,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { StatCard } from "./_components/StatCard";
import { ChartContainer } from "./_components/ChartContainer";
import Link from "next/link";
import {
  getAgeGroups,
  getRoadmaps,
  getStories,
  getWorlds,
} from "@/src/lib/content-service/server-api";
import { getAllChildren } from "@/src/lib/progress-service/server-api";
import { RoleType } from "@shared/types";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  const userRole = session?.user?.role;
  if (userRole !== RoleType.ADMIN) {
    redirect("/");
  }
  // Fetch real data from server APIs in parallel
  const [ageGroupsData, roadmapsData, storiesData, worldsData, childrenData] =
    await Promise.all([
      getAgeGroups(),
      getRoadmaps(),
      getStories(),
      getWorlds(),
      getAllChildren(),
    ]);

  // Extract data from API responses
  const ageGroups = ageGroupsData || [];
  const roadmaps = roadmapsData || [];
  const stories = storiesData || [];
  const worlds = worldsData || [];
  const childProfiles = childrenData || [];

  // Calculate metrics based on real data
  const totalChildren = childProfiles.children.length;
  const totalAgeGroups = ageGroups.length;
  const totalStories = stories.stories.length;
  const totalWorlds = worlds.length;
  const totalRoadmaps = roadmaps.length;

  // Calculate chapters and challenges
  const totalChapters = stories.stories.reduce(
    (acc, s) => acc + (s.chapters?.length || 0),
    0,
  );
  const totalChallenges = stories.stories.reduce(
    (acc, s) =>
      acc + (s.chapters?.reduce((c, ch) => c + (ch.challenge ? 1 : 0), 0) || 0),
    0,
  );

  // Stories completed by all children
  const totalStoriesCompleted = childProfiles.children.reduce((acc, child) => {
    const completedCount =
      child.progress?.filter((p) => p.status === "COMPLETED").length || 0;
    return acc + completedCount;
  }, 0);

  // Challenges solved by all children
  const totalChallengesSolved = childProfiles.children.reduce((acc, child) => {
    const attemptCount =
      child.progress?.reduce(
        (count, prog) =>
          count + (prog.gameSession?.challengeAttempts?.length || 0),
        0,
      ) || 0;
    return acc + attemptCount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Children"
          value={totalChildren}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Total roadmaps"
          value={totalRoadmaps ?? 0}
          icon={<Map className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Total Worlds"
          value={totalWorlds}
          icon={<Globe className="w-6 h-6" />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          label="Total Stories"
          value={totalStories}
          icon={<BookOpen className="w-6 h-6" />}
          trend={{ value: 5, isPositive: true }}
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
              <p className="text-xs text-slate-500 mt-2">
                Defined content paths
              </p>
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
              <p className="text-sm text-slate-500 mb-1">
                Total parent accounts
              </p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-slate-500 mt-2"></p>
            </Card>
          </div>
        </div>

        {/* Right Column - Quick Actions & Important Info */}
        <div className="space-y-6">
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
