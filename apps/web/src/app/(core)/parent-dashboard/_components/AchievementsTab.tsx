"use client";

import { TabsContent } from "@/src/components/ui/tabs";
import BadgeCard from "./BadgeCard";
import { ChildDashboardData } from "../_data/mockData";

interface AchievementsTabProps {
  data: ChildDashboardData;
}

export default function AchievementsTab({ data }: AchievementsTabProps) {
  const { badges, child } = data;

  return (
    <TabsContent value="achievements" className="space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-6 border border-black/10">
        <h2 className="font-heading text-3xl text-foreground mb-2">
          Badges & Achievements
        </h2>
        <p className="text-muted-foreground">
          {badges.length} badge{badges.length !== 1 ? "s" : ""} unlocked by{" "}
          {child.name}
        </p>
      </div>

      {badges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <BadgeCard key={badge.id} badge={badge} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-black/30 p-12 shadow-warm-lg text-center">
          <p className="text-2xl mb-2">🏆</p>
          <p className="text-muted-foreground">
            No badges unlocked yet. Keep reading to earn your first badge!
          </p>
        </div>
      )}
    </TabsContent>
  );
}
