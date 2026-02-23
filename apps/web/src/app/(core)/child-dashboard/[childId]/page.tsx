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

export const metadata: Metadata = {
  title: "My Dashboard - Readly",
  description:
    "Track your reading progress, discover new stories, and celebrate your achievements in your personalized learning hub.",
};



const mockContinueStory = {
  id: 1,
  title: "The Magical Forest Adventure",
  coverImage: "https://images.unsplash.com/photo-1710272294698-8ab7dceb8c4c",
  coverAlt:
    "Enchanted forest with tall trees and glowing magical lights in misty atmosphere",
  progress: 8,
  totalPages: 15,
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
  return (
    <>
      <div className="min-h-screen p-4 ">
        <ChildDashboardInteractive
          continueStory={mockContinueStory}
          levels={levels}
          allBadges={badges}
          child={childData}
          roadmaps={roadmaps}
        />
      </div>
    </>
  );
}
