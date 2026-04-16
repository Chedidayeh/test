import { Metadata } from "next";
import ParentDashboardInteractive from "./_components/ParentDashboardInteractive";
import { auth } from "@/src/auth";
import { getChildProfilesByParent } from "@/src/lib/progress-service/server-api";
import { getBadges, getAgeGroups } from "@/src/lib/content-service/server-api";
import { RoleType } from "@readdly/shared-types";
import { getParentById } from "@/src/lib/auth-service/server-api";

export const metadata: Metadata = {
  title: "Parent Dashboard - Readdly",
  description:
    "Monitor your children's reading progress, view achievements, and get AI-powered insights about their learning journey.",
};

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ parentId: string }>;
}) {
  const { parentId } = (await searchParams) as {
    parentId: string;
  };
  const session = await auth();
  const sessionParentId = session?.user?.id;
  const userRole = session!.user!.role;

  const usedParentId = userRole === RoleType.PARENT ? sessionParentId! : parentId;
  const parentData = await getParentById(usedParentId);
  const childProfiles = await getChildProfilesByParent(usedParentId).catch(() => []);
  const badges = await getBadges().catch(() => []);
  const ageGroups = await getAgeGroups().catch(() => []);
  return (
    <div className="p-4">
      <ParentDashboardInteractive
        session={session!}
        parentData={parentData!}
        childProfiles={childProfiles}
        badges={badges}
        ageGroups={ageGroups}
        userRole={userRole}
      />
    </div>
  );
}
