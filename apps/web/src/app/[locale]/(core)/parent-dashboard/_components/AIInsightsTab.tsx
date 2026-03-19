"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AIProgressInsight, ChildProfile, ReadingLevel } from "@readdly/shared-types";
import { getChildAnalyticsAction } from "@/src/lib/ai-service/server-actions";
import { AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Spinner } from "@/src/components/ui/spinner";
import { TabsContent } from "@/src/components/ui/tabs";

interface AIInsightsTabProps {
  selectedChild: ChildProfile;
}

export default function AIInsightsTab({ selectedChild }: AIInsightsTabProps) {
  const t = useTranslations("ParentDashboard.aiInsights");
  const [insights, setInsights] = useState<AIProgressInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getChildAnalyticsAction(selectedChild.id);
      if (result.success && result.data) {
        setInsights(result.data);
      } else {
        setError(result.error || "Failed to fetch analytics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  } , [selectedChild.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, selectedChild.id]);

  if (loading) {
    return (
      <TabsContent value="ai-insights" className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center py-12">
          <Spinner className="mx-auto animate-spin" />
        </div>
      </TabsContent>
    );
  }

  if (error) {
    return (
      <TabsContent value="ai-insights" className="space-y-4 md:space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{t("error.fetchFailed")}</span>
              <Button onClick={fetchAnalytics} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("action.retry")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </TabsContent>
    );
  }

  if (insights.length === 0) {
    return (
      <TabsContent value="ai-insights" className="space-y-4 md:space-y-6">
        <div className="bg-secondary/50 border border-secondary rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">{t("message.noInsights")}</p>
          <p className="text-sm text-muted-foreground">{t("message.noInsightsSubtext", { childName: selectedChild.name })}</p>
        </div>
      </TabsContent>
    );
  }

  const currentInsight = insights[0]; // Most recent
  const previousInsights = insights.slice(1); // Historical

  return (
    <TabsContent value="ai-insights" className="space-y-4 md:space-y-6">
      <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("title.currentInsights")}</h2>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("action.refresh")}
        </Button>
      </div>

      {/* Current Insight Card */}
      <CurrentInsightCard insight={currentInsight} />

      {/* Metrics Grid */}
      <MetricsGrid insight={currentInsight} />

      {/* Historical Insights */}
      {previousInsights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("title.historicalInsights")}</h3>
          <div className="space-y-3">
            {previousInsights.map((insight) => (
              <HistoricalInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
      </div>
    </TabsContent>
  );
}

interface CurrentInsightCardProps {
  insight: AIProgressInsight;
}

function CurrentInsightCard({ insight }: CurrentInsightCardProps) {
  const t = useTranslations("ParentDashboard.aiInsights");
  const readingLevelColor = getReadingLevelColor(insight.readingLevel);

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      {/* Header: Reading Level & Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {t("label.readingLevel")}
          </p>
          <div className={`text-2xl font-bold ${readingLevelColor}`}>
            {insight.readingLevel}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {t("label.engagementScore")}
          </p>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">{insight.engagementScore}%</div>
            <EngagementProgressBar score={insight.engagementScore} />
          </div>
        </div>
      </div>

      {/* Period */}
      <div className="pb-4 border-b">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {t("label.period")}
        </p>
        <p className="text-sm">
          {formatDate(insight.periodStart)} — {formatDate(insight.periodEnd)}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("label.strengths")}
          </h4>
          <ul className="space-y-2">
            {insight.insights.strengths.map((strength, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-3">
            {t("label.weaknesses")}
          </h4>
          <ul className="space-y-2">
            {insight.insights.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="text-orange-600 dark:text-orange-400 font-bold">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      {insight.insights.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">{t("label.recommendations")}</h4>
          <div className="space-y-2">
            {insight.insights.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-secondary/50 border border-secondary rounded p-3 text-sm">
                <p className="font-medium text-sm mb-1">
                  {rec.storyTitle && `${rec.storyTitle} - `}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(rec.storyDifficulty)}`}>
                    {rec.storyDifficulty}
                  </span>
                </p>
                <p className="text-muted-foreground">{rec.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {insight.insights.tips.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">{t("label.tips")}</h4>
          <ul className="space-y-2">
            {insight.insights.tips.map((tip, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {insight.insights.summary && (
        <div className="bg-accent/10 border border-accent rounded p-4">
          <p className="text-sm font-medium mb-2">{t("label.summary")}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {insight.insights.summary}
          </p>
        </div>
      )}
    </div>
  );
}

interface MetricsGridProps {
  insight: AIProgressInsight;
}

function MetricsGrid({ insight }: MetricsGridProps) {
  const t = useTranslations("ParentDashboard.aiInsights");
  const metrics = insight.metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Stories */}
      <MetricCard
        label={t("metric.totalStoriesCompleted")}
        value={metrics.totalStoriesCompleted}
        unit=""
      />

      {/* Success Rate */}
      <MetricCard
        label={t("metric.successRate")}
        value={metrics.successRate}
        unit="%"
      />

      {/* Challenges */}
      <MetricCard
        label={t("metric.challengesAttempted")}
        value={`${metrics.totalChallengesSolved} / ${metrics.totalChallengesAttempted}`}
        unit=""
      />

      {/* Avg Attempts */}
      <MetricCard
        label={t("metric.avgAttemptsPerChallenge")}
        value={metrics.averageAttemptsPerChallenge.toFixed(1)}
        unit=""
      />

      {/* Hint Dependency */}
      <MetricCard
        label={t("metric.hintDependencyRate")}
        value={metrics.hintDependencyRate}
        unit="%"
      />

      {/* Stars */}
      <MetricCard
        label={t("metric.starsEarned")}
        value={metrics.starsEarned}
        unit="⭐"
      />

      {/* Time Spent */}
      <MetricCard
        label={t("metric.totalTimeSpent")}
        value={formatMilliseconds(metrics.totalTimeSpent)}
        unit=""
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
}

function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </div>
  );
}

interface HistoricalInsightCardProps {
  insight: AIProgressInsight;
}

function HistoricalInsightCard({ insight }: HistoricalInsightCardProps) {
  const t = useTranslations("ParentDashboard.aiInsights");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full text-left bg-secondary/50 border rounded-lg p-4 hover:bg-secondary/70 transition-colors"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="font-medium">
            {formatDate(insight.periodStart)} — {formatDate(insight.periodEnd)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("label.readingLevel")}: {insight.readingLevel} | {t("label.engagementScore")}:{" "}
            {insight.engagementScore}%
          </p>
        </div>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">{t("label.keyMetrics")}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                {t("metric.successRate")}: <span className="font-semibold">{insight.metrics.successRate}%</span>
              </p>
              <p>
                {t("metric.starsEarned")}: <span className="font-semibold">{insight.metrics.starsEarned}</span>
              </p>
              <p>
                {t("metric.totalStoriesCompleted")}:{" "}
                <span className="font-semibold">{insight.metrics.totalStoriesCompleted}</span>
              </p>
              <p>
                {t("metric.avgAttemptsPerChallenge")}:{" "}
                <span className="font-semibold">
                  {insight.metrics.averageAttemptsPerChallenge.toFixed(1)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

// Utility Functions

function getReadingLevelColor(level: string): string {
  switch (level) {
    case ReadingLevel.BEGINNER:
      return "text-blue-600 dark:text-blue-400";
    case ReadingLevel.EASY:
      return "text-green-600 dark:text-green-400";
    case ReadingLevel.MEDIUM:
      return "text-yellow-600 dark:text-yellow-400";
    case ReadingLevel.HARD:
      return "text-orange-600 dark:text-orange-400";
    case ReadingLevel.ADVANCED:
      return "text-red-600 dark:text-red-400";
    default:
      return "text-foreground";
  }
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200";
    case "MEDIUM":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200";
    case "HARD":
      return "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function EngagementProgressBar({ score }: { score: number }) {
  const percentage = Math.min(Math.max(score, 0), 100);
  const color =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 60
        ? "bg-yellow-500"
        : percentage >= 40
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatMilliseconds(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
