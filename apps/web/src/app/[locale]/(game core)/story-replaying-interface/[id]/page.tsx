import type { Metadata } from "next";
import { getStoryById } from "@/src/lib/content-service/server-api";
import { startStory } from "@/src/lib/progress-service/server-api";
import StoryReplayingInteractive from "../_components/StoryReadingInteractive";

export const metadata: Metadata = {
  title: "Story Reading - Readly",
  description:
    "Immerse yourself in interactive stories with text-to-speech, adjustable settings, and embedded riddles for an engaging learning experience.",
};

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ childId: string }>;
}) {
  const { id } = await params;
  const { childId } = (await searchParams) as {
    childId: string;
  };
  if (!id || !childId) {
    return (
      <div className="p-4 text-red-500">
        Missing required parameters: id, mode, or childId
      </div>
    );
  }

  const story = await getStoryById(id);
  if (!story) {
    return <div className="p-4 text-red-500">Story not found for id: {id}</div>;
  }

  if (!childId) {
    return (
      <div className="p-4 text-red-500">
        Child not found for childId: {childId}
      </div>
    );
  }

  return (
    <>
      <StoryReplayingInteractive
        story={story!}
        childId={childId}
      />
    </>
  );
}
