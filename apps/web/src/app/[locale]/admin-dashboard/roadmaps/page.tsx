import { getAgeGroupsForAdmin } from "@/src/lib/content-service/server-api";
import { RoadmapsContent } from "./RoadmapsContent";


export default async function Page() {
  const ageGroups = await getAgeGroupsForAdmin();

  const roadmaps = ageGroups.map((ageGroup) => ageGroup.roadmaps).flat() || [];
  const worlds = roadmaps.map((roadmap) => roadmap.worlds).flat() || [];
  
  // Extract themes from roadmaps and deduplicate by ID
  const allThemes = roadmaps.map((roadmap) => roadmap.theme).filter((theme) => theme !== null) || [];
  const themes = Array.from(
    new Map(allThemes.map((theme) => [theme.id, theme])).values()
  );
  
  return (
      <RoadmapsContent roadmaps={roadmaps} ageGroups={ageGroups} worlds={worlds} themes={themes} />
  );
}
