"use client";

import { TabsContent } from "@/src/components/ui/tabs";
import {
  ChildProfile,
  RoleType,
  WeeklyAnalyticsReport,
} from "@readdly/shared-types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getWeeklyAnalyticsReportAction } from "@/src/lib/ai-service/server-actions";
import { toggleWeeklyReportsAction } from "@/src/lib/progress-service/server-actions";
import { Button } from "@/src/components/ui/button";
import {
  AlertCircle,
  Lightbulb,
  TrendingUp,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";

interface WeeklyReportsTabProps {
  selectedChild: ChildProfile;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  userRole: RoleType;
}

export default function WeeklyReportsTab({
  selectedChild,
  isActive,
  setIsActive,
  userRole,
}: WeeklyReportsTabProps) {
  const t = useTranslations("ParentDashboard");
  const [report, setReport] = useState<WeeklyAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [isToggling, setIsToggling] = useState(false);

  const childName = selectedChild?.child?.name ?? t("unknown");

  useEffect(() => {
    setIsActive(selectedChild?.activateWeeklyReports ?? false);
  }, [selectedChild?.activateWeeklyReports, setIsActive]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedChild?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const result = await getWeeklyAnalyticsReportAction(
          selectedChild.id,
          currentWeek,
        );

        if (result) {
          setReport(result.report);
          setTotalWeeks(result.totalWeeks);
        } else {
          setReport(null);
          setTotalWeeks(0);
        }
      } catch (err) {
        console.error("Error fetching weekly report:", err);
        setReport(null);
        setTotalWeeks(0);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [currentWeek, selectedChild?.id]);

  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < totalWeeks) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handleToggleWeeklyReports = async () => {
    try {
      setIsToggling(true);

      const result = await toggleWeeklyReportsAction(
        selectedChild.id,
        !isActive,
      );

      if (result?.success) {
        setIsActive(!isActive);
      } else {
        console.error("Failed to toggle weekly reports:", result?.error);
      }
    } catch (err) {
      console.error("Error toggling weekly reports:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <TabsContent value="weekly-reports" className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-4 md:p-6 border border-black/10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
          <div>
            <h2 className="font-heading text-xl flex items-center gap-2 md:text-3xl text-foreground mb-2">
              {t("weeklyReports.title")}
              <Badge variant={isActive ? "default" : "outline"} >
                {isActive
                  ? t("weeklyReports.active")
                  : t("weeklyReports.inactive")}
              </Badge>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t("weeklyReports.description", { childName })}
            </p>
          </div>
          {userRole === RoleType.PARENT && (
            <Button
              variant={"outline"}
              className="whitespace-nowrap w-full md:w-auto text-sm md:text-sm"
              onClick={handleToggleWeeklyReports}
              disabled={isToggling}
            >
              {isToggling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-r-transparent"></div>
                </>
              ) : isActive ? (
                t("weeklyReports.deactivateButton")
              ) : (
                t("weeklyReports.activateButton")
              )}
            </Button>
          )}
        </div>
      </div>
      {selectedChild.activateWeeklyReports ? (
        <>
          {/* Week Navigation */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                disabled={currentWeek === 1}
                className="text-xs md:text-sm md:block hidden"
              >
                {t("weeklyReports.previousWeek")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                disabled={currentWeek === 1}
                className="text-xs md:text-sm block md:hidden"
              >
                <ChevronLeft className="h-4 w-4 " />
              </Button>
            </div>
            <span className="px-3 py-1 bg-primary/10 rounded-lg text-sm font-medium">
              {t("weeklyReports.week", { week: currentWeek })}
            </span>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                disabled={currentWeek >= totalWeeks}
                className="text-xs md:text-sm md:block hidden"
              >
                {t("weeklyReports.nextWeek")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                disabled={currentWeek >= totalWeeks}
                className="text-xs md:text-sm block md:hidden"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-r-transparent mb-3"></div>
            </div>
          )}

          {/* Report Content */}
          {report && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Executive Summary */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 md:p-6">
                <div className="flex gap-3 items-start">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm md:text-base text-foreground mb-2">
                      {t("weeklyReports.executiveSummary")}
                    </h3>
                    <p className="text-xs md:text-base text-foreground/80 leading-relaxed">
                      {report.executiveSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Trends */}
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 md:p-6">
                <div className="flex gap-3 items-start">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm md:text-base text-foreground mb-2">
                      {t("weeklyReports.progressTrends")}
                    </h3>
                    <p className="text-xs md:text-base text-foreground/80 leading-relaxed">
                      {report.progressTrends}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 md:p-6">
                <div className="flex gap-3 items-start mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                  <h3 className="font-medium text-sm md:text-base text-foreground">
                    {t("weeklyReports.recommendations")}
                  </h3>
                </div>

                {report.recommendations && report.recommendations.length > 0 ? (
                  <ul className="space-y-2 md:space-y-3">
                    {report.recommendations.map((recommendation, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm md:text-base text-foreground/80"
                      >
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-semibold shrink-0 text-xs">
                          {index + 1}
                        </span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm md:text-base text-muted-foreground italic">
                    {t("weeklyReports.noRecommendations")}
                  </p>
                )}
              </div>

              {/* Report Timestamp */}
              <div className="text-sm text-muted-foreground text-center">
                {t("weeklyReports.generatedOn", {
                  date: new Date(report.createdAt).toLocaleDateString(),
                  time: new Date(report.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })}
              </div>
            </motion.div>
          )}

          {/* No Report Available */}
          {!report && !loading && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-6 md:p-8 text-center">
              <BookOpen className="h-10 w-10 text-secondary/60 mx-auto mb-3" />
              <h3 className="font-medium text-sm md:text-base text-foreground mb-2">
                {t("weeklyReports.noReportYet")}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto">
                {t("weeklyReports.reportAvailableSoon", { childName })}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className=" p-4 md:p-6 text-center">
          <AlertCircle className="h-5 w-5 text-foreground mx-auto mb-3" />
          <h3 className="font-medium text-sm md:text-base text-foreground mb-2">
            {t("weeklyReports.inactiveTitle")}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            {t("weeklyReports.inactiveDescription", { childName })}
          </p>
        </div>
      )}
    </TabsContent>
  );
}
