import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { getStories, getAgeGroups, getWorlds } from "@/src/lib/content-service/server-api";
import { StoriesContent } from "./_components/StoriesContent";

export default async function StoriesPage() {
  // Fetch data on the server
  const [storiesData] = await Promise.all([
    getStories({ limit: 10 }).catch(() => ({
      stories: [],
      pagination: { total: 0, page: 1, pageSize: 10, hasMore: false },
    })),
    getAgeGroups().catch(() => []),
    getWorlds().catch(() => []),
  ]);

  const stories = storiesData.stories || [];
  const pagination = storiesData.pagination || { total: 0, page: 1, pageSize: 2, hasMore: false };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stories</h1>
          <p className="text-slate-500 mt-1">
            Manage all stories with their chapters and challenges
          </p>
        </div>
        <Link href="/admin-dashboard/stories/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Story
          </Button>
        </Link>
      </div>

      {/* Content with Suspense */}
      <StoriesContent stories={stories} pagination={pagination} />
    </div>
  );
}
