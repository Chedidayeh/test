import type { Metadata } from "next";
import RoadmapsLibrary from "./_components/RoadmapsLibrary";
import {
  getAgeGroups,
  getRoadmaps,
} from "@/src/lib/content-service/server-api";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { getParentWithProfiles } from "@/src/lib/progress-service/server-api";

export const metadata: Metadata = {
  title: "Story Library - Readly",
  description:
    "Discover and explore a magical collection of interactive stories for children. Browse by category, reading level, and progress status to find your next adventure.",
};

export default async function page() {
  const ageGroups = await getAgeGroups();
  const roadmaps = ageGroups.map((ageGroup) => ageGroup.roadmaps).flat();
  const session = await auth();
  const parentId = session!.user.id;
  const parentData = await getParentWithProfiles(parentId).catch(() => null);
  const children = parentData?.children || [];
  
  return <RoadmapsLibrary roadmaps={roadmaps} childrenList={children} />;
}
