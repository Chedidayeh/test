import type { Metadata } from "next";
import StoryReadingInteractive from "../_components/StoryReadingInteractive";
import { getStoryById } from "@/src/lib/content-service/server-api";
import { createNewCheckpointSession, startStory } from "@/src/lib/progress-service/server-api";
import { redirect } from "next/navigation";

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

  const currentProgress = await startStory(childId, id); // returned progress contains the current game session
  if (!currentProgress) {
    return (
      <div className="p-4 text-red-500">
        Child progress not found for childId: {childId} and storyId: {id}
      </div>
    );
  }
  // create new checkpoint session
  const checkpoint = await createNewCheckpointSession(
    currentProgress.gameSession!.id,
  );
  console.log("Created new checkpoint session:", checkpoint);

  let mode: "start" | "continue" | "replay";

  if (currentProgress?.gameSession?.endedAt != null) {
    mode = "replay";
  } else if (currentProgress?.gameSession?.checkpointAt != null) {
    mode = "continue";
  } else {
    mode = "start";
    // create new checkpoint session
  }
  if (mode === "replay") {
    redirect(`/story-replaying-interface/${id}?childId=${childId}`);
  }

  return (
    <>
      {mode === "continue" || mode === "start" ? (
        <StoryReadingInteractive
          story={story!}
          currentProgress={currentProgress}
          childId={childId}
        />
      ) : null}
    </>
  );
}
