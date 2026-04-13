import { getAgeGroupsForAdmin } from "@/src/lib/content-service/server-api";
import { RoadmapsContent } from "./RoadmapsContent";


export default async function Page() {
  const ageGroups = await getAgeGroupsForAdmin();

  const roadmaps = ageGroups.map((ageGroup) => ageGroup.roadmaps).flat() || [];
  const worlds = roadmaps.map((roadmap) => roadmap!.worlds).flat() || [];
  
  // Extract themes from roadmaps and deduplicate by ID
  const allThemes = roadmaps.map((roadmap) => roadmap!.theme).filter((theme) => theme !== null) || [];
  const themes = Array.from(
    new Map(allThemes.map((theme) => [theme!.id, theme])).values()
  );
  // filter roadmaps from undefined values
  const filteredRoadmaps = roadmaps.filter((roadmap) => roadmap !== undefined);
  // filter worlds from undefined values
  const filteredWorlds = worlds.filter((world) => world !== undefined);
  // filter themes from undefined values
  const filteredThemes = themes.filter((theme) => theme !== undefined);
  return (
      <RoadmapsContent roadmaps={filteredRoadmaps} ageGroups={ageGroups} worlds={filteredWorlds} themes={filteredThemes} />
  );
}
