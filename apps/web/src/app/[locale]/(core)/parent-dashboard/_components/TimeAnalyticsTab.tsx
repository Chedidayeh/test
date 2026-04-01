"use client";

import { TabsContent } from "@/src/components/ui/tabs";
import RiddlesStats from "./RiddlesStats";
import TimeAnalytics from "./TimeAnalytics";
import { ChildProfile } from "@readdly/shared-types";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

interface AnalyticsTabProps {
  selectedChild: ChildProfile; // Replace with actual type if available
}

export default function TimeAnalyticsTab({ selectedChild }: AnalyticsTabProps) {
  const t = useTranslations("ParentDashboard");
  
  if (!selectedChild) {
    return (
      <TabsContent value="time-analytics" className="space-y-4 md:space-y-6">
        <div className="text-center py-8 text-muted-foreground">
          {t("loading", { defaultValue: "Loading child data..." })}
        </div>
      </TabsContent>
    );
  }
  
  const childName = selectedChild?.child?.name ?? t("unknown");
  return (
    <TabsContent value="time-analytics" className="space-y-4 md:space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 md:p-6 border border-black/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div>
            <h2 className="font-heading text-xl md:text-3xl text-foreground mb-2">
              {t("timeAnalytics.title")}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t("timeAnalytics.description", { childName })}
            </p>
          </div>
          {selectedChild?.childId && (
            <Link href={`/child-dashboard/${selectedChild.childId}`} className="w-full md:w-auto">
              <Button className="whitespace-nowrap w-full md:w-auto text-xs md:text-sm">
                {t("timeAnalytics.dashboardButton", { childName })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div>
          <TimeAnalytics
            childProgress={selectedChild.progress}
            childProfile={selectedChild}
          />
        </div>
      </div>
    </TabsContent>
  );
}
