import { getAgeGroupsForAdmin } from "@/src/lib/content-service/server-api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { StoryCreateClient } from "../_components/StoryCreateClient";

export default async function NewStoryPage() {
  // Fetch data server-side
  const ageGroups = await getAgeGroupsForAdmin();
  const roadmaps = ageGroups.map((group) => group.roadmaps).flat();
  const worlds = roadmaps.map((roadmap) => roadmap.worlds).flat();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/admin-dashboard/stories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Story</h1>
          <p className="text-slate-500 mt-1">
            Add a new story to the platform
          </p>
        </div>
      </div>

      {/* Form */}
      <StoryCreateClient
        worlds={worlds}
      />
    </div>
  );
}
