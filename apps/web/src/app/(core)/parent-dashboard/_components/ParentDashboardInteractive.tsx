"use client";

import { useState } from "react";
import ChildSidebar from "./ChildSidebar";
import DashboardTabs from "./DashboardTabs";
import OverviewTab from "./OverviewTab";
import AchievementsTab from "./AchievementsTab";
import { Badge, ParentUser, AgeGroup } from "@shared/types";
import TimeAnalyticsTab from "./TimeAnalyticsTab";
import RiddleAnalyticsTab from "./RiddleAnalyticsTab";
import { refetchParentDataAction } from "@/src/lib/progress-service/server-actions";
import { toast } from "sonner";
import { Session } from "next-auth";

export default function ParentDashboardInteractive({
  parentData: initialParentData,
  badges,
  ageGroups,
  session,
}: {
  parentData: ParentUser | null | undefined;
  badges: Badge[];
  ageGroups: AgeGroup[];
  session: Session;
}) {
  const [parentData, setParentData] = useState(initialParentData);
  const children = parentData?.children || [];
  const [selectedChildId, setSelectedChildId] = useState(
    children.length > 0 ? children[0].childId : "",
  );
  const selectedChild = children.find(
    (child) => child.childId === selectedChildId,
  );
  const parentName = parentData?.name;
  const [activeTab, setActiveTab] = useState("overview");

  const handleChildAdded = async () => {
    try {
      if (!parentData?.id) {
        toast.error("Parent ID not found");
        return;
      }

      // Refetch parent data
      const result = await refetchParentDataAction(parentData.id);
      if (result.success && result.data) {
        setParentData(result.data);
        // Auto-select the new child if it exists
        const newChildren = result.data.children || [];
        if (newChildren.length > children.length) {
          const newChild = newChildren[newChildren.length - 1];
          setSelectedChildId(newChild.childId);
        }
      } else {
        toast.error("Failed to refresh children list");
      }
    } catch (error) {
      console.error("Error refetching parent data:", error);
      toast.error("Failed to refresh children list");
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Sidebar - Child Selector */}
        <ChildSidebar
          session={session}
          parentData={parentData}
          selectedChildId={selectedChildId}
          onChildSelect={setSelectedChildId}
          ageGroups={ageGroups}
          onChildAdded={handleChildAdded}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab}>
            <OverviewTab
              parentName={parentName}
              selectedChild={selectedChild}
            />
            <AchievementsTab
              selectedChild={selectedChild}
              allAvailableBadges={badges}
            />
            <RiddleAnalyticsTab selectedChild={selectedChild!} />
            <TimeAnalyticsTab selectedChild={selectedChild!} />
          </DashboardTabs>
        </div>
      </div>
    </div>
  );
}
