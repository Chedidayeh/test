import { logger } from "../../../lib/logger";
import model from "../../../lib/model";
import {
  ReportMetrics,
  ProgressReport,
  ReportSummary,
  ReportInsights,
  ReportRecommendations,
} from "@shared/src/types";
import { EnrichedReadingContext } from "../types/enriched-context.types";

/**
 * LLM Response Type
 * Structured response from Gemini containing all report sections
 */
export type LLMAnalyticsResponse = {
  summary: ReportSummary;
  insights: ReportInsights;
  recommendations: ReportRecommendations;
};

/**
 * generateProgressReport
 *
 * Calls Gemini 2.5 Flash LLM to generate a weekly progress report based on:
 * - Aggregated metrics from current week
 * - Historical context from previous weeks
 * - Child's profile information
 * - (Optional) Enriched content context with chapters and challenges for story-specific insights
 *
 * Returns a structured JSON report with:
 * - Summary (week overview, engagement status, progress trend, highlights)
 * - Insights (strengths, growth areas, engagement observations)
 * - Recommendations (next steps for parent, motivational message)
 *
 * @param childName - Name of the child for personalization
 * @param metricsData - Aggregated metrics from AnalyticsDataAggregator
 * @param historicalContext - Extracted summaries from past 4 weeks of reports
 * @param weekStart - Start date of the week
 * @param weekEnd - End date of the week
 * @param enrichedContext - (Optional) Enriched context with chapter and challenge details for story-specific insights
 * @returns ProgressReport with all sections populated
 */
