"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Progress, Story, Challenge, ChallengeAttempt, ChallengeStatus, Local, LanguageCode } from "@readdly/shared-types";
import { calculateChallengeStats, getAggregatedChallengeStats, localizeChallengStats, LocalizedChallengeStats } from "../_lib/stats";
import { fetchStoriesByIdsAction } from "@/src/lib/content-service/server-actions";
import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getLanguageCode } from "@/src/lib/translation-utils";
import { useLocale } from "@/src/contexts/LocaleContext";

interface RiddlesStatsProps {
  childProgress: Progress[];
}

export default function RiddlesStats({ childProgress }: RiddlesStatsProps) {
  const t = useTranslations("ParentDashboard");
  const {locale} = useLocale();



  const langCode = getLanguageCode(locale);

  // Calculate challenge statistics from real progress data
  const challengeStats = useMemo(
    () => calculateChallengeStats(childProgress),
    [childProgress]
  );

  // Get aggregated stats
  const aggregatedStats = useMemo(
    () => getAggregatedChallengeStats(childProgress),
    [childProgress]
  );

  // Fetch stories for displaying challenge context
  const [stories, setStories] = useState<Map<string, Story>>(new Map());
  const [loading, setLoading] = useState(false);
  const [sortedChallengeStats, setSortedChallengeStats] = useState<LocalizedChallengeStats[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<{
    challengeId: string;
    storyId: string;
    challenge: Challenge | null;
    attempts: ChallengeAttempt[];
  } | null>(null);

  useEffect(() => {
    const loadStories = async () => {
      if (challengeStats.length === 0) return;

      // Extract unique story IDs from challenge stats
      const uniqueStoryIds = Array.from(
        new Set(challengeStats.map((stat) => stat.storyId))
      );

      setLoading(true);
      try {
        const result = await fetchStoriesByIdsAction(uniqueStoryIds);
        if (result.success) {
          // Build map for O(1) lookup
          const storyMap = new Map<string, Story>();
          for (const story of result.stories) {
            storyMap.set(story.id, story);
          }
          setStories(storyMap);

          // Sort challenge stats by story order and chapter order
          const sorted = [...challengeStats].sort((a, b) => {
            const storyA = storyMap.get(a.storyId);
            const storyB = storyMap.get(b.storyId);

            // Sort by story order first
            if (storyA && storyB) {
              if (storyA.order !== storyB.order) {
                return storyA.order - storyB.order;
              }

              // If same story order, sort by story ID to keep stories grouped
              if (a.storyId !== b.storyId) {
                return a.storyId.localeCompare(b.storyId);
              }

              // Within same story, sort by chapter order
              let chapterOrderA = 999;
              let chapterOrderB = 999;

              if (storyA.chapters) {
                for (const chapter of storyA.chapters) {
                  if (chapter.challenge?.id === a.id) {
                    chapterOrderA = chapter.order;
                    break;
                  }
                }
              }

              if (storyB.chapters) {
                for (const chapter of storyB.chapters) {
                  if (chapter.challenge?.id === b.id) {
                    chapterOrderB = chapter.order;
                    break;
                  }
                }
              }

              return chapterOrderA - chapterOrderB;
            }

            return 0;
          });

          // Localize stats with story and chapter titles
          const localizedStats = localizeChallengStats(sorted, Array.from(storyMap.values()), locale);
          setSortedChallengeStats(localizedStats);
        }
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [challengeStats, locale]);

  const { totalChallenges, solvedChallenges, successRate, avgAttemptsPerChallenge } =
    aggregatedStats;

  /**
   * Get localized challenge content (question, description, hints)
   */
  const getLocalizedChallenge = (challenge: Challenge | null) => {
    if (!challenge) return null;
    const translation = challenge.translations?.find((t) => t.languageCode === langCode);
    return {
      question: translation?.question || challenge.question,
      description: translation?.description || challenge.description,
      hints: translation?.hints || challenge.hints,
    };
  };

  /**
   * Get localized answer text
   */
  const getLocalizedAnswerText = (answer: { id: string; text: string; translations?: Array<{ languageCode: string; text: string }> }) => {
    const translation = answer.translations?.find((t) => t.languageCode === langCode);
    return translation?.text || answer.text;
  };

  /**
   * Get all challenge attempts for a specific challenge
   * Extracts attempts from progress data by looping through game sessions
   * Note: Attempts are already deduplicated at the source (stats.ts level)
   */
  const getChallengeAttempts = (challengeId: string): ChallengeAttempt[] => {
    const attemptsMap = new Map<string, ChallengeAttempt>();
    
    childProgress?.forEach((progress) => {
      if (progress.gameSession?.challengeAttempts) {
        const challengeAttempts = progress.gameSession.challengeAttempts.filter(
          (attempt) => attempt.challengeId === challengeId
        );
        challengeAttempts.forEach((attempt) => {
          // Additional safeguard: deduplicate by ID
          attemptsMap.set(attempt.id, attempt);
        });
      }
    });
    
    return Array.from(attemptsMap.values()).sort((a, b) => a.attemptNumber - b.attemptNumber);
  };

  /**
   * Get the correct answer text based on challenge type
   */
  const getCorrectAnswer = (challenge: Challenge | null): string => {
    if (!challenge) return t("riddleStatistics.na");

    if (challenge.type === "CHOOSE_ENDING" || challenge.type === "MORAL_DECISION") {
      return t("riddleStatistics.multipleAnswers");
    }

    const correctAnswer = challenge.answers?.find((a) => a.isCorrect);
    return correctAnswer ? getLocalizedAnswerText(correctAnswer) : t("riddleStatistics.noCorrectAnswer");
  };

  /**
   * Get status badge color based on challenge status
   */
  const getStatusColor = (status: ChallengeStatus): string => {
    switch (status) {
      case "SOLVED":
        return "bg-green-100 text-green-700";
      case "INCORRECT":
        return "bg-red-100 text-red-700";
      case "SKIPPED":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /**
   * Get display name for a challenge: "Story Name - Chapter #"
   * Matches challenge ID with chapters to find correct chapter order
   */
  const getChallengeDisplayName = (storyId: string, challengeId: string): string => {
    const story = stories.get(storyId);
    if (!story) {
      return `Story ${storyId.substring(0, 8)}...`;
    }

    // Find which chapter contains this challenge by matching challenge IDs
    if (story.chapters) {
      for (const chapter of story.chapters) {
        if (chapter.challenge?.id === challengeId) {
          return `${story.title} - Chapter ${chapter.order}`;
        }
      }
    }

    // Fallback if challenge not found in any chapter
    return `${story.title} - Challenge ${challengeId.substring(0, 8)}...`;
  };

  /**
   * Get full challenge data by matching challenge ID in a story
   */
  const getChallengeData = (storyId: string, challengeId: string): Challenge | null => {
    const story = stories.get(storyId);
    if (!story || !story.chapters) {
      return null;
    }

    for (const chapter of story.chapters) {
      if (chapter.challenge?.id === challengeId) {
        return chapter.challenge;
      }
    }

    return null;
  };

  /**
   * Handle row click to open challenge details modal
   */
  const handleChallengeClick = (storyId: string, challengeId: string) => {
    const challengeData = getChallengeData(storyId, challengeId);
    const attempts = getChallengeAttempts(challengeId);
    setSelectedChallenge({
      challengeId,
      storyId,
      challenge: challengeData,
      attempts,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg bg-linear-to-br from-purple-200/20 to-indigo-200/20 border border-purple-200 dark:border-purple-200/50  p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("riddleStatistics.stats.totalChallenges")}</p>
          <p className="text-3xl font-data font-bold text-purple-600">
            {totalChallenges}
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-green-200/20 to-emerald-200/20 border border-green-200 dark:border-green-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("riddleStatistics.stats.solved")}</p>
          <p className="text-3xl font-data font-bold text-green-600">
            {solvedChallenges}
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-blue-200/20 to-cyan-200/20 border border-blue-200 dark:border-blue-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("riddleStatistics.stats.successRate")}</p>
          <p className="text-3xl font-data font-bold text-blue-600">
            {successRate}%
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-orange-200/20 to-red-200/20 border border-orange-200 dark:border-orange-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">{t("riddleStatistics.stats.avgAttempts")}</p>
          <p className="text-3xl font-data font-bold text-orange-600">
            {avgAttemptsPerChallenge}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg overflow-x-auto">
        <h3 className="font-heading text-lg text-foreground mb-4">
          {t("riddleStatistics.stats.detailedTitle")}
        </h3>
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <span className="font-medium">{t("riddleStatistics.tipPrefix")}</span> {t("riddleStatistics.tip")}
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size={20} className="animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">{t("riddleStatistics.loading")}</p>
          </div>
        ) : challengeStats.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("riddleStatistics.noAttempts")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("riddleStatistics.tableHeaders.storyChapter")}</TableHead>
                <TableHead>{t("riddleStatistics.tableHeaders.status")}</TableHead>
                <TableHead>{t("riddleStatistics.tableHeaders.attempts")}</TableHead>
                <TableHead className="text-right">{t("riddleStatistics.tableHeaders.successRate")}</TableHead>
                <TableHead className="text-right">{t("riddleStatistics.tableHeaders.hintsUsed")}</TableHead>
                <TableHead className="text-right">{t("riddleStatistics.tableHeaders.timeSec")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedChallengeStats.map((challenge) => (
                <TableRow
                  key={challenge.id}
                  onClick={() => handleChallengeClick(challenge.storyId, challenge.id)}
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-200"
                >
                  <TableCell className="font-medium">
                    {loading ? (
                      <span className="text-muted-foreground text-sm">{t("riddleStatistics.loading")}</span>
                    ) : (
                        `${challenge.storyTitle} - ${t("riddleStatistics.chapter")} ${challenge.chapterIndex ?? "?"}`
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        challenge.status === "SOLVED"
                          ? "default"
                          : challenge.status === "SKIPPED"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {challenge.status === "SOLVED"
                        ? t("riddleStatistics.status.solved")
                        : challenge.status === "SKIPPED"
                        ? t("riddleStatistics.status.skipped")
                        : t("riddleStatistics.status.notAttempted")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{challenge.totalAttempts}</TableCell>
                  <TableCell className="text-right font-medium">
                    {challenge.successRate}%
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {challenge.hintsUsed}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {challenge.timeSpentSeconds}s
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Challenge Details Modal */}
      <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedChallenge && (() => {
                const localizedStat = sortedChallengeStats.find((s) => s.id === selectedChallenge.challengeId);
                return localizedStat 
                  ? `${localizedStat.storyTitle} - ${t("riddleStatistics.chapter")} ${localizedStat.chapterIndex ?? "?"}`
                  : getChallengeDisplayName(selectedChallenge.storyId, selectedChallenge.challengeId);
              })()}
            </DialogTitle>
            <DialogDescription>
              {t("riddleStatistics.modal.title")}
            </DialogDescription>
          </DialogHeader>

          {selectedChallenge?.challenge && (
            <div className="space-y-6">
              {/* Challenge Type and Question */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedChallenge.challenge.type}</Badge>
                </div>
                <h3 className="font-medium text-lg">{t("riddleStatistics.modal.questionLabel")} {getLocalizedChallenge(selectedChallenge.challenge)?.question}</h3>
              </div>

              {/* Correct Answer */}
              <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">{t("riddleStatistics.modal.correctAnswerLabel")}</p>
                <p className="text-sm text-green-800 dark:text-green-200">{getCorrectAnswer(selectedChallenge.challenge)}</p>
              </div>

              {/* Answers Options */}
              {selectedChallenge.challenge.answers && selectedChallenge.challenge.answers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">{t("riddleStatistics.modal.optionsLabel")}</h4>
                  <div className="space-y-2">
                    {selectedChallenge.challenge.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className={`p-3 rounded-lg border`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{getLocalizedAnswerText(answer)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              {getLocalizedChallenge(selectedChallenge.challenge)?.hints && getLocalizedChallenge(selectedChallenge.challenge)!.hints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">{t("riddleStatistics.modal.hintsLabel")}</h4>
                  <div className="space-y-2">
                    {getLocalizedChallenge(selectedChallenge.challenge)?.hints.map((hint, index) => (
                      <div key={index} className="p-2 px-4 border rounded-lg">
                        <p className="font-medium text-sm text-muted-foreground">{t("riddleStatistics.modal.hintNumber", { n: index + 1 })}</p>
                        <p className="text-sm mt-1">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Child Attempt Actions */}
              {selectedChallenge.attempts && selectedChallenge.attempts.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">{t("riddleStatistics.modal.childAttemptsTitle")}</h4>
                  <div className="space-y-4">
                    {selectedChallenge.attempts.map((attempt) => (
                      <div key={attempt.id} className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                        {/* Attempt Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{t("riddleStatistics.modal.attempts", { n: attempt.attemptNumber })}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(attempt.status)}>
                            {attempt.status}
                          </Badge>
                        </div>

                        {/* Attempt Metadata */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">{t("riddleStatistics.modal.hintsUsed")}</p>
                            <p className="font-medium">{attempt.usedHints}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t("riddleStatistics.modal.timeSpent")}</p>
                            <p className="font-medium">{attempt.timeSpentSeconds}s</p>
                          </div>
                        </div>

                        {/* Action Details */}
                        {attempt.actions && attempt.actions.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="space-y-2">
                              {attempt.actions
                                .filter((action) => {
                                  // Only show actions with actual content
                                  return action.selectedAnswerText || action.answerText || action.isCorrect !== null;
                                })
                                .filter((action, index, self) => {
                                  // Deduplicate by attemptNumberAtAction - keep only first occurrence
                                  return self.findIndex(a => a.attemptNumberAtAction === action.attemptNumberAtAction) === index;
                                })
                                .map((action) => (
                                <div key={action.id} className="bg-white dark:bg-gray-950 p-2 rounded border text-sm space-y-1">
                                  <p className="font-medium">
                                   {t("riddleStatistics.modal.attemptLabel", { n: action.attemptNumberAtAction })}
                                  </p>
                                  
                                  {/* Selected Answer Text */}
                                  {action.selectedAnswerText && (
                                    <div className="flex items-center gap-2">
                                        <p className="text-muted-foreground">{t("riddleStatistics.modal.selected")}</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{action.selectedAnswerText}</p>
                                    </div>
                                  )}

                                  {/* Typed Answer Text */}
                                  {action.answerText && !action.selectedAnswerText && (
                                    <div>
                                        <p className="text-muted-foreground">{t("riddleStatistics.modal.typedAnswer")}</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">{action.answerText}</p>
                                    </div>
                                  )}

                                  {/* Answer Correctness */}
                                  {action.isCorrect !== null && (
                                    <div>
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                                          action.isCorrect
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                                        }`}
                                      >
                                        {action.isCorrect ? t("riddleStatistics.action.correct") : t("riddleStatistics.action.incorrect")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Overall Answer if No Actions */}
                        {(!attempt.actions || attempt.actions.length === 0) && attempt.textAnswer && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">Final Answer:</p>
                            <p className="font-medium">{attempt.textAnswer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Attempts Message */}
              {(!selectedChallenge.attempts || selectedChallenge.attempts.length === 0) && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-100">{t("riddleStatistics.modal.noAttemptsRecorded")}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
