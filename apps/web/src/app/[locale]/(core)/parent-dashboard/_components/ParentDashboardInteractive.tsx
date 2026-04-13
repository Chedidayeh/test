"use client";

import { useState } from "react";
import ChildSidebar from "./ChildSidebar";
import DashboardTabs from "./DashboardTabs";
import OverviewTab from "./OverviewTab";
import AchievementsTab from "./AchievementsTab";
import { Badge, ParentUser, AgeGroup, RoleType } from "@readdly/shared-types";
import TimeAnalyticsTab from "./TimeAnalyticsTab";
import RiddleAnalyticsTab from "./RiddleAnalyticsTab";
import { toast } from "sonner";
import { Session } from "next-auth";
import ChildStorytellingTab from "./ChildStorytellingTab";
import { getParentWithProfilesAction } from "@/src/lib/progress-service/server-actions";
import { Button } from "@/src/components/ui/button";
import { Settings } from "lucide-react";
import { usePusherBeams } from "@/src/hooks/use-pusher";

export default function ParentDashboardInteractive({
  parentData: initialParentData,
  badges,
  ageGroups,
  session,
  userRole,
}: {
  parentData: ParentUser | null | undefined;
  badges: Badge[];
  ageGroups: AgeGroup[];
  session: Session;
  userRole: RoleType;
}) {
  usePusherBeams(session);
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
      const result = await getParentWithProfilesAction(parentData.id);
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
    <div className="container mx-auto px-4 py-4 sm:py-0">
      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Sidebar - Child Selector */}
        <ChildSidebar
          session={session}
          parentData={parentData}
          selectedChildId={selectedChildId}
          onChildSelect={setSelectedChildId}
          ageGroups={ageGroups}
          onChildAdded={handleChildAdded}
          userRole={userRole}
        />

        {/* Main Content */}
        <div className="flex-1 w-full">
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
            {/* <AIInsightsTab selectedChild={selectedChild!} /> */}
            <RiddleAnalyticsTab selectedChild={selectedChild!} />
            <TimeAnalyticsTab selectedChild={selectedChild!} />
            <ChildStorytellingTab selectedChild={selectedChild!} />
          </DashboardTabs>
        </div>
      </div>
    </div>
  );
}
