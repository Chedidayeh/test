import {
  getAgeGroupsForAdmin,
  getStoryById,
} from "@/src/lib/content-service/server-api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { StoryEditClient } from "../../_components/StoryEditClient";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = (await params).id;
  const story = await getStoryById(resolvedParams);
  if (!story) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link href="/admin-dashboard/stories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Story Not Found</h1>
            <p className="text-slate-500 mt-1">
              The story you are trying to edit does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }
  console.log("Editing story:", story);
  console.log("Editing story chapters:", story.chapters);
  console.log("Editing story world:", story.chapters[1].challenge?.answers);

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
          <h1 className="text-2xl font-bold">Edit Story</h1>
          <p className="text-slate-500 mt-1">
            Edit an existing story in the platform
          </p>
        </div>
      </div>

      {/* Form */}
      <StoryEditClient worlds={worlds} story={story} />
    </div>
  );
}
