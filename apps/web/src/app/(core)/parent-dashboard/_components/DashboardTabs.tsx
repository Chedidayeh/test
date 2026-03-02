"use client";

import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardTabs({
  activeTab,
  onTabChange,
  children,
}: DashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview" className="font-medium">
          Overview
        </TabsTrigger>
        <TabsTrigger value="achievements" className="font-medium">
          Achievements
        </TabsTrigger>
        <TabsTrigger value="riddle-analytics" className="font-medium">
          Riddle Statistics
        </TabsTrigger>
        <TabsTrigger value="time-analytics" className="font-medium">
          Time Analytics
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
