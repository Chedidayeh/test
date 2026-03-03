import React from "react";
import ParentOnboarding from "./on-boarding";
import { auth } from "@/src/auth";
import { getAgeGroups } from "@/src/lib/content-service/server-api";

export default async function page() {
  const session = await auth();

  const ageGroups = await getAgeGroups();
  return (
    <div className="">
      <ParentOnboarding session={session} ageGroups={ageGroups} />
    </div>
  );
}
