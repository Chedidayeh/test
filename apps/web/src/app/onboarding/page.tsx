import React from "react";
import ParentOnboarding from "./on-boarding";
import { auth } from "@/src/auth";

export default async function page() {
  const session = await auth();
  return (
    <div className="">
      <ParentOnboarding session={session} />
    </div>
  );
}
