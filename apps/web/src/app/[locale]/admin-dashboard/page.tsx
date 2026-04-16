import {
  Users,
  BookOpen,
  HelpCircle,
  Globe2,
  MapPin,
  BookMarked,
  Baby,
  Lightbulb,
  Map,
  BookA,
} from "lucide-react";
import { StatCard } from "./_components/StatCard";
import { ChartContainer } from "./_components/ChartContainer";
import { getAllChildrenProfiles, getDashboardStats } from "@/src/lib/progress-service/server-api";
import { transformChildrenToSessionData } from "@/src/lib/progress-service/transform-children-data";
import { ChartComponent } from "./_components/ChartComponent";

export default async function AdminDashboard() {
  // Fetch dashboard statistics from backend services
  const stats = await getDashboardStats();
  const childrenProfilesResponse = await getAllChildrenProfiles();
  console.log("Children Profiles Response:", childrenProfilesResponse.children[1]);
  // Transform children profile data into daily session insights
  const sessionData = transformChildrenToSessionData(childrenProfilesResponse.children || []);
  console.log("Session Data:", sessionData);
  
  const activeChildren = stats.activeChildren;
  const totalChildren = stats.totalChildren;
  const totalParents = stats.totalParents;
  const totalAgeGroups = stats.totalAgeGroups;
  const totalRoadmaps = stats.totalRoadmaps;
  const totalWorlds = stats.totalWorlds;
  const totalStories = stats.totalStories;
  const totalChapters = stats.totalChapters;
  const totalChallenges = stats.totalChallenges;
  const totalStoriesCompleted = stats.totalStoriesCompleted;
  const totalChallengesSolved = stats.totalChallengesSolved;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Active Children"
          value={activeChildren}
          icon={<Baby className="w-6 h-6" />}
        />
        <StatCard
          label="Total children"
          value={totalChildren}
          icon={<Baby className="w-6 h-6" />}
        />
        <StatCard
          label="Total Parents"
          value={totalParents}
          icon={<Users className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity & Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Stories Completed"
              value={totalStoriesCompleted}
              icon={<BookMarked className="w-6 h-6" />}
            />
            <StatCard
              label="Challenges Solved"
              value={totalChallengesSolved}
              icon={<Lightbulb className="w-6 h-6" />}
            />
          </div>
          <ChartComponent data={sessionData} />
        </div>

        {/* Right Column - Quick Actions & Important Info */}
        <div className="space-y-6">
          {/* Content Overview */}
          <ChartContainer title="Content Overview">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookA className="w-4 h-4 text-blue-500" />
                  <span>Age Groups</span>
                </div>
                <span className="font-semibold">{totalAgeGroups}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-yellow-500" />
                  <span>Roadmaps</span>
                </div>
                <span className="font-semibold">{totalRoadmaps}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-green-500" />
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
