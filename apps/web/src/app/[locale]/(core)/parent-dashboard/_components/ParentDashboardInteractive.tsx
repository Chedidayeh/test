/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import ChildSidebar from "./ChildSidebar";
import DashboardTabs from "./DashboardTabs";
import OverviewTab from "./OverviewTab";
import AchievementsTab from "./AchievementsTab";
import {
  Badge,
  ParentUser,
  AgeGroup,
  RoleType,
  ChildProfile,
  User,
} from "@readdly/shared-types";
import TimeAnalyticsTab from "./TimeAnalyticsTab";
import RiddleAnalyticsTab from "./RiddleAnalyticsTab";
import WeeklyReportsTab from "./WeeklyReportsTab";
import { toast } from "sonner";
import { Session } from "next-auth";
import ChildStorytellingTab from "./ChildStorytellingTab";
import {
  getParentWithProfilesAction,
  getChildByIdAction,
  getChildProfilesByParentAction,
} from "@/src/lib/progress-service/server-actions";
import { Button } from "@/src/components/ui/button";
import { Loader2, Settings } from "lucide-react";
import { usePusherBeams } from "@/src/hooks/use-pusher";
import { getChildProfilesByParent } from "@/src/lib/progress-service/server-api";

export default function ParentDashboardInteractive({
  childProfiles: intialChildProfiles,
  parentData,
  badges,
  ageGroups,
  session,
  userRole,
}: {
  childProfiles: ChildProfile[];
  badges: Badge[];
  ageGroups: AgeGroup[];
  session: Session;
  parentData: User;
  userRole: RoleType;
}) {
  usePusherBeams(session);
  const parentName = parentData?.name || "Parent";

  const [childProfiles, setChildProfiles] =
    useState<ChildProfile[]>(intialChildProfiles);

  const [selectedChildId, setSelectedChildId] = useState(
    childProfiles.length > 0 ? childProfiles[0].childId : "",
  );
  const [fetchedChild, setFetchedChild] = useState<ChildProfile | undefined>(
    childProfiles.length > 0 ? childProfiles[0] : undefined,
  );

  // const parentName = parentData?.name;
  const [activeTab, setActiveTab] = useState("overview");

  // On-demand child profile fetching state
  const [isLoadingChildProfile, setIsLoadingChildProfile] = useState(false);

  const [activateWeeklyReports, setActivateWeeklyReports] = useState(
    fetchedChild?.activateWeeklyReports ?? false,
  );

  const [activateStorytelling, setActivateStorytelling] = useState(
    fetchedChild?.storytelling?.isActive ?? false,
  );

  /**
   * Automatically fetch child profile when selected child ID changes
   */
  useEffect(() => {
    const fetchChildProfile = async () => {
      if (!selectedChildId) {
        setFetchedChild(undefined);
        return;
      }

      try {
        setIsLoadingChildProfile(true);

        console.log("[Parent Dashboard] Fetching child profile for selection", {
          childId: selectedChildId,
        });

        const childProfile = await getChildByIdAction(selectedChildId);

        if (childProfile) {
          setFetchedChild(childProfile);
          console.log("[Parent Dashboard] Child profile loaded successfully", {
            childId: selectedChildId,
            childName: childProfile.child?.name,
          });
        } else {
          toast.error("Failed to load child profile");
          setFetchedChild(undefined);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load child profile";
        console.error("[Parent Dashboard] Error loading child profile:", {
          childId: selectedChildId,
          error: errorMessage,
        });
        toast.error(errorMessage);
        setFetchedChild(undefined);
      } finally {
        setIsLoadingChildProfile(false);
      }
    };

    fetchChildProfile();
  }, [selectedChildId, activateWeeklyReports, setActivateWeeklyReports , activateStorytelling, setActivateStorytelling]);

  /**
   * Handle child selection - now just updates the selected child ID
   */
  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handleChildAdded = async () => {
    try {
      if (!parentData?.id) {
        console.error("Parent ID not found:", parentData);
        toast.error("Parent ID not found");
        return;
      }

      console.log(
        "[Parent Dashboard] Refreshing child list for parent:",
        parentData.id,
      );

      const newChildProfiles = await getChildProfilesByParentAction(
        parentData.id,
      );

      console.log("[Parent Dashboard] Child list refreshed:", newChildProfiles);

      if (Array.isArray(newChildProfiles) && newChildProfiles.length > 0) {
        setChildProfiles(newChildProfiles);
        // toast.success("Child added successfully!");
      } else {
        console.error(
          "[Parent Dashboard] Invalid response from getChildProfilesByParentAction:",
          newChildProfiles,
        );
        // toast.error("Failed to refresh children list");
      }
    } catch (error) {
      console.error("[Parent Dashboard] Error refreshing child list:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to refresh children list",
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-0">
      {/* Main Layout: Sidebar + Content */}
      {childProfiles.length === 0 ? (
        <div className="flex  mt-42 md:mt-62 flex-col items-center justify-center">
          <h2 className="text-2xl font-medium text-center mb-4">
            No data available
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            It looks like you haven't added any child profiles yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Sidebar - Child Selector */}
          <ChildSidebar
            session={session}
            childProfiles={childProfiles}
            selectedChildId={selectedChildId}
            onChildSelect={handleChildSelect}
            ageGroups={ageGroups}
            onChildAdded={handleChildAdded}
            userRole={userRole}
            parentData={parentData}
          />
          <div className="flex-1 w-full">
            <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab}>
              {isLoadingChildProfile ? (
                <div className="flex-1 flex items-center justify-center mt-42 md:mt-62">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <OverviewTab
                    parentName={parentName}
                    selectedChild={fetchedChild}
                    ageGroups={ageGroups}
                    handleChildAdded={handleChildAdded}
                    userRole={userRole}
                  />
                  <AchievementsTab
                    selectedChild={fetchedChild}
                    allAvailableBadges={badges}
                  />
                  <WeeklyReportsTab
                    selectedChild={fetchedChild!}
                    isActive={activateWeeklyReports}
                    setIsActive={setActivateWeeklyReports}
                    userRole={userRole}
                  />
                  <RiddleAnalyticsTab selectedChild={fetchedChild!} />
                  <TimeAnalyticsTab selectedChild={fetchedChild!} />
                  <ChildStorytellingTab
                    selectedChild={fetchedChild!}
                    activateStorytelling={activateStorytelling}
                    setActivateStorytelling={setActivateStorytelling}
                  />
                </>
              )}
            </DashboardTabs>
          </div>
        </div>
      )}
    </div>
  );
}
