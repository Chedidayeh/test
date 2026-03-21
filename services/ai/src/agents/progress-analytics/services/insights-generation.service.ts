import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMChain } from "@langchain/classic/chains";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  LLMContext,
} from "../../../types/types";
import { logger } from "../../../lib/logger";
import { AggregatedMetrics, InsightsReport, ReadingLevel, Recommendation } from "@shared/src/types";

/**
 * InsightsGenerationService
 *
 * Generates AI-powered insights from child's learning context using LangChain.
 * Creates 4 insight chains:
 * - Strengths: What does this child excel at?
 * - Weaknesses: Where does this child struggle?
 * - Recommendations: What stories should be recommended?
 * - Tips: How can this child improve?
 *
 * Also provides:
 * - Reading level classification (BEGINNER to ADVANCED)
 * - Engagement score calculation (0-100)
 */
export class InsightsGenerationService {
  private llm: ChatGoogleGenerativeAI;
  private strengthsChain: LLMChain | null = null;
  private weaknessesChain: LLMChain | null = null;
  private recommendationsChain: LLMChain | null = null;
  private tipsChain: LLMChain | null = null;

  constructor() {
    // Initialize GEMINI LLM with temperature 0.7 for balance between creativity and consistency
    this.llm = new ChatGoogleGenerativeAI("gemini-2.5-flash", {
      temperature: 0.7,
    });

    this.initializeChains();
  }

