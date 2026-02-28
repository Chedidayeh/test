import { Metadata } from "next";
import ParentDashboardInteractive from "./_components/ParentDashboardInteractive";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { getParentWithProfiles } from "@/src/lib/progress-service/server-api";
import { getBadges } from "@/src/lib/content-service/server-api";

export const metadata: Metadata = {
  title: "Parent Dashboard - Readly",
  description:
    "Monitor your children's reading progress, view achievements, and get AI-powered insights about their learning journey.",
};

export default async function ParentDashboardPage() {
  const session = await auth();
  const parentId = session?.user?.id;
  if (!parentId) {
    redirect("/");
  }
  // Fetch data on the server
  const parentData = await getParentWithProfiles(parentId).catch(() => null);
  const badges = await getBadges().catch(() => []);
  return (
    <div className="min-h-screen p-4 ">
      <ParentDashboardInteractive parentData={parentData} badges={badges} />
    </div>
  );
}