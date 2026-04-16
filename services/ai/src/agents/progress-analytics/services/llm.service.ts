import { logger } from "../../../lib/logger";
import model from "../../../lib/model";
import { AnalyticsInput, AnalyticsOutput, ChallengeDetail, ChallengeTypeBehaviorSummary, MetricsSnapshot, TrendAnalysis } from "./types";

/**
 * Generate weekly analytics narrative using Gemini LLM
 * Transforms structured metrics into parent-friendly insights and recommendations
 *
 * @param analysisInput - Structured data about child, this week, and previous week (if exists)
 * @returns Narrative report with summary, trends, and recommendations
 */
export async function llmGenerateAnalytics(
  analysisInput: AnalyticsInput,
): Promise<AnalyticsOutput> {
  const {
    childName,
    childAge,
    favoriteThemes,
    currentSkillScores,
    thisWeekMetrics,
    previousWeekMetrics,
    trendAnalysis,
    behaviorInsights,
    challengeDetails,
  } = analysisInput;

  // Build human-readable skill summary
  const skillSummary = Object.entries(currentSkillScores)
    .map(([name, data]) => `${name}: ${Math.round(data.score * 100)}%`)
    .join(", ");

  // Build trend narrative (if available)
  const trendNarrative = previousWeekMetrics
    ? buildTrendNarrative(trendAnalysis)
    : "This is the first week of tracked data.";

  // Build this week's metrics narrative
  const thisWeekNarrative = buildMetricsNarrative(thisWeekMetrics);

  // Build behavioral patterns narrative (if action-level data is available)
  const behaviorNarrative = buildBehaviorNarrative(childName, behaviorInsights);

  // Build per-challenge detail log (if challenge details are available)
  const challengeLogNarrative = buildChallengeDetailsNarrative(challengeDetails);

  const systemPrompt = `You are an expert educational analyst specializing in creating parent-friendly weekly progress reports for children in an interactive reading game.

Your role is to:
1. CELEBRATE wins and show genuine enthusiasm about the child's progress
2. ACKNOWLEDGE struggles constructively and supportively
3. EXPLAIN learning in accessible terms (not jargon)
4. SUGGEST actionable next steps parents can encourage

Your tone must always be:
- Warm and encouraging
- Specific and evidence-based (reference actual data)
- Non-judgmental
- Focused on growth mindset
- Realistic about challenges

Language and cultural context:
- Use conversational English suitable for parents
- Be specific about the child's strengths and areas for development
- Connect to the child's interests and learning objectives`;

  const userPrompt = `You are writing a weekly progress report for parents about their child's learning in an interactive reading game.

CHILD INFORMATION:
- Name: ${childName}
- Age: ${childAge} years old
- Favorite Themes: ${favoriteThemes.length > 0 ? favoriteThemes.join(", ") : "(not specified)"}
- Current Skill Levels: ${skillSummary}

THIS WEEK'S ACTIVITY:
${thisWeekNarrative}
${challengeLogNarrative ? `
DETAILED CHALLENGE LOG (every challenge ${childName} encountered, with question, answers, and what happened):
${challengeLogNarrative}` : ""}
${behaviorNarrative ? `
BEHAVIORAL PATTERNS (HOW ${childName.toUpperCase()} ANSWERED — aggregated by challenge type):
${behaviorNarrative}` : ""}
${previousWeekMetrics ? `
PROGRESS & TRENDS:
${trendNarrative}` : ""}

YOUR TASK:
Generate a weekly progress report with THREE sections:

1. EXECUTIVE SUMMARY (parent TL;DR)
   - Open with a statement about the week's standout achievement or learning
   - Mention 2-3 specific improvements or interesting observations
   - **IMPORTANT: Whenever you mention a challenge question, ALWAYS include the story title in parentheses or context**
   - If the DETAILED CHALLENGE LOG is present, reference specific challenges by name:
     * Quote the actual question text when highlighting a win or struggle
     * ALWAYS format as: "In 'Story Title', [child] [achievement/observation] by [question or action]"
     * Example: "In 'The Fox's Riddle', he brilliantly answered 'What did the fox whisper?' on the first try"
     * Bad example (DO NOT): "He answered 'What did the fox whisper?' on the first try" ← Missing story name!
   - If behavioral pattern data is present, reference at least ONE insight:
     * persistence ("kept trying despite errors"), quick wins ("mastered X on first try"),
       self-correction ("figured it out without hints"), or give-up tendency ("skipped X after struggling")
     * Always mention the story: "In 'Story Name', he showed persistence..."
   - If there are struggles, acknowledge them gently and reframe as learning opportunities
   - Max 150 words
   - Example tone: "This week, Adam showed impressive growth in logical thinking. In 'The Numbers Game', he answered 'What has hands but can't clap?' correctly on his first try. In 'The Fox's Riddle', he persisted through the tricky 'What did the fox whisper?' across 3 attempts before solving it. However, in 'Story Endings', he skipped a true/false question about story conclusions—a great area to explore together!"

2. PROGRESS & TRENDS (week-over-week analysis)
   ${previousWeekMetrics ? `- Compare this week to last week using specific metrics
   - Highlight improvements in success rate, speed, hint usage
   - **CRITICAL: When mentioning any specific challenge question, ALWAYS include the story name**
   - If behavioral data is present, note any shifts in HOW the child approaches challenges
     (e.g. "is asking for hints less often" or "now self-corrects before asking for help")
   - If the detailed challenge log is present, identify which specific stories/challenges
     drove the biggest improvements or setbacks
   - Acknowledge any areas needing more support
   - Max 200 words
   - Example: "Compared to last week, ${childName} is solving riddles 15% faster and using fewer hints, indicating growing confidence. In 'The Magic Forest', he solved all 3 challenges on the first try. In 'Vocabulary Quest', word comprehension remains an area to focus on—he needed 3 attempts on 'What word means the same as brave?' suggesting vocabulary-building would help."` : `- This is the first week; focus on establishing baseline and pattern observations
   - **CRITICAL: When mentioning any specific challenge question, ALWAYS include the story name**
   - If behavioral data is present, describe the child's natural problem-solving style:
     do they persist, ask for help early, self-correct, or give up quickly?
   - If the detailed challenge log is present, ground observations in specific examples:
     which challenges were easy? which required multiple attempts? any skipped?
   - Always reference the story: "In 'Story Name', [observation]" not just "[observation]"
   - Example: "This week establishes a baseline for ${childName}'s learning style. In 'The Dragon's Secret', he answered 'What color was the dragon?' instantly but needed 3 tries on 'Why did the dragon hide?'—showing strong factual recall with room to grow in inference skills."`}

3. RECOMMENDATIONS (actionable parent suggestions)
   - 3-5 specific, actionable suggestions parents can use
   - Connect recommendations to the child's interests
   - **CRITICAL: If recommending work on a specific question or challenge type, include the story name**
   - If the detailed challenge log is present, reference specific stories or question types
     the child struggled with — make suggestions concrete, not generic
     * Example: "Re-read 'The Magic Forest' together and discuss what the fox meant—${childName} found inference questions there challenging"
     * Good: "Practice 'The Magic Forest' questions where ${childName} struggled"
     * Bad (DO NOT): "Practice inference questions" ← No story reference!
   - If behavioral data is present:
     * Suggest building on quick-win challenge types for confidence
     * Suggest strategies to reduce give-up rate in struggling challenge types
     * If self-correction rate is high, celebrate that independence explicitly
     * If hint usage is early and high, suggest "try once more before asking for help" strategies
   - Be realistic about time commitment
   - Example suggestions:
     * "Practice riddle challenges in 'The Fox's Riddle' together—${childName} is excelling here"
     * "Before playing, preview 'Story Name' chapters together to build vocabulary confidence"
     * "Encourage ${childName} to explain answers from 'Story Name' in their own words to build comprehension"

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no code blocks, no extra text)
- Format exactly as shown below
- executiveSummary: actual narrative, not a placeholder
- progressTrends: actual narrative or first-week baseline
- recommendations: array of 3-5 strings, each 15-30 words
- **MANDATORY: ANY mention of a specific challenge question MUST include the story name**
  For example: "In 'Story Name', he answered 'question text' correctly"
  NOT: "He answered 'question text' correctly" (missing story context!)

{
  "executiveSummary": "actual narrative here",
  "progressTrends": "actual narrative here",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Generate the report now:`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt,
    });

    let text = result.response.text().trim();

    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "ai-service",
        agent: "progress-analytics",
        message: "LLM analytics generation successful",
        childName,
        textLength: text.length,
      }),
    );

    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      text = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(text);

    // Validate structure
    if (
      !parsed.executiveSummary ||
      !parsed.progressTrends ||
      !Array.isArray(parsed.recommendations)
    ) {
      throw new Error("Invalid response structure from LLM");
    }

    return {
      executiveSummary: parsed.executiveSummary,
      progressTrends: parsed.progressTrends,
      recommendations: parsed.recommendations,
    };
  } catch (error) {
    logger.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        service: "ai-service",
        agent: "progress-analytics",
        message: "LLM analytics generation error",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        childName,
      }),
    );

    // Return fallback response instead of throwing
    return {
      executiveSummary: `This week, ${childName} engaged with the learning activities. We're gathering insights into their reading patterns and progress. Check back next week for more comprehensive analysis.`,
      progressTrends: "This is the first week of analytics tracking. Baseline patterns are being established.",
      recommendations: [
        "Continue daily reading sessions for consistent progress",
        "Celebrate attempts and effort, not just correct answers",
        "Monitor favorite themes and story types for engagement patterns",
      ],
    };
  }
}

