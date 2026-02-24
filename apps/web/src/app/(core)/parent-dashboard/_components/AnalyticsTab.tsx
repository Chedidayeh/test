"use client";

import { TabsContent } from "@/src/components/ui/tabs";
import RiddlesStats from "./RiddlesStats";
import TimeAnalytics from "./TimeAnalytics";
import { ChildProfile } from "@shared/types";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

interface AnalyticsTabProps {
  selectedChild: ChildProfile; // Replace with actual type if available
}

export default function AnalyticsTab({ selectedChild }: AnalyticsTabProps) {
  return (
    <TabsContent value="analytics" className="space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-6 border border-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-foreground mb-2">
              Detailed Analytics
            </h2>
            <p className="text-muted-foreground">
              In-depth insights into {selectedChild.child.name}&apos;s reading
              and problem-solving journey
            </p>
          </div>
          {selectedChild?.childId && (
            <Link href={`/child-dashboard/${selectedChild.childId}`}>
              <Button className="whitespace-nowrap">
                {selectedChild.child?.name || "Child"}&apos;s dashboard →
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧩</span>
            <h3 className="font-heading text-2xl text-foreground">
              Riddle Statistics
            </h3>
          </div>
          <RiddlesStats childProgress={selectedChild.progress} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏱️</span>
            <h3 className="font-heading text-2xl text-foreground">
              Time Analytics
            </h3>
          </div>
          <TimeAnalytics childProgress={selectedChild.progress} />
        </div>
      </div>
    </TabsContent>
  );
}
