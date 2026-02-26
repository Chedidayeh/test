import { getAgeGroupsForAdmin } from "@/src/lib/content-service/server-api";
import { RoadmapsContent } from "./RoadmapsContent";


export default async function Page() {
  const ageGroups = await getAgeGroupsForAdmin();

  const roadmaps = ageGroups.map((ageGroup) => ageGroup.roadmaps).flat() || [];
  const worlds = roadmaps.map((roadmap) => roadmap.worlds).flat() || [];
  const themes = roadmaps.map((roadmap) => roadmap.theme).filter((theme) => theme !== null) || [];
  return (
      <RoadmapsContent roadmaps={roadmaps} ageGroups={ageGroups} worlds={worlds} themes={themes} />
  );
}
