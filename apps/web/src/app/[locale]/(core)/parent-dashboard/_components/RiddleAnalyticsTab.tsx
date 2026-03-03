"use client";

import { TabsContent } from "@/src/components/ui/tabs";
import RiddlesStats from "./RiddlesStats";
import { ChildProfile } from "@shared/types";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

interface AnalyticsTabProps {
  selectedChild: ChildProfile; 
}

export default function RiddleAnalyticsTab({ selectedChild }: AnalyticsTabProps) {
  const t = useTranslations("ParentDashboard");
  const childName = selectedChild?.child?.name ?? t("unknown");
  return (
    <TabsContent value="riddle-analytics" className="space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-6 border border-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-foreground mb-2">
              {t("riddleStatistics.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("riddleStatistics.description", { childName })}
            </p>
          </div>
          {selectedChild?.childId && (
            <Link href={`/child-dashboard/${selectedChild.childId}`}>
              <Button className="whitespace-nowrap">
                {t("riddleStatistics.dashboardButton", { childName })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <RiddlesStats childProgress={selectedChild.progress} />
        </div>
      </div>
    </TabsContent>
  );
}