  /**
   * Initialize all 4 LangChain chains for different insight types
   */
  private initializeChains(): void {
    try {
      // Strengths Chain: Extract DATA-BACKED strengths from learning context (parent perspective)
      const strengthsPrompt = ChatPromptTemplate.fromTemplate(
        `Based on the following child's reading journey and performance data, identify 2-3 key strengths and abilities.

For each strength, identify the SPECIFIC METRICS or BEHAVIORS that demonstrate it:
- Success rate percentages (higher = stronger comprehension/problem-solving)
- Hint independence (0% hint usage = strong independent learning)
- Reading speed and efficiency (time per story/challenge)
- Challenge type mastery (identify which types show 80%+ success)
- Consistency across difficulty levels

Phrase these as positive attributes that EXPLAIN the metric evidence, so parents understand:
1. WHAT the strength is
2. HOW the data shows it (with specific numbers)
3. WHY this matters for their child's learning

Child Profile:
{context}

Respond with a JSON array of strings. Format:
[
  "Strength Name: description that references specific metrics (e.g., 'X% success rate in Y challenges', 'no hint usage', 'completes 88% of challenges on first attempt')",
  ...
]

IMPORTANT: Every strength must be directly supported by metrics in the child's data. Do not include generic abilities without specific evidence.`
      );
      this.strengthsChain = new LLMChain({
        llm: this.llm,
        prompt: strengthsPrompt,
        outputParser: new StringOutputParser(),
      });

      // Weaknesses Chain: Extract DATA-DRIVEN areas for improvement (parent perspective)
      const weaknessesPrompt = ChatPromptTemplate.fromTemplate(
        `Based on the following child's reading journey and performance data, identify 2-3 specific, measurable areas where the child could improve.

IMPORTANT: Only identify weaknesses that are supported by the actual metrics data provided.
- Look for challenge types with SUCCESS RATE LOWER than the overall success rate
- Look for difficulty levels where performance drops compared to average
- Look for patterns in hint usage, attempt counts, or time spent that indicate struggle
- If the child is performing well across all areas (high success rate, no hint dependency, balanced performance), acknowledge this and suggest "growth opportunities" rather than weaknesses

Phrase these as constructive areas FOR PARENTS TO SUPPORT AND HELP DEVELOP, focused on specific challenge types, reading strategies, or comprehension skills.

Child Profile:
{context}

Respond with a JSON array of strings. Examples:
- "Struggles with [SPECIFIC CHALLENGE TYPE] where success rate drops to X% compared to Y% overall"
- "Needs more practice with [DIFFICULTY LEVEL] difficulty where performance shows [SPECIFIC PATTERN]"
- "Could benefit from [SPECIFIC STRATEGY] when dealing with [CHALLENGE TYPE OR STORY TYPE]"

IMPORTANT: Base each weakness statement on actual performance metrics from the child's data. Do not include generic best practices unless directly supported by the data.`
      );
      this.weaknessesChain = new LLMChain({
        llm: this.llm,
        prompt: weaknessesPrompt,
        outputParser: new StringOutputParser(),
      });

      // Recommendations Chain: Story recommendations (directed at parents)
      const recommendationsPrompt = ChatPromptTemplate.fromTemplate(
        `Based on the following child's reading profile, suggest 2-3 stories FOR PARENTS TO ASSIGN to their child.
Consider the child's difficulty level, favorite themes from their profile, and areas for growth.
IMPORTANT: Use ACTUAL THEME NAMES from the child's profile (Adventure, Mystery, Science Fiction, etc.), NOT theme IDs.

Child Profile:
{context}

Respond with a JSON array of objects with format:
[
  {{"storyDifficulty": "EASY|MEDIUM|HARD", "themeName": "actual theme name (not IDs)", "reasoning": "why you recommend this story for the child (explain benefits to parent)"}},
  ...
]

IMPORTANT: Write recommendations for parents, explaining how each story will help their child develop specific skills or address identified areas for improvement.`
      );
      this.recommendationsChain = new LLMChain({
        llm: this.llm,
        prompt: recommendationsPrompt,
        outputParser: new StringOutputParser(),
      });

      // Tips Chain: Actionable improvement tips (directed at parents, data-driven)
      const tipsPrompt = ChatPromptTemplate.fromTemplate(
        `Based on the following child's reading profile, engagement patterns, and performance metrics, provide 2-3 TARGETED actionable tips for PARENTS.

Focus on practical, specific advice tailored to THIS CHILD'S actual performance patterns:
- If engagement is high (90+), provide tips to maintain momentum and deepen learning
- If hint dependency is high (>30%), suggest strategies to encourage independent problem-solving
- If performance varies by challenge type, provide tips for the struggling categories
- If reading speed is fast, suggest tips for comprehension depth; if slow, suggest tips for building confidence
- If success rate is very high (80%+), suggest tips for appropriate challenge progression

Each tip should:
1. Be specific to the child's actual data
2. Reference the child's strengths as a foundation
3. Suggest practical strategies parents can implement TODAY
4. Use conversational, warm language

Child Profile:
{context}

Respond with a JSON array of strings. Examples:
- "Since [CHILD NAME] has [STRENGTH], try having them [SPECIFIC ACTIVITY] to [GOAL]"
- "When [CHILD NAME] encounters [SPECIFIC CHALLENGE TYPE], parents can suggest [SPECIFIC STRATEGY]"
- "To support [CHILD NAME]'s [IDENTIFIED AREA], consider [PRACTICAL ACTION] which will help with [BENEFIT]"

IMPORTANT: Every tip must be grounded in the actual metrics and reading patterns provided in the data.`
      );
      this.tipsChain = new LLMChain({
        llm: this.llm,
        prompt: tipsPrompt,
        outputParser: new StringOutputParser(),
      });

      logger.info("[InsightsGeneration] LangChain chains initialized successfully");
    } catch (error) {
      logger.error("[InsightsGeneration] Error initializing chains", {
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });
      throw error;
    }
  }

  /**
   * Generate strengths from learning context
   * @param context LLMContext with child's learning profile
   * @returns Promise<string[]> array of strengths
   */
  private async generateStrengths(context: LLMContext): Promise<string[]> {
    try {
      if (!this.strengthsChain) {
        throw new Error("Strengths chain not initialized");
      }

      const response = await this.strengthsChain.call({
        context: context.consolidatedNarrative,
      });

      const output = response.text || "[]";
      return this.parseJsonArray(output, [
        "Consistent reader",
        "Good problem-solver",
      ]);
    } catch (error) {
      logger.error("[InsightsGeneration] Error generating strengths", {
        error: String(error),
      });
      return [
        "Consistent reader",
        "Good problem-solver",
        "Persistent learner",
      ];
    }
  }

