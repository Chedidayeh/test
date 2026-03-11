import type { Metadata } from "next";
import StoryReadingInteractive from "../_components/StoryReadingInteractive";
import MissingDataAlert from "@/src/components/shared/MissingDataAlert";
import { getStoryById } from "@/src/lib/content-service/server-api";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { RoleType } from "@readdly/shared-types";
import { getTranslations } from "next-intl/server";
export const metadata: Metadata = {
  title: "Story Reading - Readdly",
  description:
    "Immerse yourself in interactive stories with text-to-speech, adjustable settings, and embedded riddles for an engaging learning experience.",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const t = await getTranslations("StoryReadingInterface");

  const session = await auth();
  if (!session) {
    redirect("/");
  }
  if (session.user.role !== RoleType.ADMIN) {
    redirect("/");
  }
  const { id } = await params;

  if (!id) {
    return (
      <MissingDataAlert message={t("missingRequiredParameters")} />
    );
  }

  const story = await getStoryById(id);
  if (!story) {
    return (
      <MissingDataAlert message={t("storyNotFound")} />
    );
  }

  return (
    <>
      <StoryReadingInteractive story={story!} />
    </>
  );
}
