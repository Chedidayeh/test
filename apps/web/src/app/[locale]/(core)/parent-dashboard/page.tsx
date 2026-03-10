import { Metadata } from "next";
import ParentDashboardInteractive from "./_components/ParentDashboardInteractive";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { getParentWithProfiles } from "@/src/lib/progress-service/server-api";
import { getBadges, getAgeGroups } from "@/src/lib/content-service/server-api";
import { RoleType } from "@shared/types";

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
  // Fetch data on the server
  const parentData = await getParentWithProfiles(
    userRole === RoleType.PARENT ? sessionParentId! : parentId,
  ).catch(() => null);
  const badges = await getBadges().catch(() => []);
  const ageGroups = await getAgeGroups().catch(() => []);
  return (
    <div className="min-h-screen p-4">
      <ParentDashboardInteractive
        session={session!}
        parentData={parentData}
        badges={badges}
        ageGroups={ageGroups}
        userRole={userRole}
      />
    </div>
  );
}
