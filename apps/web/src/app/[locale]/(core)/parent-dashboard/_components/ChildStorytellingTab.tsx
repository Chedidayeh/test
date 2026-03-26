import { Button } from "@/src/components/ui/button";
import { TabsContent } from "@/src/components/ui/tabs";
import { ChildProfile } from "@readdly/shared-types";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, BookOpen, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";

interface ChildStorytellingTabProps {
  selectedChild: ChildProfile;
}

export default function ChildStorytellingTab({
  selectedChild,
}: ChildStorytellingTabProps) {
  const t = useTranslations("ParentDashboard");
  const childName = selectedChild?.child?.name ?? t("unknown");

  return (
    <TabsContent value="child-storytelling" className="space-y-4 md:space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 md:p-6 border border-black/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div>
            <h2 className="font-heading flex items-center justify-between text-xl md:text-3xl text-foreground mb-2">
              {t("childStorytelling.title")}{" "}
              {selectedChild?.storytelling?.onboardingCompleted ? (
                <Badge>{t("childStorytelling.activated")}</Badge>
              ) : null}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t("childStorytelling.description", { childName })}
            </p>
          </div>
          {selectedChild?.childId &&
          selectedChild?.storytelling?.onboardingCompleted === false ? (
            <Link
              href={`/onboarding-storytelling/${selectedChild.childId}`}
              className="w-full md:w-auto"
            >
              <Button className="whitespace-nowrap w-full md:w-auto text-xs md:text-sm">
                {t("childStorytelling.activateOption", { childName })}
              </Button>
            </Link>
          ) : (
            <Link
              href={`/child-dashboard/${selectedChild.childId}`}
              className="w-full md:w-auto"
            >
              <Button className="whitespace-nowrap w-full md:w-auto text-xs md:text-sm">
                {t("childStorytelling.dashboardButton", { childName })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4"></div>
    </TabsContent>
  );
}
