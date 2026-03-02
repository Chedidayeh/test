/* eslint-disable react/no-unescaped-entities */
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Progress, Story, Challenge, ChallengeAttempt, ChallengeStatus } from "@shared/types";
import { calculateChallengeStats, getAggregatedChallengeStats } from "../_lib/stats";
import { fetchStoriesByIdsAction } from "@/src/lib/content-service/server-actions";
import { useMemo, useState, useEffect } from "react";

interface RiddlesStatsProps {
  childProgress: Progress[];
}

export default function RiddlesStats({ childProgress }: RiddlesStatsProps) {
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
  const [sortedChallengeStats, setSortedChallengeStats] = useState(challengeStats);
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
          console.log("Fetched stories for challenge stats:", result.stories);
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

          setSortedChallengeStats(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [challengeStats]);

  const { totalChallenges, solvedChallenges, successRate, avgAttemptsPerChallenge } =
    aggregatedStats;

  /**
   * Get all challenge attempts for a specific challenge
   * Extracts attempts from progress data by looping through game sessions
   */
  const getChallengeAttempts = (challengeId: string): ChallengeAttempt[] => {
    const attempts: ChallengeAttempt[] = [];
    
    childProgress?.forEach((progress) => {
      if (progress.gameSession?.challengeAttempts) {
        const challengeAttempts = progress.gameSession.challengeAttempts.filter(
          (attempt) => attempt.challengeId === challengeId
        );
        attempts.push(...challengeAttempts);
      }
    });
    
    return attempts.sort((a, b) => a.attemptNumber - b.attemptNumber);
  };

  /**
   * Get the correct answer text based on challenge type
   */
  const getCorrectAnswer = (challenge: Challenge | null): string => {
    if (!challenge) return "N/A";
    
    if (challenge.type === "CHOOSE_ENDING" || challenge.type === "MORAL_DECISION") {
      return "Multiple valid answers (choice-based)";
    }
    
    const correctAnswer = challenge.answers?.find((a) => a.isCorrect);
    return correctAnswer?.text || "No correct answer defined";
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
          <p className="text-sm text-muted-foreground mb-1">Total Challenges</p>
          <p className="text-3xl font-data font-bold text-purple-600">
            {totalChallenges}
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-green-200/20 to-emerald-200/20 border border-green-200 dark:border-green-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Solved</p>
          <p className="text-3xl font-data font-bold text-green-600">
            {solvedChallenges}
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-blue-200/20 to-cyan-200/20 border border-blue-200 dark:border-blue-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
          <p className="text-3xl font-data font-bold text-blue-600">
            {successRate}%
          </p>
        </div>
        <div className="rounded-lg bg-linear-to-br from-orange-200/20 to-red-200/20 border border-orange-200 dark:border-orange-200/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Attempts</p>
          <p className="text-3xl font-data font-bold text-orange-600">
            {avgAttemptsPerChallenge}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-black/30 p-6 shadow-warm-lg overflow-x-auto">
        <h3 className="font-heading text-lg text-foreground mb-4">
          Detailed Challenge Statistics
        </h3>
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <span className="font-medium">Tip:</span> Click on any challenge row to view detailed information including the correct answer, all available hints, and your child's action attempts with their selections and responses.
          </p>
        </div>
        {challengeStats.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No challenge attempts yet. Start playing to see statistics!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Story - Chapter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Hints Used</TableHead>
                <TableHead className="text-right">Time (sec)</TableHead>
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
                      <span className="text-muted-foreground text-sm">Loading...</span>
                    ) : (
                      getChallengeDisplayName(challenge.storyId, challenge.id)
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
                        ? "✓ Solved"
                        : challenge.status === "SKIPPED"
                        ? "⊘ Skipped"
                        : "Not attempted yet (story in progress)"}
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
              {selectedChallenge && getChallengeDisplayName(selectedChallenge.storyId, selectedChallenge.challengeId)}
            </DialogTitle>
            <DialogDescription>
              Challenge Details
            </DialogDescription>
          </DialogHeader>

          {selectedChallenge?.challenge && (
            <div className="space-y-6">
              {/* Challenge Type and Question */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedChallenge.challenge.type}</Badge>
                </div>
                <h3 className="font-medium text-lg">Question: {selectedChallenge.challenge.question}</h3>
              </div>

              {/* Correct Answer */}
              <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Correct Answer is:</p>
                <p className="text-sm text-green-800 dark:text-green-200">{getCorrectAnswer(selectedChallenge.challenge)}</p>
              </div>

              {/* Answers Options */}
              {selectedChallenge.challenge.answers && selectedChallenge.challenge.answers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Options:</h4>
                  <div className="space-y-2">
                    {selectedChallenge.challenge.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className={`p-3 rounded-lg border`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{answer.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              {selectedChallenge.challenge.hints && selectedChallenge.challenge.hints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Hints:</h4>
                  <div className="space-y-2">
                    {selectedChallenge.challenge.hints.map((hint, index) => (
                      <div key={index} className="p-2 px-4 border rounded-lg">
                        <p className="font-medium text-sm text-muted-foreground">Hint {index + 1}:</p>
                        <p className="text-sm mt-1">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Child Attempt Actions */}
              {selectedChallenge.attempts && selectedChallenge.attempts.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Child Attempts:</h4>
                  <div className="space-y-4">
                    {selectedChallenge.attempts.map((attempt) => (
                      <div key={attempt.id} className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                        {/* Attempt Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Attempts : {attempt.attemptNumber}</p>
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
                            <p className="text-muted-foreground">Hints Used</p>
                            <p className="font-medium">{attempt.usedHints}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time Spent</p>
                            <p className="font-medium">{attempt.timeSpentSeconds}s</p>
                          </div>
                        </div>

                        {/* Action Details */}
                        {attempt.actions && attempt.actions.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="space-y-2">
                              {attempt.actions.map((action, idx) => (
                                <div key={action.id} className="bg-white dark:bg-gray-950 p-2 rounded border text-sm space-y-1">
                                  <p className="font-medium">
                                   Attempt {action.attemptNumberAtAction}
                                  </p>
                                  
                                  {/* Selected Answer Text */}
                                  {action.selectedAnswerText && (
                                    <div className="flex items-center gap-2">
                                      <p className="text-muted-foreground">Selected:</p>
                                      <p className="font-medium text-gray-800 dark:text-gray-100">{action.selectedAnswerText}</p>
                                    </div>
                                  )}

                                  {/* Typed Answer Text */}
                                  {action.answerText && !action.selectedAnswerText && (
                                    <div>
                                      <p className="text-muted-foreground">Typed Answer:</p>
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
                                        {action.isCorrect ? "✓ Correct" : "✗ Incorrect"}
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
                  <p className="text-sm text-yellow-800 dark:text-yellow-100">No attempts recorded for this challenge.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
