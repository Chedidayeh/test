"use client";

import { useState } from "react";
import ChildSidebar from "./ChildSidebar";
import DashboardTabs from "./DashboardTabs";
import OverviewTab from "./OverviewTab";
import ProgressTab from "./ProgressTab";
import AchievementsTab from "./AchievementsTab";
import AnalyticsTab from "./AnalyticsTab";
import { getChildDashboardData } from "../_data/mockData";
import { Badge, ParentUser } from "@shared/types";

export default function ParentDashboardInteractive(
  { parentData , badges }: { parentData: ParentUser | null | undefined , badges: Badge[] }
) {
  const children = parentData?.children || [];
  const [selectedChildId, setSelectedChildId] = useState(
    children.length > 0 ? children[0].childId : ""
  );
  const selectedChild = children.find((child) => child.childId === selectedChildId);
  const parentName = parentData?.name
  const [activeTab, setActiveTab] = useState("overview");

  const dashboardData = getChildDashboardData(selectedChildId as any );

  return (
      <div className="container mx-auto px-4">

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* Sidebar - Child Selector */}
          <ChildSidebar
            parentData={parentData}
            selectedChildId={selectedChildId}
            onChildSelect={setSelectedChildId}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <DashboardTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <OverviewTab  parentName={parentName} selectedChild={selectedChild} />
              <AchievementsTab data={dashboardData} selectedChild={selectedChild} allAvailableBadges={badges} />
              <AnalyticsTab data={dashboardData} />
            </DashboardTabs>
          </div>
        </div>
      </div>
  );
}
