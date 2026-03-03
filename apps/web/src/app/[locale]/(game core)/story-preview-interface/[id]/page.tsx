import type { Metadata } from "next";
import StoryReadingInteractive from "../_components/StoryReadingInteractive";
import { getStoryById } from "@/src/lib/content-service/server-api";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { RoleType } from "@shared/types";
export const metadata: Metadata = {
  title: "Story Reading - Readly",
  description:
    "Immerse yourself in interactive stories with text-to-speech, adjustable settings, and embedded riddles for an engaging learning experience.",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  if(session.user.role !== RoleType.ADMIN) {
    redirect("/");
  }
  const { id } = await params;

  if (!id) {
    return (
      <div className="p-4 text-red-500">
        Missing required parameters: id
      </div>
    );
  }

  const story = await getStoryById(id);
  if (!story) {
    return <div className="p-4 text-red-500">Story not found for id: {id}</div>;
  }

  return (
    <>
      <StoryReadingInteractive story={story!} />
    </>
  );
}
