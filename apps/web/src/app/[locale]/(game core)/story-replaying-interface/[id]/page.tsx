import type { Metadata } from "next";
import { getStoryById } from "@/src/lib/content-service/server-api";
import StoryReplayingInteractive from "../_components/StoryReadingInteractive";
import { getTranslations } from "next-intl/server";
import MissingDataAlert from "@/src/components/shared/MissingDataAlert";

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

  const { id } = await params;
  const { childId } = (await searchParams) as {
    childId: string;
  };
  if (!id || !childId) {
    return <MissingDataAlert message={t("missingRequiredParameters")} />;
  }

  const story = await getStoryById(id);
  if (!story) {
    return <MissingDataAlert message={t("storyNotFound")} />;
  }

  if (!childId) {
    return <MissingDataAlert message={t("storyNotFound")} />;
  }

  return (
    <>
      <StoryReplayingInteractive story={story!} childId={childId} />
    </>
  );
}
