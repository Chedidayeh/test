import React from "react";
import ChildLogin from "./ChildLogin";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChildLogin />;
}
