"use client";

import { TabsContent } from "@/src/components/ui/tabs";
import BadgeCard from "./BadgeCard";
import { Badge, ChildProfile } from "@readdly/shared-types";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useTranslations } from "next-intl";

interface AchievementsTabProps {
  selectedChild: ChildProfile | undefined;
  allAvailableBadges?: Badge[];
}

export default function AchievementsTab({
  selectedChild,
  allAvailableBadges,
}: AchievementsTabProps) {
  const t = useTranslations("ParentDashboard");
  const childCurrentLevel = selectedChild?.currentLevel;
  // Use all available badges if provided, otherwise show an empty list
  const displayBadges = allAvailableBadges ?? [];

  // Determine which badges are unlocked for the child.
  // A badge is considered unlocked when either:
  // - the badge's level number is <= the child's current level, or
  // - the child already has the badge recorded in their profile (`ChildProfile.badges`).
  const unlockedBadgeIds = new Set<string>();

  if (typeof childCurrentLevel === "number") {
    displayBadges.forEach((badge) => {
      const badgeLevelNumber = badge.level?.levelNumber;
      if (
        typeof badgeLevelNumber === "number" &&
        badgeLevelNumber <= childCurrentLevel
      ) {
        unlockedBadgeIds.add(badge.id);
      }
    });
  }

  // Also include badges explicitly earned by the child (if available)
  if (selectedChild?.badges?.length) {
    selectedChild.badges.forEach((cb) => unlockedBadgeIds.add(cb.badgeId));
  }

  const childName = selectedChild?.child?.name ?? t("unknown");

  return (
    <TabsContent value="achievements" className="space-y-4 md:space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 md:p-6 border border-black/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div>
            <h2 className="font-heading text-xl md:text-3xl text-foreground mb-2">
              {t("achievements.title")}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t("achievements.unlockedSummary", {
                unlocked: String(unlockedBadgeIds.size),
                total: String(displayBadges.length),
                plural: displayBadges.length !== 1 ? "s" : "",
                childName,
              })}
            </p>
          </div>
          {selectedChild?.childId && (
            <Link href={`/child-dashboard/${selectedChild.childId}`} className="w-full md:w-auto">
              <Button className="whitespace-nowrap w-full md:w-auto text-xs md:text-sm">
                {t("achievements.dashboardButton", { childName })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {displayBadges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
          {displayBadges.map((badge, index) => {
            const isUnlocked = unlockedBadgeIds.has(badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                index={index}
                isLocked={!isUnlocked}
                showDetails={isUnlocked}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-black/30 p-12 shadow-warm-lg text-center">
          <p className="text-2xl mb-2">{t("achievements.emptyTitle")}</p>
          <p className="text-muted-foreground">{t("achievements.emptyMessage")}</p>
        </div>
      )}
    </TabsContent>
  );
}
