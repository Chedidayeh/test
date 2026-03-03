"use client";

import { Tabs, TabsContent } from "@/src/components/ui/tabs";
import LearningRoadmap from "./LearningRoadmap";
import { ChildDashboardData } from "../_data/mockData";

interface ProgressTabProps {
  data: ChildDashboardData;
}

export default function ProgressTab({ data }: ProgressTabProps) {
  return (
    <TabsContent value="progress" className="space-y-6">
      <LearningRoadmap
        milestones={data.milestones}
        currentStars={data.child.totalStars}
      />
    </TabsContent>
  );
}
