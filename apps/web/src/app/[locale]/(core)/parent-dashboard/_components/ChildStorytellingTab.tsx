import { Button } from "@/src/components/ui/button";
import { TabsContent } from "@/src/components/ui/tabs";
import {
  ChildProfile,
  ProgressStatus,
  StorytellingStory,
} from "@readdly/shared-types";
import React, { useEffect, useState } from "react";
import { AlertCircle, ChevronRightIcon, BookOpen, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { useLocale } from "@/src/contexts/LocaleContext";
import { toggleStorytellingAction } from "@/src/lib/progress-service/server-actions";

interface ChildStorytellingTabProps {
  selectedChild: ChildProfile;
  activateStorytelling: boolean;
  setActivateStorytelling: (value: boolean) => void;
}

export default function ChildStorytellingTab({
  selectedChild,
  activateStorytelling,
  setActivateStorytelling,
}: ChildStorytellingTabProps) {
  const t = useTranslations("ParentDashboard");
  const { isRTL } = useLocale();
  const [isToggling, setIsToggling] = useState(false);

  const childName = selectedChild?.child?.name ?? t("unknown");

  useEffect(() => {
    setActivateStorytelling(selectedChild?.storytelling?.isActive ?? false);
  }, [selectedChild?.storytelling?.isActive, setActivateStorytelling]);

  // Handler to toggle storytelling
  const handleToggleStorytelling = async () => {
    if (!selectedChild.storytelling) return;

    setIsToggling(true);
    try {
      const result = await toggleStorytellingAction(
        selectedChild.id,
        !activateStorytelling,
      );

      if (result.success) {
        setActivateStorytelling(!activateStorytelling);
      } else {
        console.error("Failed to toggle storytelling:", result.error);
      }
    } catch (error) {
      console.error("Error toggling storytelling:", error);
    } finally {
      setIsToggling(false);
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case ProgressStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case ProgressStatus.NOT_STARTED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status: ProgressStatus): string => {
    switch (status) {
      case ProgressStatus.COMPLETED:
        return t("childStorytelling.status.completed");
      case ProgressStatus.IN_PROGRESS:
        return t("childStorytelling.status.inProgress");
      case ProgressStatus.NOT_STARTED:
        return t("childStorytelling.status.notStarted");
      default:
        return status;
    }
  };
  return (
    <TabsContent value="child-storytelling" className="space-y-4 md:space-y-6">
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 md:p-6 border border-black/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div>
            <h2 className="font-heading flex items-center justify-between text-xl md:text-3xl text-foreground mb-2">
              {t("childStorytelling.title")}{" "}
              {selectedChild?.storytelling?.isActive ? (
                <Badge>{t("childStorytelling.activated")}</Badge>
              ) : (
                <Badge variant="outline">
                  {t("childStorytelling.deactivated")}
                </Badge>
              )}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t("childStorytelling.description", { childName })}
            </p>
          </div>

          {/* 1. Onboarding NOT completed */}
          {!selectedChild.storytelling?.onboardingCompleted ? (
            <Link
              href={`/onboarding-storytelling/${selectedChild.childId}`}
              className="w-full md:w-auto"
            >
              <Button
                variant="outline"
                className="whitespace-nowrap w-full md:w-auto text-xs md:text-sm"
              >
                {t("childStorytelling.activateOption", { childName })}
              </Button>
            </Link>
          ) : (
            /* 2 & 3: Onboarding completed */
            <Button
              onClick={handleToggleStorytelling}
              disabled={isToggling}
              variant="outline"
              className="whitespace-nowrap w-full md:w-auto text-xs md:text-sm"
            >
              {isToggling ? (
                <Loader2 className="animate-spin text-primary" />
              ) : selectedChild.storytelling?.isActive ? (
                t("childStorytelling.deactivateOption")
              ) : (
                t("childStorytelling.activateOption", { childName })
              )}
            </Button>
          )}
        </div>
      </div>

      {selectedChild.storytelling?.isActive ? (
        <>
          {selectedChild.storytelling?.stories &&
          selectedChild.storytelling.stories.length > 0 ? (
            <div className="space-y-4">
              <div>
                {/* <Link href={"/storytelling"}>
                  <Button variant={"link"} className="px-0 text-sm">
                    {t("childStorytelling.viewAll")} <ChevronRightIcon />
                  </Button>
                </Link> */}
                <div className="space-y-3 mt-4">
                  {selectedChild.storytelling.stories.map(
                    (story: StorytellingStory) => (
                      <div
                        key={story.id}
                        className="bg-background border bg-card rounded-lg p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-warm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Story Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-base md:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                              {story.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("childStorytelling.generatedDate")}{" "}
                              {new Date(story.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Status Badge and Chevron */}
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(
                                story.status,
                              )}`}
                            >
                              {getStatusLabel(story.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-6 text-center border border-dashed border-black/20 rounded-lg bg-background/50">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="font-medium text-sm md:text-base text-foreground mb-2">
                {t("childStorytelling.noStoriesTitle")}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto">
                {t("childStorytelling.noStoriesDescription", { childName })}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className=" p-4 md:p-6 text-center">
            <AlertCircle className="h-5 w-5 text-foreground mx-auto mb-3" />
            <h3 className="font-medium text-sm md:text-base text-foreground mb-2">
              {t("childStorytelling.inactiveTitle")}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              {t("childStorytelling.inactiveDescription", { childName })}
            </p>
          </div>
        </>
      )}
    </TabsContent>
  );
}