export async function generateProgressReport(
  childName: string,
  childId: string,
  metricsData: ReportMetrics,
  historicalContext: string,
  weekStart: Date,
  weekEnd: Date,
  enrichedContext?: EnrichedReadingContext,
): Promise<ProgressReport> {
  const prompt = buildAnalyticsPrompt(
    childName,
    metricsData,
    historicalContext,
    enrichedContext,
  );

  logger.info("[Analytics LLM] Starting progress report generation", {
    childName,
    childId,
    weekStart,
    weekEnd,
    metricsDataKeys: Object.keys(metricsData),
  });

  try {
    // Call Gemini 2.5 Flash with temperature 0.1 for consistent, deterministic output
    const response = await model.generateContent(prompt);
    const responseText = response.response.text();

    logger.debug("[Analytics LLM] Received LLM response", {
      childId,
      responseLength: responseText.length,
    });

    // Parse and validate the JSON response
    const llmResult = parseAnalyticsResponse(responseText, childId);

    // Construct the full ProgressReport
    const report: ProgressReport = {
      childId,
      childName,
      weekStart,
      weekEnd,
      summary: llmResult.summary,
      metrics: metricsData,
      insights: llmResult.insights,
      recommendations: llmResult.recommendations,
    };

    logger.info("[Analytics LLM] Progress report generation completed", {
      childId,
      childName,
      reportGenerated: true,
      summaryEngagementStatus: report.summary.engagementStatus,
      summaryProgressTrend: report.summary.progressTrend,
    });

    return report;
  } catch (error) {
    logger.error("[Analytics LLM] Error generating progress report", {
      childId,
      childName,
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    throw error;
  }
}

/**
 * buildAnalyticsPrompt
 *
 * Constructs a comprehensive prompt for Gemini to generate the weekly progress report
 * Includes:
 * 1. System instructions (role, tone, expectations)
 * 2. Current week metrics (structured data)
 * 3. Story and chapter details (if enriched context provided)
 * 3. Historical context (past 4 weeks summaries)
 * 4. Output format specification (JSON structure)
 * 5. Child-specific interests and profile
 */
function buildAnalyticsPrompt(
  childName: string,
  metrics: ReportMetrics,
  historicalContext: string,
  enrichedContext?: EnrichedReadingContext,
): string {
  // Build the story details section if enriched context is available
  let storyDetailsSection = "";
  if (enrichedContext && enrichedContext.stories.length > 0) {
    storyDetailsSection = `

---

DETAILED STORY & CHAPTER CONTENT
---

${enrichedContext.summaryText}

Stories read this week with chapter breakdown:
${enrichedContext.stories
  .map((story) => {
    return `
"${story.title}" (World: ${story.worldName || "Unknown"}, Theme: ${story.themeName || "General"}, Difficulty: ${story.difficulty}/5)
Completion: ${story.completionPercentage}%
Chapter breakdown:
${story.chapters
  .map((chapter) => {
    const challenges = chapter.challenges
      .map(
        (c) =>
          `  - Question: "${c.question}" [${c.status === "SOLVED" ? "✓" : "✗"}, ${c.attemptCount} attempt(s), ${c.usedHints} hints]`,
      )
      .join("\n");
    return `  Chapter ${chapter.order}: ${challenges ? challenges : "No challenges"}`;
  })
  .join("\n")}
Challenge success in story: ${story.challengeSuccessRate}% (${story.totalChallengeSolved}/${story.totalChallengesAttempted})
`;
  })
  .join("\n")}
`;
  }

  return `
You are an AI assistant specialized in analyzing children's reading progress and generating weekly reports for parents.

Your role is to observe and assess a child's learning journey and provide insightful, encouraging feedback that helps parents support their child's educational growth.

---

CHILD PROFILE
---

Name: ${childName}
Report Period: Weekly (7 days)

---

CURRENT WEEK METRICS
---

READING ENGAGEMENT:
- Total reading sessions: ${metrics.reading.totalSessionsCount}
- Total active reading time: ${metrics.reading.totalSessionDurationMinutes} minutes
- Average session length: ${metrics.reading.averageSessionDurationMinutes} minutes
- Reading frequency: ${metrics.reading.readingFrequency} (${metrics.reading.sessionsPerDay} sessions per day)
- Reading consistency score: ${metrics.reading.consistencyScore}/100 (higher = more consistent habit)

LEARNING PROGRESS:
- Stories started: ${metrics.learning.storiesStartedCount}
- Stories completed: ${metrics.learning.storiesCompletedCount}
- Completion rate: ${metrics.learning.completionRate}%
- Current level: ${metrics.learning.currentLevel}
- Stars earned this week: ${metrics.learning.totalStarsEarned}
- Difficulty trend: ${metrics.learning.avgDifficultyProgression}

COMPREHENSION & CHALLENGE PERFORMANCE:
- Total challenges attempted: ${metrics.comprehension.totalChallengesAttempted}
- Challenges solved correctly: ${metrics.comprehension.totalChallengesSolved}
- Overall success rate: ${metrics.comprehension.overallSuccessRate}%
- Average hints used per challenge: ${metrics.comprehension.avgHintsUsedPerChallenge}

${storyDetailsSection}

---

HISTORICAL CONTEXT (Past 4 Weeks)
---

${historicalContext}

---

YOUR TASK
---

Generate a comprehensive weekly progress report that includes:

1. SUMMARY (week overview section)
   - weekOverview: 2-3 sentences describing the week in general terms
   - engagementStatus: one of "highly_engaged", "engaged", "moderately_engaged", "low_engagement"
   - progressTrend: one of "excellent", "good", "stable", "declining"
   - quickHighlights: 3-4 bullet points of key achievements this week

2. INSIGHTS (analysis and observations)
   - strengthsIdentified: list of 3-4 things the child is doing well
   - areasForGrowth: list of 2-3 areas where they could improve
   - learningStyle: optional string describing observed learning style (e.g., "visual learner", "prefers challenges")
   - engagementObservations: 2-3 sentence paragraph about engagement level and reading patterns
   - progressComparison: optional string comparing this week to previous weeks (e.g., "Similar engagement to last week, but with better comprehension")
   - parentalGuidanceInsight: optional 1-2 sentence insight for parent on how to support learning

3. RECOMMENDATIONS (next steps and guidance)
   - nextStepsForParent: 2-3 action items the parent can take (e.g., "Encourage reading at consistent time each day")
   - suggestedReadingPath: optional string with a specific story or theme recommendation for next week
   - challengesForFocus: optional list of challenge types to practice
   - motivationalMessage: 1-2 sentences of encouragement tailored to this child's progress and personality

---

OUTPUT FORMAT
---

IMPORTANT: Your response must be ONLY valid JSON (no additional text before or after), following this exact structure:

\`\`\`json
{
  "summary": {
    "weekOverview": "string",
    "engagementStatus": "highly_engaged" | "engaged" | "moderately_engaged" | "low_engagement",
    "progressTrend": "excellent" | "good" | "stable" | "declining",
    "quickHighlights": ["highlight1", "highlight2", "highlight3", "highlight4"]
  },
  "insights": {
    "strengthsIdentified": ["strength1", "strength2", "strength3"],
    "areasForGrowth": ["area1", "area2"],
    "learningStyle": "optional string or null",
    "engagementObservations": "string describing engagement",
    "progressComparison": "optional string or null",
    "parentalGuidanceInsight": "optional string or null"
  },
  "recommendations": {
    "nextStepsForParent": ["action1", "action2", "action3"],
    "suggestedReadingPath": "optional string or null",
    "challengesForFocus": ["challenge_type1", "challenge_type2"] or [],
    "motivationalMessage": "string with encouragement"
  }
}
\`\`\`

---

TONE & GUIDELINES
---

- Be encouraging and positive, but honest
- Focus on progress and growth, not perfection
- Use age-appropriate language that parents will understand
- Highlight specific achievements and patterns from the data
- ${enrichedContext ? 'Reference specific stories, chapters, and challenges that the child read/attempted to make insights personal and concrete' : ''}
- Provide actionable insights parents can use to support their child
- Never shame or discourage; frame areas for growth as opportunities
- Keep observations grounded in the metrics provided
- If consistency is low, acknowledge it gently and suggest ways to improve
- If progress is excellent, celebrate it enthusiastically

Generate the report now:
`;
}

/**
 * parseAnalyticsResponse
 *
 * Parses the JSON response from Gemini into a structured LLMAnalyticsResponse
 * Validates required fields and throws errors on invalid responses
 */
function parseAnalyticsResponse(
  responseText: string,
  childId: string,
): LLMAnalyticsResponse {
  try {
    logger.debug("[Analytics LLM] Parsing LLM response", {
      childId,
      responseLength: responseText.length,
    });

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in LLM response");
    }

    const jsonString = jsonMatch[0];
    const parsed = JSON.parse(jsonString);

    // Validate required sections
    if (!parsed.summary) {
      throw new Error("Missing 'summary' section in response");
    }

    if (!parsed.insights) {
      throw new Error("Missing 'insights' section in response");
    }

    if (!parsed.recommendations) {
      throw new Error("Missing 'recommendations' section in response");
    }

    // Validate summary section
    const summary = parsed.summary as ReportSummary;
    if (!summary.weekOverview || typeof summary.weekOverview !== "string") {
      throw new Error("Invalid or missing 'summary.weekOverview'");
    }

    if (
      !summary.engagementStatus ||
      !["highly_engaged", "engaged", "moderately_engaged", "low_engagement"].includes(
        summary.engagementStatus,
      )
    ) {
      throw new Error("Invalid 'summary.engagementStatus'");
    }

    if (
      !summary.progressTrend ||
      !["excellent", "good", "stable", "declining"].includes(summary.progressTrend)
    ) {
      throw new Error("Invalid 'summary.progressTrend'");
    }

    if (!Array.isArray(summary.quickHighlights)) {
      throw new Error("'summary.quickHighlights' must be an array");
    }

    // Validate insights section
    const insights = parsed.insights as ReportInsights;
    if (!Array.isArray(insights.strengthsIdentified)) {
      throw new Error("'insights.strengthsIdentified' must be an array");
    }

    if (!Array.isArray(insights.areasForGrowth)) {
      throw new Error("'insights.areasForGrowth' must be an array");
    }

    if (!insights.engagementObservations || typeof insights.engagementObservations !== "string") {
      throw new Error("Invalid or missing 'insights.engagementObservations'");
    }

    // Validate recommendations section
    const recommendations = parsed.recommendations as ReportRecommendations;
    if (!Array.isArray(recommendations.nextStepsForParent)) {
      throw new Error("'recommendations.nextStepsForParent' must be an array");
    }

    if (!recommendations.motivationalMessage || typeof recommendations.motivationalMessage !== "string") {
      throw new Error("Invalid or missing 'recommendations.motivationalMessage'");
    }

    logger.info("[Analytics LLM] Successfully parsed LLM response", {
      childId,
      validatedSections: ["summary", "insights", "recommendations"],
    });

    return {
      summary,
      insights,
      recommendations,
    };
  } catch (error) {
    logger.error("[Analytics LLM] Error parsing LLM response", {
      childId,
      error: String(error),
      responsePreview: responseText.substring(0, 200),
    });
    throw new Error(
      `Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
