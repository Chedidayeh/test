"use client";

import { Tabs, TabsContent } from "@/src/components/ui/tabs";
import StatsCards from "./StatsCards";
import QuickInsights from "./QuickInsights";
import { ChildDashboardData } from "../_data/mockData";

interface OverviewTabProps {
  data: ChildDashboardData;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const riddles = data.riddles;
  const riddlesSolved = riddles.filter((r) => r.solved).length;

  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-6 border border-black/10">
        <div className="flex items-start gap-4">
          <h2 className="font-heading text-3xl text-foreground">
            Welcome back, Parent! 👋
          </h2>
        </div>
        <p className="text-muted-foreground mt-2">
          Here's a quick overview of {data.child.name}'s reading journey and achievements.
        </p>
      </div>

      <StatsCards
        totalStars={data.child.totalStars}
        storiesCompleted={data.child.storiesCompleted}
        totalReadingTime={data.child.totalReadingTime}
        riddlesSolved={riddlesSolved}
      />

      <QuickInsights insights={data.insights} />
    </TabsContent>
  );
}
