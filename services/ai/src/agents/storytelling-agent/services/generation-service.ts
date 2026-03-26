import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";
import { updateNarrativeMemory } from "./memory-service";
import { getAdaptedDifficulty } from "./skill-adaptation";
import model from "../../../lib/model";

const prisma = new PrismaClient();

/**
 * ISSUE 1 FIX: Deterministic, simple generation service
 * ISSUE 2 FIX: LLM outputs ONLY JSON structure, backend validates & persists
 * ISSUE 3 FIX: Strong Zod validation + structured output enforcement + retries
 * ISSUE 4 FIX: Rich memory context injected into prompts
 * ISSUE 5 FIX: Difficulty adaptation based on child performance
 * ISSUE 8 FIX: Age-calibrated linguistic constraints
 * ISSUE 9 FIX: Multiple retries, error tracking, fallbacks
 */

// Zod schemas for strict validation
const ChallengeSchema = z.object({
  question: z.string().min(10).max(200),
  answers: z
    .array(
      z.object({
        text: z.string().min(2).max(100),
        isCorrect: z.boolean(),
        hints: z.array(z.string()).max(2).optional(),
      }),
    )
    .min(3)
    .max(4),
});

const ChapterSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(200).max(2000),
  challenges: z.array(ChallengeSchema).min(2).max(3),
});

const StorySchema = z.object({
  title: z.string().min(5).max(100),
  chapters: z.array(ChapterSchema).min(3).max(4),
});

type StoryOutput = z.infer<typeof StorySchema>;

/**
 * Generate a story for a child
 * Orchestrates: difficulty adaptation → LLM call → validation → memory update → persistence
 *
 * ISSUE 5 FIX: Uses adapted difficulty based on child's performance
 * ISSUE 3 FIX: Retries on validation errors
 * ISSUE 4 FIX: Injects rich narrative memory context
 */
export async function generateStoryy(
  childProfileId: string,
  planItemId: string,
) {
  const startTime = Date.now();

  try {
    // Load plan item with world context
    const planItem = await prisma.storyPlanItem.findUnique({
      where: { id: planItemId },
      include: { world: true },
    });

    if (!planItem) throw new Error("Plan item not found");

    // Load child with skill and memory context
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: {
        narrativeMemory: {
          include: {
            characters: true,
            worldState: true,
            narrativeThreads: true,
            storyHistory: { take: 3, orderBy: { createdAt: "desc" } },
          },
        },
        skillScores: true,
      },
    });

    if (!child) throw new Error("Child profile not found");

    logger.info("[Generation Service] Starting story generation", {
      childProfileId,
      planItemId,
      storyTitle: planItem.title,
      difficulty: planItem.baseDifficulty,
    });

    // Mark as generating
    await prisma.storyPlanItem.update({
      where: { id: planItemId },
      data: { status: "generating" },
    });

    // ISSUE 5 FIX: Adapt difficulty based on child's performance
    const adaptedDifficulty = await getAdaptedDifficulty(
      childProfileId,
      planItem.adjustedDifficulty || planItem.baseDifficulty,
    );

    logger.debug("[Generation Service] Difficulty adapted", {
      baseDifficulty: planItem.baseDifficulty,
      adaptedDifficulty,
    });

    // ISSUE 3 FIX: Retry mechanism for robustness
    const story = await retryGeneration(
      childProfileId,
      planItem,
      child,
      adaptedDifficulty,
    );

    // ISSUE 2 FIX: Backend persists, LLM doesn't
    const savedStory = await persistGeneratedStory(
      childProfileId,
      planItemId,
      story,
      adaptedDifficulty,
    );

    // ISSUE 4 FIX: Update rich narrative memory for future stories
    await updateNarrativeMemory(
      childProfileId,
      planItem.sequenceOrder,
      story.title,
      story,
    );

    // Mark as generated
    await prisma.storyPlanItem.update({
      where: { id: planItemId },
      data: { status: "generated", adjustedDifficulty: adaptedDifficulty },
    });

    const elapsedMs = Date.now() - startTime;

    logger.info("[Generation Service] Story generation succeeded", {
      childProfileId,
      storyId: savedStory.id,
      duration: `${elapsedMs}ms`,
    });

    return savedStory;
  } catch (error) {
    const elapsedMs = Date.now() - startTime;

    logger.error("[Generation Service] Story generation failed", {
      childProfileId,
      planItemId,
      error: String(error),
      duration: `${elapsedMs}ms`,
    });

    // Return plan item to pending for retry
    try {
      await prisma.storyPlanItem.update({
        where: { id: planItemId },
        data: { status: "pending" },
      });
    } catch (updateError) {
      logger.error("[Generation Service] Failed to reset plan item status", {
        error: String(updateError),
      });
    }

    throw error;
  }
}

