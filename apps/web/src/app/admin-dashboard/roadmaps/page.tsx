import { getRoadmaps, getAgeGroups, getWorlds, getThemes } from "@/src/lib/content-service/server-api";
import { RoadmapsContent } from "./RoadmapsContent";


export default async function Page() {
  // Fetch data on the server
  const [roadmapsData, ageGroupsData, worldsData, themesData] = await Promise.all([
    getRoadmaps().catch(() => []),
    getAgeGroups().catch(() => []),
    getWorlds().catch(() => []),
    getThemes().catch(() => []),
  ]);

  const roadmaps = roadmapsData || [];
  const ageGroups = ageGroupsData || [];
  const worlds = worldsData || [];
  const themes = themesData || [];
  return (
      <RoadmapsContent roadmaps={roadmaps} ageGroups={ageGroups} worlds={worlds} themes={themes} />
  );
}
