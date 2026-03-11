import type { Metadata } from "next";
import ChildDashboardInteractive from "../_components/ChildDashboardInteractive";
import { getChildById } from "@/src/lib/progress-service/server-api";
import {
  getBadgeById,
  getBadges,
  getLevels,
  getRoadmapsByAgeGroup,
  getRoadmapsByIds,
} from "@/src/lib/content-service/server-api";
import { redirect } from "next/navigation";
import { ProgressStatus } from "@readdly/shared-types";
import { auth } from "@/src/auth";
import { getTranslations } from "next-intl/server";
import MissingDataAlert from "@/src/components/shared/MissingDataAlert";

export const metadata: Metadata = {
  title: "My Dashboard - Readdly",
  description:
    "Track your reading progress, discover new stories, and celebrate your achievements in your personalized learning hub.",
};

export default async function ChildDashboardPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const t = await getTranslations("ChildDashboard");

  const session = await auth();

  const userRole = session?.user.role;

  const { childId } = await params;
  const childData = await getChildById(childId);
  if (!childData) {
    return <MissingDataAlert message={t("childNotFound")} />;
  }
  const levels = await getLevels().catch(() => []);
  const badges = await getBadges().catch(() => []);

  const roadmaps = await getRoadmapsByIds(childData.allocatedRoadmaps); // stories in progress
  const currentProgresses = childData.progress.filter(
    (progress) => progress.status === ProgressStatus.IN_PROGRESS,
  );
  return (
    <>
      <div className="min-h-screen p-4 ">
        <ChildDashboardInteractive
          levels={levels}
          allBadges={badges}
          child={childData}
          roadmaps={roadmaps}
          currentProgresses={currentProgresses}
          userRole={userRole!}
        />
      </div>
    </>
  );
}
