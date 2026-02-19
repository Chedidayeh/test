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
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="overview" className="font-medium">
          Overview
        </TabsTrigger>
        <TabsTrigger value="achievements" className="font-medium">
          Achievements
        </TabsTrigger>
        <TabsTrigger value="analytics" className="font-medium">
          Analytics
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