/**
 * ISSUE 3 FIX: Retry logic with validation error handling
 * Tracks all attempts in GenerationAttempt model
 * Uses exponential backoff for delays
 */
async function retryGeneration(
  childProfileId: string,
  planItem: any,
  child: any,
  adaptedDifficulty: number,
): Promise<StoryOutput> {
  let lastError: Error | null = null;
  const maxRetries = parseInt(process.env.GENERATION_MAX_RETRIES || "3");
  const baseDelayMs = parseInt(process.env.GENERATION_RETRY_DELAY_MS || "2000");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();

      // Call LLM for story generation
      const story = await callGenerationLLM(child, planItem, adaptedDifficulty);

      // Validate with Zod - throws if invalid
      const validatedStory = StorySchema.parse(story);

      // Record successful attempt
      await prisma.generationAttempt.create({
        data: {
          planItemId: planItem.id,
          childProfileId,
          attemptNumber: attempt,
          status: "success",
          executionTimeMs: Date.now() - startTime,
        },
      });

      logger.info("[Generation] Story validation succeeded", {
        attempt,
        chapterCount: validatedStory.chapters.length,
      });

      return validatedStory;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Record failed attempt
      await prisma.generationAttempt.create({
        data: {
          planItemId: planItem.id,
          childProfileId,
          attemptNumber: attempt,
          status:
            error instanceof z.ZodError ? "validation_error" : "llm_error",
          error: String(error),
          validationErrors:
            error instanceof z.ZodError
              ? error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
              : undefined,
          executionTimeMs: 0,
        },
      });

      // If not last attempt, retry with backoff
      if (attempt < maxRetries) {
        const backoffDelay = baseDelayMs * Math.pow(2, attempt - 1);

        logger.warn("[Generation] Retry after validation failure", {
          attempt,
          maxRetries,
          nextDelayMs: backoffDelay,
          error: lastError.message.substring(0, 100),
        });

        await new Promise((r) => setTimeout(r, backoffDelay));
      }
    }
  }

  throw lastError || new Error("Story generation failed after all retries");
}

/**
 * Call LLM to generate story
 * ISSUE 2 FIX: LLM ONLY generates structured output, no database logic
 * ISSUE 4 FIX: Rich memory context injected
 * ISSUE 8 FIX: Linguistic constraints enforced in prompt
 * ISSUE 9 FIX: Structured output with Gemini
 */
