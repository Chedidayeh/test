"use client";

import { useState } from "react";
import ChildSidebar from "./ChildSidebar";
import DashboardTabs from "./DashboardTabs";
import OverviewTab from "./OverviewTab";
import ProgressTab from "./ProgressTab";
import AchievementsTab from "./AchievementsTab";
import AnalyticsTab from "./AnalyticsTab";
import { mockChildren, getChildDashboardData } from "../_data/mockData";

export default function ParentDashboardInteractive() {
  const [selectedChildId, setSelectedChildId] = useState(mockChildren[0].id);
  const [activeTab, setActiveTab] = useState("overview");

  const dashboardData = getChildDashboardData(selectedChildId);

  return (
      <div className="container mx-auto px-4">

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* Sidebar - Child Selector */}
          <ChildSidebar
            childrenData={mockChildren}
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
              <OverviewTab data={dashboardData} />
              <ProgressTab data={dashboardData} />
              <AchievementsTab data={dashboardData} />
              <AnalyticsTab data={dashboardData} />
            </DashboardTabs>
          </div>
        </div>
      </div>
  );
}
