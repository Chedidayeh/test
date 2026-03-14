import type { Metadata } from "next";
import StoryReadingInteractive from "../_components/StoryReadingInteractive";
import { getStoryById } from "@/src/lib/content-service/server-api";
import {
  createNewCheckpointSession,
  startStory,
} from "@/src/lib/progress-service/server-api";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MissingDataAlert from "@/src/components/shared/MissingDataAlert";
import { auth } from "@/src/auth";
import { RoleType } from "@readdly/shared-types";

export const metadata: Metadata = {
  title: "Story Reading - Readdly",
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
  const t = await getTranslations("StoryReadingInterface");

  const session = await auth();
  if (!session) {
    redirect("/");
  }

  if (session.user.role === RoleType.ADMIN) {
    redirect("/");
  }

  const { id } = await params;
  const { childId } = (await searchParams) as {
    childId: string;
  };
  if (!id || !childId) {
    return (
      <MissingDataAlert message={t("missingRequiredParameters")} />
    );
  }

  const story = await getStoryById(id);
  if (!story) {
    return (
      <MissingDataAlert message={t("storyNotFound")} />
    )
  }

  const currentProgress = await startStory(childId, id); // returned progress contains the current game session
  if (!currentProgress) {
    return (
      <MissingDataAlert message={t("unableToStartStory")} />
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