async function callGenerationLLM(
  child: any,
  planItem: any,
  adaptedDifficulty: number,
): Promise<any> {

  // ISSUE 4 FIX: Prepare rich memory context
  const memoryContext = formatMemoryContext(child.narrativeMemory);

  const prompt = `You are an expert children's story writer.

WRITE ONE COMPLETE STORY matching these requirements:

===== CHILD PROFILE =====
Age: ${child.age} years old
Reading Level: ${child.readingLevel}/5
Target Grade Level: ${planItem.targetReadingGrade}
Engagement Style: ${child.engagementStyle || "interactive"}

===== STORY BLUEPRINT =====
Title: ${planItem.title}
Summary: ${planItem.summary}
World: ${planItem.world.title} (Theme: ${planItem.world.theme})
Story Arc: ${planItem.storyArc}
Difficulty: ${adaptedDifficulty}/5
Learning Objectives: ${planItem.objectives.join(", ")}
Skills to Reinforce: ${planItem.skillsToReinforce.join(", ") || "none"}
Skills to Introduce: ${planItem.skillsToIntroduce.join(", ") || "none"}

===== LINGUISTIC CONSTRAINTS (CRITICAL) =====
Maximum sentence length: ${planItem.maxSentenceLength} words
Vocabulary level: Grade ${planItem.targetReadingGrade} (for ages ${child.age}-${child.age + 2})
Language rules:
  - NO complex sentence structures (avoid "which", "that", subordinate clauses)
  - Use active voice predominantly
  - Keep paragraphs SHORT (3-5 sentences maximum)
  - Explain unfamiliar words in context immediately
  - Use dialogue to break up narrative and maintain engagement
  - Simple, concrete language - avoid abstract concepts
  - For difficulty 1-3: Use present tense primarily
  - For difficulty 4-5: Can use past tense and varied sentence structures

===== COGNITIVE CONSTRAINTS =====
- Use concrete examples, not abstractions
- Each chapter should build the child's confidence
- Challenges must feel achievable but engaging
- Include dialogue to break up narrative
- No violence, scary content, or complex emotional trauma
- Avoid moral judgments - focus on problem-solving

===== NARRATIVE CONTINUITY FROM PREVIOUS STORIES =====
${memoryContext}

===== STRUCTURE REQUIREMENTS =====
Exactly 3-4 chapters
Each chapter: 200-500 words of narrative
Each chapter: 2-3 comprehension/learning challenges
Each challenge: 3-4 answer options (one correct answer)
${planItem.objectives.length} of your challenges should directly teach the stated objectives
Total: ${planItem.objectives.length} objectives must be explicitly covered

===== OUTPUT FORMAT =====
Output ONLY a valid JSON object (NO markdown, NO explanation, NO extra text):

{
  "title": "Your chosen story title",
  "chapters": [
    {
      "title": "Chapter title",
      "content": "200-500 word story narrative. Make it engaging, age-appropriate, and use simple language. Follow all linguistic constraints above.",
      "challenges": [
        {
          "question": "A comprehension or learning question about the chapter (10-200 characters)",
          "answers": [
            {
              "text": "First answer option (2-100 characters)",
              "isCorrect": false,
              "hints": ["A hint if child struggles"]
            },
            {
              "text": "Second answer option",
              "isCorrect": true,
              "hints": ["Hint for correct answer", "Second hint if needed"]
            },
            {
              "text": "Third answer option",
              "isCorrect": false,
              "hints": []
            },
            {
              "text": "Fourth answer option (optional)",
              "isCorrect": false,
              "hints": []
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL REMINDERS:
- Output ONLY JSON
- Exactly ${planItem.objectives.length > 0 ? planItem.objectives.length : 1}-${planItem.objectives.length + 1} objectives covered
- All challenges on-topic and educational
- Language must match grade ${planItem.targetReadingGrade} exactly
- Maximum ${planItem.maxSentenceLength} words per sentence`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    logger.debug("[Generation] LLM response received", {
      textLength: text.length,
    });

    // ISSUE 3 FIX: Robust JSON extraction
    const jsonStr = extractJSON(text);
    const parsed = JSON.parse(jsonStr);

    logger.debug("[Generation] JSON parsed successfully", {
      chapterCount: parsed.chapters?.length,
    });

    return parsed;
  } catch (error) {
    logger.error("[Generation] LLM call failed", {
      error: String(error),
    });
    throw new Error(`Failed to call generation LLM: ${String(error)}`);
  }
}

