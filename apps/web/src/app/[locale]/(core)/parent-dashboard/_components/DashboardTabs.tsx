"use client";

import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
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
      {/* Desktop: Grid layout */}
      <TabsList className="hidden md:grid w-full grid-cols-4 mb-4 md:mb-6">
        <TabsTrigger value="overview" className="font-medium text-sm">
          {t("tabs.overview")}
        </TabsTrigger>
        <TabsTrigger value="achievements" className="font-medium text-sm">
          {t("tabs.achievements")}
        </TabsTrigger>
        <TabsTrigger value="riddle-analytics" className="font-medium text-sm">
          {t("tabs.riddleStatistics")}
        </TabsTrigger>
        <TabsTrigger value="time-analytics" className="font-medium text-sm">
          {t("tabs.timeAnalytics")}
        </TabsTrigger>
      </TabsList>

      {/* Mobile: Select dropdown */}
      <div className="md:hidden mb-4">
        <Select value={activeTab} onValueChange={onTabChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">{t("tabs.overview")}</SelectItem>
            <SelectItem value="achievements">{t("tabs.achievements")}</SelectItem>
            <SelectItem value="riddle-analytics">{t("tabs.riddleStatistics")}</SelectItem>
            <SelectItem value="time-analytics">{t("tabs.timeAnalytics")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {children}
    </Tabs>
  );
}