  /**
   * Generate weaknesses from learning context
   * @param context LLMContext with child's learning profile
   * @returns Promise<string[]> array of weaknesses/areas for improvement
   */
  private async generateWeaknesses(context: LLMContext): Promise<string[]> {
    try {
      if (!this.weaknessesChain) {
        throw new Error("Weaknesses chain not initialized");
      }

      const response = await this.weaknessesChain.call({
        context: context.consolidatedNarrative,
      });

      const output = response.text || "[]";
      return this.parseJsonArray(output, [
        "Needs more practice with complex challenges",
        "Could benefit from slower pacing",
      ]);
    } catch (error) {
      logger.error("[InsightsGeneration] Error generating weaknesses", {
        error: String(error),
      });
      return [
        "Needs more practice with complex challenges",
        "Could benefit from slower pacing",
        "Struggling with specific challenge types",
      ];
    }
  }

  /**
   * Generate story recommendations from learning context
   * @param context LLMContext with child's learning profile
   * @returns Promise<Recommendation[]> array of story recommendations
   */
  private async generateRecommendations(
    context: LLMContext
  ): Promise<Recommendation[]> {
    try {
      if (!this.recommendationsChain) {
        throw new Error("Recommendations chain not initialized");
      }

      const response = await this.recommendationsChain.call({
        context: context.consolidatedNarrative,
      });

      const output = response.text || "[]";
      const parsed = this.parseJsonArray(output, []);

      // Convert array of recommendation objects
      // Use themeName from LLM response, fallback to favoriteThemes or General
      const favoriteThemes = context.childProfile?.favoriteThemes || [];
      
      return parsed
        .slice(0, 3)
        .map((rec: any) => ({
          storyDifficulty: rec.storyDifficulty || "MEDIUM",
          themeName: rec.themeName || rec.theme || favoriteThemes[0] || "General",
          reasoning: rec.reasoning || "Matches reading level and interests",
        }));
    } catch (error) {
      logger.error("[InsightsGeneration] Error generating recommendations", {
        error: String(error),
      });
      return [
        {
          storyDifficulty: "MEDIUM",
          themeName: "Adventure",
          reasoning: "Encourages your child to explore stories at their reading level to build confidence.",
        },
      ];
    }
  }

  /**
   * Generate improvement tips from learning context
   * @param context LLMContext with child's learning profile
   * @returns Promise<string[]> array of actionable tips
   */
  private async generateTips(context: LLMContext): Promise<string[]> {
    try {
      if (!this.tipsChain) {
        throw new Error("Tips chain not initialized");
      }

      const response = await this.tipsChain.call({
        context: context.consolidatedNarrative,
      });

      const output = response.text || "[]";
      return this.parseJsonArray(output, [
        "Try reading for shorter sessions",
        "Practice more challenging questions",
        "Use hints strategically to learn",
      ]);
    } catch (error) {
      logger.error("[InsightsGeneration] Error generating tips", {
        error: String(error),
      });
      return [
        "Try reading for shorter sessions",
        "Practice more challenging questions",
        "Use hints strategically to learn",
      ];
    }
  }

  /**
   * Helper: Parse JSON array from LLM response
   * @param jsonString String that may contain JSON array
   * @param fallback Fallback array if parsing fails
   * @returns Parsed array or fallback
   */
  private parseJsonArray(jsonString: string, fallback: any[] = []): any[] {
    try {
      // Try to extract JSON array from the string
      const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return fallback;
    } catch (error) {
      logger.warn("[InsightsGeneration] Failed to parse JSON array", {
        input: jsonString.substring(0, 100),
        error: String(error),
      });
      return fallback;
    }
  }

