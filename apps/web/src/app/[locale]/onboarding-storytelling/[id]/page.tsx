import React from "react";
import ParentOnboarding from "./on-boarding";
import { auth } from "@/src/auth";
import { getAgeGroups } from "@/src/lib/content-service/server-api";
import { getChildById } from "@/src/lib/progress-service/server-api";
import { getTranslations } from "next-intl/server";
import MissingDataAlert from "@/src/components/shared/MissingDataAlert";
import { redirect } from "next/navigation";


export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("ChildDashboard");

  const session = await auth();
  const childProfileId = (await params).id;
  const childProfile = await getChildById(childProfileId);
  
  if(!childProfile){
    return <MissingDataAlert message={t("childNotFound")} />;
  }

  if(childProfile.storytelling?.onboardingCompleted === true){
    redirect(`/parent-dashboard`); 
  }

  return (
    <div className="">
      <ParentOnboarding session={session} childProfile={childProfile} />
    </div>
  );
}