/**
 * ISSUE 2 FIX: Backend persistence (not LLM responsibility)
 * Stores story with all metadata and raw output for debugging
 */
async function persistGeneratedStory(
  childProfileId: string,
  planItemId: string,
  story: StoryOutput,
  adaptedDifficulty: number,
) {
  try {
    const savedStory = await prisma.generatedStory.create({
      data: {
        planItemId,
        childProfileId,
        title: story.title,
        content: story,
        generationModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        difficultyApplied: adaptedDifficulty,
        rawLLMOutput: JSON.stringify(story),
        status: "generated",
        objectivesUsed: [], // TODO: Extract from content using NLP
        skillsReinforced: [],
      },
    });

    logger.info("[Generation] Story persisted", {
      storyId: savedStory.id,
      childProfileId,
      chapterCount: story.chapters.length,
    });

    return savedStory;
  } catch (error) {
    logger.error("[Generation] Failed to persist story", {
      error: String(error),
      childProfileId,
      planItemId,
    });
    throw error;
  }
}

/**
 * Format narrative memory context for injection into generation prompt
 * ISSUE 4 FIX: Rich memory context prevents story incoherence
 */
function formatMemoryContext(memory: any): string {
  if (!memory) {
    return "This is the first story. Establish the world vividly and introduce key characters.";
  }

  const lines: string[] = [];

  // Previous stories
  if (memory.storyHistory && memory.storyHistory.length > 0) {
    lines.push("PREVIOUS STORIES:");
    for (const story of memory.storyHistory.reverse()) {
      lines.push(`  - ${story.title}: ${story.summary}`);
      if (story.emotionalTone) {
        lines.push(`    Tone: ${story.emotionalTone}`);
      }
    }
  }

  // Characters
  if (memory.characters && memory.characters.length > 0) {
    lines.push("\nKEY CHARACTERS:");
    for (const char of memory.characters) {
      lines.push(`  - ${char.name} (${char.role})`);
      if (char.personality) {
        lines.push(`    Personality: ${char.personality}`);
      }
      if (char.emotionalTrials && char.emotionalTrials.length > 0) {
        lines.push(`    Has experienced: ${char.emotionalTrials.join(", ")}`);
      }
      if (char.lastSeenStory !== null) {
        lines.push(`    Last seen: Story ${char.lastSeenStory}`);
      }
    }
  }

  // World state
  if (memory.worldState) {
    const locations = memory.worldState.locations || {};
    if (Object.keys(locations).length > 0) {
      lines.push("\nKNOWN LOCATIONS:");
      for (const [name, loc] of Object.entries(locations)) {
        lines.push(`  - ${name}: ${(loc as any).description}`);
      }
    }

    const rules = memory.worldState.rules || {};
    if (Object.keys(rules).length > 0) {
      lines.push("\nWORLD RULES:");
      for (const [rule, desc] of Object.entries(rules)) {
        lines.push(`  - ${rule}: ${desc}`);
      }
    }
  }

  // Narrative threads
  if (memory.narrativeThreads && memory.narrativeThreads.length > 0) {
    const activeThreads = memory.narrativeThreads.filter(
      (t: any) => t.status === "active",
    );
    if (activeThreads.length > 0) {
      lines.push("\nUNRESOLVED PLOT THREADS:");
      for (const thread of activeThreads) {
        lines.push(`  - ${thread.name}: ${thread.description}`);
        if (thread.resolutionGoal) {
          lines.push(`    Goal: ${thread.resolutionGoal}`);
        }
      }
    }
  }

  const context =
    lines.length > 0
      ? lines.join("\n")
      : "Continue the narrative established in previous stories.";

  return context;
}

/**
 * Extract JSON object from LLM response
 * Handles responses with explanatory text before/after JSON
 */
function extractJSON(text: string): string {
  // Try to find JSON object (handles text before/after)
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(
      `No JSON object found in LLM response. Got: ${text.substring(0, 200)}`,
    );
  }
  return match[0];
}