  /**
   * Classify reading level based on metrics
   * @param metrics AggregatedMetrics with performance data
   * @returns ReadingLevel classification
   */
  private classifyReadingLevel(metrics: AggregatedMetrics): ReadingLevel {
    const successRate = metrics.successRate;
    const avgAttempts = metrics.averageAttemptsPerChallenge;
    const difficulty = metrics.performanceByDifficulty;

    // Determine level based on success rate and attempt patterns
    if (successRate >= 90 && avgAttempts < 1.2) {
      return ReadingLevel.ADVANCED;
    }
    if (successRate >= 80 && avgAttempts < 1.5) {
      return ReadingLevel.HARD;
    }
    if (successRate >= 70 && avgAttempts < 1.8) {
      return ReadingLevel.MEDIUM;
    }
    if (successRate >= 60) {
      return ReadingLevel.EASY;
    }
    return ReadingLevel.BEGINNER;
  }

  /**
   * Calculate engagement score (0-100)
   * @param metrics AggregatedMetrics with performance data
   * @returns Engagement score (0-100)
   */
  private calculateEngagementScore(metrics: AggregatedMetrics): number {
    // Factors:
    // - Completion rate (stories completed / total stories attempted)
    // - Hint usage (lower hint usage = higher engagement)
    // - Time investment (more time = higher engagement)
    // - Attempt patterns (more attempts = higher engagement)

    const completionRateScore = Math.min(
      metrics.totalStoriesCompleted * 20,
      30
    ); // Max 30 points

    const hintScore = Math.max(0, 30 - metrics.hintDependencyRate); // Max 30 points (inverse)

    const timeScore = Math.min(
      Math.round(metrics.totalTimeSpent / 3600),
      20
    ); // Max 20 points (1 hour = 3600 seconds)

    const attemptScore = Math.min(
      metrics.totalChallengesAttempted,
      20
    ); // Max 20 points

    const totalScore = Math.round(
      completionRateScore + hintScore + timeScore + attemptScore
    );

    return Math.min(totalScore, 100);
  }

  /**
   * Main method: Generate complete insights report
   * @param context LLMContext with child's learning profile
   * @param metrics AggregatedMetrics with performance data
   * @returns Promise<InsightsReport> with all insights
   */
  public async generateInsights(
    context: LLMContext,
    metrics: AggregatedMetrics
  ): Promise<InsightsReport> {
    try {
      logger.info("[InsightsGeneration] Starting insights generation", {
        childId: context.childId,
        childName: context.childName,
      });

      // Calculate reading level and engagement score synchronously
      const readingLevel = this.classifyReadingLevel(metrics);
      const engagementScore = this.calculateEngagementScore(metrics);

      // Call all 4 chains in parallel
      const [strengths, weaknesses, recommendations, tips] = await Promise.all(
        [
          this.generateStrengths(context),
          this.generateWeaknesses(context),
          this.generateRecommendations(context),
          this.generateTips(context),
        ]
      );

      // Build summary narrative
      const summary = `
${context.childName} is a ${readingLevel.toLowerCase()} reader with an engagement score of ${engagementScore}/100.
They have completed ${metrics.totalStoriesCompleted} stories and solved ${metrics.totalChallengesSolved} challenges
with a ${metrics.successRate}% success rate. Key strengths include ${strengths.slice(0, 2).join(" and ")}.
Areas for improvement include ${weaknesses.slice(0, 2).join(" and ")}.
Recommended next steps: ${recommendations[0]?.reasoning || "Continue with current difficulty level"}.
      `;

      const insights: InsightsReport = {
        childId: context.childId,
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        periodEnd: new Date(),
        readingLevel,
        engagementScore,
        strengths,
        weaknesses,
        recommendations,
        tips,
        summary,
      };

      logger.info(
        "[InsightsGeneration] Successfully generated insights report",
        {
          childId: context.childId,
          readingLevel,
          engagementScore,
          strengthsCount: strengths.length,
          weaknessesCount: weaknesses.length,
          recommendationsCount: recommendations.length,
          tipsCount: tips.length,
        }
      );

      return insights;
    } catch (error) {
      logger.error("[InsightsGeneration] Error generating insights", {
        childId: context.childId,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      throw error;
    }
  }
}

export const insightsGenerationService = new InsightsGenerationService();
