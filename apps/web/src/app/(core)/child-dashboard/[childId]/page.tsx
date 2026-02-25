import type { Metadata } from "next";
import ChildDashboardInteractive from "../_components/ChildDashboardInteractive";
import { getChildById } from "@/src/lib/progress-service/server-api";
import {
  getBadgeById,
  getBadges,
  getLevels,
  getRoadmapsByAgeGroup,
} from "@/src/lib/content-service/server-api";
import { redirect } from "next/navigation";
import { ProgressStatus } from "@shared/types";

export const metadata: Metadata = {
  title: "My Dashboard - Readly",
  description:
    "Track your reading progress, discover new stories, and celebrate your achievements in your personalized learning hub.",
};




export default async function ChildDashboardPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  
  const { childId } = await params;
  const childData = await getChildById(childId);
  if (!childData) {
    return (
      <div className="p-4 text-red-500">Child not found for childId: {childId}</div>
    )
  }
  const levels = await getLevels().catch(() => []);
  const badges = await getBadges().catch(() => []);

  const roadmaps = await getRoadmapsByAgeGroup(childData.ageGroupId);
  // stories in progress
  const currentProgresses = childData.progress.filter((progress) => progress.status === ProgressStatus.IN_PROGRESS);
  return (
    <>
      <div className="min-h-screen p-4 ">
        <ChildDashboardInteractive
          levels={levels}
          allBadges={badges}
          child={childData}
          roadmaps={roadmaps}
          currentProgresses={currentProgresses}
        />
      </div>
    </>
  );
}
