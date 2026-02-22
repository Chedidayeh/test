import type { Metadata } from "next";
import StoryReadingInteractive from "../_components/StoryReadingInteractive";
import { getStoryById } from "@/src/lib/content-service/server-api";
import {
  startStory,
} from "@/src/lib/progress-service/server-api";

export const metadata: Metadata = {
  title: "Story Reading - Readly",
  description:
    "Immerse yourself in interactive stories with text-to-speech, adjustable settings, and embedded riddles for an engaging learning experience.",
};

export default async function StoryReadingInterfacePage({
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

  const currentProgress = await startStory(childId, id); // returned progress contains the current game session
  console.log("Created new progress record:", currentProgress);

  return (
    <>
      <StoryReadingInteractive story={story!} currentProgress={currentProgress} />
    </>
  );
}
