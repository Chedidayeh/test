"use client";

import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("ParentDashboard");
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview" className="font-medium">
          {t("tabs.overview")}
        </TabsTrigger>
        <TabsTrigger value="achievements" className="font-medium">
          {t("tabs.achievements")}
        </TabsTrigger>
        <TabsTrigger value="riddle-analytics" className="font-medium">
          {t("tabs.riddleStatistics")}
        </TabsTrigger>
        <TabsTrigger value="time-analytics" className="font-medium">
          {t("tabs.timeAnalytics")}
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