/**
 * Build human-readable behavioral patterns narrative from behaviorInsights.
 * Injected into the LLM prompt so the model can reference HOW the child answered,
 * not just whether they were right or wrong.
 *
 * Returns an empty string when no behavior data is available (graceful degradation).
 */
function buildBehaviorNarrative(
  childName: string,
  behaviorInsights?: AnalyticsInput["behaviorInsights"],
): string {
  if (!behaviorInsights) return "";

  const { byType, giveUpRate, persistenceAreas, quickWinAreas, selfCorrectionRate } =
    behaviorInsights;

  const lines: string[] = [];

  // -------------------------------------------------------------------------
  // Per-challenge-type breakdown
  // -------------------------------------------------------------------------
  const typeEntries = Object.values(byType);
  if (typeEntries.length > 0) {
    lines.push("Challenge type breakdown:");
    for (const t of typeEntries) {
      const hintStrategy =
        t.hintEarlyRate > t.hintAfterFailureRate
          ? `tends to ask for hints early (${t.hintEarlyRate.toFixed(1)}% of the time)`
          : t.hintAfterFailureRate > 0
            ? `asks for hints only after persisting (${t.hintAfterFailureRate.toFixed(1)}% of the time)`
            : "rarely used hints";

      lines.push(
        `  • ${t.type}: ${t.totalChallenges} challenge(s) — ` +
          `${t.successRate.toFixed(1)}% success rate, ` +
          `${t.firstTrySolveRate.toFixed(1)}% solved on first try, ` +
          `avg ${t.averageActionsBeforeSolve.toFixed(1)} action(s) before solving, ` +
          `${t.giveUpRate.toFixed(1)}% abandoned, ` +
          `${t.selfCorrectionRate.toFixed(1)}% self-corrected — ` +
          hintStrategy,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Global signals
  // -------------------------------------------------------------------------
  if (quickWinAreas.length > 0) {
    lines.push(
      `Mastery areas (solved on first try ≥70% of the time): ${quickWinAreas.join(", ")}`,
    );
  }

  if (persistenceAreas.length > 0) {
    lines.push(
      `Persistence areas (retries despite errors, rarely gives up): ${persistenceAreas.join(", ")}`,
    );
  }

  if (giveUpRate > 0) {
    lines.push(
      `Overall give-up rate: ${giveUpRate.toFixed(1)}% of challenges abandoned after at least one failed attempt`,
    );
  }

  if (selfCorrectionRate > 0) {
    lines.push(
      `Self-correction rate: ${selfCorrectionRate.toFixed(1)}% of challenges where ${childName} fixed their own mistake without hints`,
    );
  }

  return lines.join("\n");
}

/**
 * Build a per-challenge detail log for the LLM prompt.
 * Groups challenges by story, shows each challenge with its question, answer options,
 * and what the child did on each attempt.
 *
 * Returns empty string when no challenge details are available.
 */
function buildChallengeDetailsNarrative(
  challengeDetails?: ChallengeDetail[],
): string {
  if (!challengeDetails || challengeDetails.length === 0) return "";

  const lines: string[] = [];

  // Group by story title (preserving order since details are pre-sorted)
  const byStory = new Map<string, ChallengeDetail[]>();
  for (const detail of challengeDetails) {
    const key = detail.storyTitle;
    if (!byStory.has(key)) byStory.set(key, []);
    byStory.get(key)!.push(detail);
  }

  for (const [storyTitle, details] of byStory) {
    const diff = details[0].storyDifficulty;
    lines.push(
      `Story: "${storyTitle}"${diff != null ? ` (Difficulty: ${diff}/5)` : ""}`,
    );

    for (const d of details) {
      // Challenge header
      lines.push(
        `  Ch.${d.chapterOrder} — ${d.challengeType}: "${d.question}"`,
      );

      // Answer options (for types that have them)
      if (d.answers.length > 0) {
        const opts = d.answers
          .map((a, i) => {
            const letter = String.fromCharCode(65 + i); // A, B, C, ...
            return `${letter}) "${a.text}"${a.isCorrect ? " ✓" : ""}`;
          })
          .join("  ");
        lines.push(`    Options: ${opts}`);
      }

      // Available hints
      if (d.hints.length > 0) {
        lines.push(`    Hints available: ${d.hints.length}`);
      }

      // Per-attempt log
      if (d.attempts.length > 0) {
        for (const a of d.attempts) {
          const answerPart = a.selectedAnswer
            ? `"${a.selectedAnswer}"`
            : "(no answer)";
          const correctPart =
            a.isCorrect === true
              ? "Correct"
              : a.isCorrect === false
                ? "Incorrect"
                : a.status === "SKIPPED"
                  ? "Skipped"
                  : "No result";
          const hintPart = a.usedHints > 0 ? `${a.usedHints} hint(s)` : "no hints";
          lines.push(
            `    Attempt ${a.attemptNumber}: ${answerPart} — ${correctPart} (${a.timeSpentSeconds}s, ${hintPart})`,
          );
        }
      } else {
        lines.push(`    No attempts recorded (NOT_ATTEMPTED)`);
      }

      // Final summary line
      const attemptCount = d.attempts.length;
      lines.push(
        `    → ${d.finalStatus}${attemptCount > 0 ? ` in ${attemptCount} attempt(s)` : ""}, ${d.totalTimeSpent}s total`,
      );
    }

    lines.push(""); // Blank line between stories
  }

  return lines.join("\n");
}

/**
 * Build human-readable narrative from this week's metrics
 * Used in LLM prompt for context
 */
function buildMetricsNarrative(metrics: MetricsSnapshot): string {
  const challengeBreakdown = Object.entries(metrics.challenges)
    .map(([type, count]) => `${count} ${type}${count !== 1 ? "s" : ""}`)
    .join(", ");

  const hoursSpent = Math.round(metrics.timeSpent.totalSeconds / 3600);
  const minutesSpent = Math.round((metrics.timeSpent.totalSeconds % 3600) / 60);
  const timeString =
    hoursSpent > 0
      ? `${hoursSpent}h ${minutesSpent}m`
      : `${minutesSpent} minutes`;

  const difficultyString =
    metrics.difficultiesHandled.length > 0
      ? `from difficulty level ${Math.min(...metrics.difficultiesHandled)} to ${Math.max(...metrics.difficultiesHandled)}`
      : "various difficulty levels";

  return `
- Completed: ${metrics.storiesCount} stories
- Challenges completed: ${challengeBreakdown}
- Success rate: ${metrics.successRate.toFixed(1)}% of challenges answered correctly
- Hint usage: Used hints on average ${metrics.hintUsagePattern.averageHintsPerChallenge.toFixed(1)} times per challenge
- Time spent: ${timeString}
- Skills exercised: ${metrics.skillsExercised.join(", ") || "reading and comprehension"}
- Difficulty range: Tackled challenges ${difficultyString}
${metrics.challengeResultBreakdown ? `- Breakdown: ${metrics.challengeResultBreakdown.correct} correct, ${metrics.challengeResultBreakdown.incorrect} incorrect${metrics.challengeResultBreakdown.skipped > 0 ? `, ${metrics.challengeResultBreakdown.skipped} skipped` : ""}` : ""}`;
}

/**
 * Build human-readable trend narrative comparing weeks
 * Used in LLM prompt when previous week data exists
 */
function buildTrendNarrative(trends?: TrendAnalysis): string {
  if (!trends) return "";

  const improvements: string[] = [];
  const areas: string[] = [];

  if (trends.successRateChange !== null && trends.successRateChange !== 0) {
    improvements.push(
      `Success rate ${trends.successRateChange > 0 ? "improved" : "declined"} by ${Math.abs(trends.successRateChange).toFixed(1)}%`,
    );
  }

  if (
    trends.hintUsageImprovement !== null &&
    trends.hintUsageImprovement !== 0
  ) {
    improvements.push(
      `Hint usage ${trends.hintUsageImprovement < 0 ? "decreased (positive sign of independence)" : "increased"}`,
    );
  }

  if (trends.speedImprovement !== null && trends.speedImprovement !== 0) {
    improvements.push(
      `Solving speed ${trends.speedImprovement > 0 ? "improved" : "changed"} by ${Math.abs(trends.speedImprovement).toFixed(1)}%`,
    );
  }

  if (trends.newSkillsIntroduced.length > 0) {
    improvements.push(
      `New skills introduced: ${trends.newSkillsIntroduced.join(", ")}`,
    );
  }

  if (trends.strugglingAreas.length > 0) {
    areas.push(
      `Areas needing support: ${trends.strugglingAreas.join(", ")}`,
    );
  }

  const narrative = [...improvements, ...areas].join(". ") || "Steady progress this week.";

  return `Compared to last week: ${narrative}`;
}
