import { logger } from "../../../lib/logger";
import model from "../../../lib/model";
import { AnalyticsInput, AnalyticsOutput, MetricsSnapshot, TrendAnalysis } from "./types";

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

${previousWeekMetrics ? `PROGRESS & TRENDS:
${trendNarrative}` : ""}

YOUR TASK:
Generate a weekly progress report with THREE sections:

1. EXECUTIVE SUMMARY (parent TL;DR)
   - Open with a statement about the week's standout achievement or learning
   - Mention 2-3 specific improvements or interesting observations
   - If there are struggles, acknowledge them gently and reframe as learning opportunities
   - Max 150 words
   - Example tone: "This week, Adam showed impressive growth in logical thinking. He completed 18 riddles successfully, with noticeably faster solving times. However, he struggled with word-based challenges, which actually shows he learns best with visual/conceptual puzzles—a valuable insight!"

2. PROGRESS & TRENDS (week-over-week analysis)
   ${previousWeekMetrics ? `- Compare this week to last week using specific metrics
   - Highlight improvements in success rate, speed, hint usage
   - Acknowledge any areas needing more support
   - Max 200 words
   - Example: "Compared to last week, ${childName} is solving riddles 15% faster and using fewer hints, indicating growing confidence. Word comprehension remains an area to focus on, suggesting he may benefit from more practice with vocabulary-building challenges."` : `- This is the first week; focus on establishing baseline and pattern observations
   - Example: "This week establishes a baseline for ${childName}'s learning style. He shows strong preference for logic puzzles and demonstrates persistence when using hints. Areas to develop include vocabulary recognition and faster reading comprehension."`}

3. RECOMMENDATIONS (actionable parent suggestions)
   - 3-5 specific, actionable suggestions parents can use
   - Connect recommendations to the child's interests
   - Be realistic about time commitment
   - Example suggestions:
     * "Practice riddles together for 5-10 minutes daily—${childName} is excelling here"
     * "Read short stories with vocabulary focus before game sessions"
     * "Encourage ${childName} to explain answers in their own words to build comprehension"

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no code blocks, no extra text)
- Format exactly as shown below
- executiveSummary: actual narrative, not a placeholder
- progressTrends: actual narrative or first-week baseline
- recommendations: array of 3-5 strings, each 15-30 words

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
