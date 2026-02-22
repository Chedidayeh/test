import React from "react";
import StorySetup from "./StorySetup";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <StorySetup />;
}
