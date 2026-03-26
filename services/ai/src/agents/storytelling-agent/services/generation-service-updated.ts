import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";
import { updateNarrativeMemory } from "./memory-service";
import { getAdaptedDifficulty } from "./skill-adaptation";
import model from "../../../lib/model";
import { ContentServicePayload } from "@shared/src/types";

const prisma = new PrismaClient();

/**
 * ISSUE 1 FIX: Deterministic, simple generation service
 * LLM outputs ONLY JSON structure, backend validates & persists
 * 
 * CONTENT INTEGRATION: Story structure matches content service schema
 * - Chapter contains ONE Challenge (not array)
 * - Challenge has type, question, hints, baseStars, answers
 * - Answer has text, isCorrect, order (for multiple choice sorting)
 */

// ============================================================================
// ZOD SCHEMAS - CONTENT SERVICE COMPATIBLE
// ============================================================================

const ChallengeTypeEnum = z.enum([
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "RIDDLE",
  "CHOOSE_ENDING",
  "MORAL_DECISION",
]);

const AnswerSchema = z.object({
  text: z.string().min(2).max(100),
  isCorrect: z.boolean(),
  order: z.number().min(0).max(10).optional(),
});

const ChallengeSchema = z.object({
  type: ChallengeTypeEnum,
  question: z.string().min(10).max(200),
  hints: z.array(z.string().min(5).max(100)).max(3).optional(),
  answers: z.array(AnswerSchema).min(2).max(4),
  baseStars: z.number().int().min(10).max(100).default(20).optional(),
});

const ChapterSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(100).max(850), // Max 850 characters per chapter (supports 110-150 words)
  order: z.number().default(0).optional(),
  challenge: ChallengeSchema.nullish(), // Nullish - allows both null and undefined. First 2 chapters have null, 3+ optional
});

const StorySchema = z.object({
  title: z.string().min(5).max(100),
  chapters: z.array(ChapterSchema).min(6).max(12), // Minimum 6 chapters
});

type StoryOutput = z.infer<typeof StorySchema>;

/**
 * Generate a story for a child
 * Orchestrates: difficulty adaptation → LLM call → validation → memory update → persistence
 *
 * ISSUE 5 FIX: Uses adapted difficulty based on child's performance
 * ISSUE 3 FIX: Retries on validation errors
 *  Injects rich narrative memory context
 */
export async function generateStory(
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

    // RACE CONDITION FIX: Early detection of already-generated stories
    if (planItem.status === "generated") {
      logger.warn("[Generation Service] Story already generated, skipping", {
        childProfileId,
        planItemId,
        storyTitle: planItem.title,
      });
      
      // Return existing generated story to prevent duplicate work
      const existingStory = await prisma.generatedStory.findUnique({
        where: { planItemId },
      });
      
      if (existingStory) {
        return existingStory;
      }
    }

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

    // Mark as generating (atomic transaction to prevent race conditions)
    const updatedPlanItem = await prisma.storyPlanItem.update({
      where: { id: planItemId },
      data: { status: "generating" },
    });

    // Verify status change was successful
    if (updatedPlanItem.status !== "generating") {
      throw new Error("Failed to set status to 'generating'");
    }

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

    // Backend persists, LLM doesn't
    const savedStory = await persistGeneratedStory(
      childProfileId,
      planItemId,
      story,
      adaptedDifficulty,
    );

    //  Update rich narrative memory for future stories
    await updateNarrativeMemory(
      childProfileId,
      planItem.sequenceOrder,
      story.title,
      story,
    );

    // Mark as generated
    const finalUpdate = await prisma.storyPlanItem.update({
      where: { id: planItemId },
      data: { status: "generated", adjustedDifficulty: adaptedDifficulty },
    });

    // Verify final status was set correctly
    if (finalUpdate.status !== "generated") {
      throw new Error("Failed to set final status to 'generated'");
    }

    const elapsedMs = Date.now() - startTime;

    logger.info("[Generation Service] Story generation succeeded", {
      childProfileId,
      storyId: savedStory.id,
      planItemId,
      duration: `${elapsedMs}ms`,
      statusConfirmed: finalUpdate.status === "generated",
    });

    return savedStory;
  } catch (error) {
    logger.error("[Generation Service] Story generation failed", {
      error: String(error),
      planItemId,
      childProfileId,
      stack: error instanceof Error ? error.stack : "N/A",
    });

    // Update plan item back to pending on error (with verification)
    try {
      const resetResult = await prisma.storyPlanItem.update({
        where: { id: planItemId },
        data: { status: "pending" },
      });

      logger.info("[Generation Service] Status reset to pending after error", {
        planItemId,
        statusConfirmed: resetResult.status === "pending",
      });
    } catch (updateError) {
      logger.error("[Generation Service] CRITICAL: Failed to reset status on error", {
        planItemId,
        originalError: String(error),
        resetError: String(updateError),
      });
      // Re-throw the original error since status reset is critical for retry safety
      throw error;
    }

    throw error;
  }
}

/**
 * ISSUE 3 FIX: Retry with validation
 * Attempts to generate and validate story with exponential backoff
 */
async function retryGeneration(
  childProfileId: string,
  planItem: any,
  child: any,
  adaptedDifficulty: number,
): Promise<StoryOutput> {
  const maxRetries = 3;
  const baseDelayMs = 2000;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();

      // Call LLM to get raw story
      const story = await callGenerationLLM(
        child,
        planItem,
        adaptedDifficulty,
      );

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
 * Now provides complete world context and story sequence information
 * for narrative continuity and integrity
 */
async function callGenerationLLM(
  child: any,
  planItem: any,
  adaptedDifficulty: number,
): Promise<any> {

  // Load complete world with all stories to provide sequence context
  const worldWithStories = await prisma.storyPlanWorld.findUnique({
    where: { id: planItem.worldId },
    include: {
      stories: {
        orderBy: { sequenceOrder: "asc" },
      },
    },
  });

  if (!worldWithStories) {
    throw new Error("World not found for sequence context");
  }

  // Calculate story position in sequence
  const storyPosition = worldWithStories.stories.findIndex(
    (s) => s.id === planItem.id
  );
  const totalStoriesInWorld = worldWithStories.stories.length;
  const isFirstStory = storyPosition === 0;
  const isLastStory = storyPosition === totalStoriesInWorld - 1;

  // Get previous story context if not first
  let previousStoryContext = "";
  if (storyPosition > 0) {
    const previousStory = worldWithStories.stories[storyPosition - 1];
    const generatedPreviousStory = await prisma.generatedStory.findUnique({
      where: { planItemId: previousStory.id },
    });
    if (generatedPreviousStory) {
      previousStoryContext = `
**PREVIOUS STORY IN SEQUENCE - Story ${storyPosition} of ${totalStoriesInWorld}:**
Title: ${previousStory.title}
Summary: ${previousStory.summary}
Learning Objectives: ${previousStory.objectives?.join(", ") || "Not specified"}
- Characters Introduced: ${
  typeof generatedPreviousStory.content === "object" &&
  generatedPreviousStory.content &&
  "metadata" in generatedPreviousStory.content &&
  typeof generatedPreviousStory.content.metadata === "object" &&
  "mainCharacters" in (generatedPreviousStory.content.metadata as any)
    ? (generatedPreviousStory.content.metadata as any).mainCharacters?.join(", ")
    : "Check narrative memory above"
}
- Key Conflicts Established: ${
  typeof generatedPreviousStory.content === "object" &&
  generatedPreviousStory.content &&
  "metadata" in generatedPreviousStory.content &&
  typeof generatedPreviousStory.content.metadata === "object" &&
  "keyConflicts" in (generatedPreviousStory.content.metadata as any)
    ? (generatedPreviousStory.content.metadata as any).keyConflicts?.join(", ")
    : "Check narrative memory above"
}

Your story MUST:
✓ Build on these characters and conflicts naturally
✓ Advance the learning progression from Story ${storyPosition} to Story ${storyPosition + 2}
✓ Maintain character consistency and world logic from previous story
✓ Increase difficulty/complexity appropriate to position in sequence`;
    }
  }

  // Get upcoming story context if not last
  let upcomingStoryContext = "";
  if (!isLastStory) {
    const nextStoryCount = totalStoriesInWorld - storyPosition - 1;
    const nextStories = worldWithStories.stories.slice(
      storyPosition + 1,
      Math.min(storyPosition + 3, totalStoriesInWorld)  // Show next 1-2 stories
    );
    upcomingStoryContext = `
**UPCOMING TRAJECTORY IN WORLD - ${nextStoryCount} stories remaining:**
${nextStories
  .map(
    (s, idx) => `  Story ${storyPosition + idx + 2}: "${s.title}"
    Learning Focus: ${s.objectives?.join(", ") || "Not specified"}
    Arc: ${s.storyArc}`
  )
  .join("\n")}

Your story MUST SET UP for these upcoming stories by:
✓ Introducing elements or conflicts that will be resolved in Story ${storyPosition + 2}
✓ Teaching foundational skills needed for upcoming complex stories
✓ Maintaining narrative threads that span multiple stories`;
  }

  //  Prepare rich memory context
  const memoryContext = formatMemoryContext(child.narrativeMemory);

  // Determine pronouns based on child's gender
  const pronouns = 
    child.gender === "boy" ? { subject: "he", object: "him", possessive: "his" } :
    child.gender === "girl" ? { subject: "she", object: "her", possessive: "her" } :
    { subject: "they", object: "them", possessive: "their" };

  // Calculate linguistic constraints based on difficulty
  const readingGrade = Math.ceil(adaptedDifficulty * 1.2); // 1.0→1, 5.0→6
  const maxSentenceLength = 12 + Math.ceil(adaptedDifficulty * 2); // 1→12 words, 5→20 words

  const prompt = `## PROFESSIONAL CHILDREN'S STORY WRITER - READDLY AI
  
### APP CONTEXT & YOUR MISSION
You are acting as a PROFESSIONAL CHILDREN'S STORY WRITER for "Readdly" - an AI-powered educational reading platform dedicated to nurturing young readers through personalized, engaging narratives. Your mission is to create stories that:

✓ Build CONFIDENCE in readers by matching exact developmental stage
✓ Teach LEARNING OBJECTIVES through natural narrative integration (NO lectures)
✓ Foster LOVE OF READING through compelling characters and age-appropriate themes
✓ Scaffold COMPREHENSION by building from pure story enjoyment to active learning
✓ Respect the child's UNIQUE PACE and learning style

This story is ONE CHAPTER in a carefully planned multi-chapter, multi-story journey. Your role is to maintain narrative continuity while advancing the child's learning objectives.

---

### WORLD & STORY SEQUENCE CONTEXT (CRITICAL FOR CONTINUITY)
**World:** ${worldWithStories.title} (Theme: ${worldWithStories.theme})
**World Learning Focus:** ${worldWithStories.learningFocus?.join(", ") || "Not specified"}
**World Difficulty:** ${worldWithStories.baseDifficulty}/5
**Total Stories in This World:** ${totalStoriesInWorld}

**THIS STORY'S POSITION:** Story ${storyPosition + 1} of ${totalStoriesInWorld}
${isFirstStory ? "🌟 **THIS IS THE FIRST STORY** - Introduce world, main characters, core conflicts, establish tone" : `🔄 **This is a SUBSEQUENT story** - Build on established characters and conflicts from Story ${storyPosition}`}
${isLastStory ? "🏁 **THIS IS THE FINAL STORY** - Provide climax/resolution to major conflicts, demonstrate complete learning" : ""}

**Your Story's Role:**
- Story Arc Type: ${planItem.storyArc || "development"}
- Learning Objectives: ${planItem.objectives?.join(", ") || "Not specified"}
- Skills to Introduce: ${planItem.skillsToIntroduce?.join(", ") || "None new"}
- Skills to Reinforce: ${planItem.skillsToReinforce?.join(", ") || "None"}
- Base Difficulty: ${planItem.baseDifficulty}/5 (adapted to child: ${adaptedDifficulty.toFixed(1)}/5)

${previousStoryContext}

${upcomingStoryContext}

---

### ABOUT THE CHILD YOU'RE WRITING FOR
**Name:** ${child.name}
**Age:** ${child.age} years old
**Gender:** ${child.gender}
**Reading Level:** ${child.readingLevel}/5 (1=struggling, 5=advanced reader)
**Adapted Difficulty:** ${adaptedDifficulty.toFixed(2)}/5 (personalized to their current performance)
**Preferred Engagement Style:** ${child.engagementStyle || "interactive"} (tells us how they like to engage with stories)

**Reading Development Stage:** At age ${child.age}, this child:
- Responds best to: ${adaptedDifficulty <= 2 ? "concrete stories with clear causality, simple emotions, familiar settings" : adaptedDifficulty <= 3 ? "stories with some character complexity and mild suspense" : "stories with emotional depth, character growth, and nuanced conflicts"}
- Is developing: ${adaptedDifficulty <= 2 ? "foundational comprehension, vocabulary building, sequence understanding" : adaptedDifficulty <= 3 ? "inference skills, character motivation understanding, prediction abilities" : "critical thinking, emotional intelligence, thematic understanding"}

**How This Story Fits Their Growth:**
- Position in World: Story ${storyPosition + 1}/${totalStoriesInWorld}
${isFirstStory ? "- **FIRST STORY PURPOSE**: This introduces the child to the world, characters, and basic conflicts. Build their confidence with a compelling entry point." : `- **PROGRESSION**: After ${storyPosition} previous stories, child has learned foundation skills. This story builds on that knowledge.`}
- Skills From Previous Stories: ${planItem.skillsToReinforce?.join(", ") || "None yet - starting fresh"}
- New Skills to Teach: ${planItem.skillsToIntroduce?.join(", ") || "Foundation skills for the world"}
- Difficulty Trajectory: ${isFirstStory ? "Starting point" : "Increasing gradually"} (${planItem.baseDifficulty}/5 base) → more complex as child progresses through world

---

### CHARACTER IDENTITY - ${child.name} IS THE PROTAGONIST
**CRITICAL: ${child.name} is the MAIN CHARACTER/HERO of this story - NOT a supporting character**

**This is a story ABOUT ${child.name}, told from ${pronouns.possessive} perspective:**
  ✓ ${child.name} is the protagonist and point-of-view character
  ✓ The entire narrative centers on ${pronouns.subject}/${pronouns.object}/${pronouns.possessive} journey, challenges, and growth
  ✓ ${child.name} makes key decisions that drive the plot forward
  ✓ Readers experience the world through ${pronouns.possessive} eyes and emotions
  ✓ ${pronouns.subject} faces obstacles and overcomes them (with support from secondary characters)
  ✓ By story's end, ${pronouns.subject} has grown, learned, and will be changed by the experience

**Other characters are secondary:**
  - They support ${pronouns.possessive} journey
  - They provide guidance, companionship, or create conflict
  - They are NOT the focus - ${child.name} is

**Gender-specific character authenticity:**
${child.gender === "boy" ? `  - Write ${child.name} as a boy with authentic experiences appropriate to ${pronouns.possessive} age` : child.gender === "girl" ? `  - Write ${child.name} as a girl with authentic experiences appropriate to ${pronouns.possessive} age` : `  - Write ${child.name} with authentic, inclusive experiences appropriate to their age`}
  - Avoid stereotypes; let personality and individual traits shine through
  - Use pronouns correctly and consistently throughout (${pronouns.subject}/${pronouns.object}/${pronouns.possessive})

---

### THE STORY YOU'RE WRITING
**Story In Series:** "${planItem.title}" (Story ${storyPosition + 1} of ${totalStoriesInWorld} in "${worldWithStories.title}")
**World/Setting:** ${worldWithStories.title} (${worldWithStories.theme} theme)
**Story Purpose:** ${planItem.summary || "Create an engaging, age-appropriate narrative"}

**How This Story Advances the World's Learning:**
- World Learning Focus: ${worldWithStories.learningFocus?.join(", ") || "Varied"}
- This Story Teaches: ${planItem.objectives?.join(", ") || "Foundation for world"}
- Story Arc Type: ${planItem.storyArc} (${storyPosition === 0 ? "Introduction phase" : storyPosition < totalStoriesInWorld - 2 ? "Development phase" : "Climax/Resolution phase"})

**Narrative Continuity Requirements:**
${
  isFirstStory
    ? `✓ Introduce main characters who will appear throughout the world
✓ Establish the world's operating rules, dangers, and opportunities
✓ Create the core conflict that drives the world's narrative
✓ Set tone for entire world (mystery? adventure? challenge? discovery?)`
    : `✓ Reference characters and conflicts from Story ${storyPosition === 1 ? "1" : `${storyPosition}`}
✓ Show character growth from previous stories
✓ Deepen established conflicts or introduce related complications
✓ Build naturally on what child already knows from this world`
}

**Learning Integration:** This story teaches through narrative - NOT through didactic lessons. Your job is to weave learning seamlessly into a compelling story the child WANTS to read.

---

### PROFESSIONAL LINGUISTIC STANDARDS (FOLLOW EXACTLY)
**Target Reading Grade:** ${readingGrade} (Flesch-Kincaid measure)
**Maximum Sentence Length:** ${maxSentenceLength} words

**Language Artistry Guidelines** (Professional standards for children's writing):
  ✓ Use SIMPLE, CONCRETE vocabulary appropriate for age ${child.age} (no reading above level)
  ✓ Employ ACTIVE voice primarily ("The cat jumped" not "The jump was made by the cat")
  ✓ Avoid COMPLEX SENTENCE STRUCTURES and subordinate clauses that disrupt flow
  ✓ Maintain SHORT paragraphs (2-4 sentences) for visual readability
  ✓ Use DIALOGUE naturally to advance plot and reveal character
  ✓ Embed UNFAMILIAR VOCABULARY in context clues (never leave reader confused)
  ✓ Create VIVID, SENSORY details in simple language ("soft fur" not "tactile experiences")
  ✓ Honor CHILD PERSPECTIVE - narrate at the child's eye level, not from adult overview
  ✓ Maintain CONSISTENT TONE throughout (don't shift between playful and formal)
  ✓ For difficulty 1-2: Use present tense exclusively for immediacy and clarity
  ✓ For difficulty 3+: Can vary tense and structure for literary sophistication

**Content Boundaries** (Professional ethics for children's literature):
  ✗ NO violence, graphic content, or intense trauma
  ✗ NO adult themes or scary imagery inappropriate to age
  ✗ NO moral preaching or judgmental characters
  ✓ YES to problem-solving, discovery learning, natural consequences
  ✓ YES to emotions (sadness, frustration, disappointment) handled with care
  ✓ YES to agency - children making choices and learning from outcomes


---

### PEDAGOGICAL STRUCTURE (Build Comprehension Intentionally)
**Chapters 1-2: FOUNDATION PHASE**
  Purpose: Pure narrative enjoyment and comprehension building
  Goal: Child becomes immersed without cognitive demand
  Strategy: No challenges - let them experience the story
  Focus: Plot clarity, character introduction, world-building

**Chapters 3+: APPLICATION PHASE**
  Purpose: Gradual introduction of interactive learning elements
  Goal: Child applies comprehension skills without breaking immersion
  Strategy: Challenges are OPTIONAL (not every chapter needs one)
  Variety: Mix narrative-only chapters with challenge chapters for natural pacing

---

### NARRATIVE CONTINUITY & CHARACTER MEMORY
${memoryContext}

---

### CHAPTER SPECIFICATIONS FOR THIS SPECIFIC STORY
**Total Chapters Required:** 6-8 chapters (minimum 6)
**Chapter Length:** 110-120 words per chapter (STRICT - includes all text in chapter content)
**Chapter Strategy:**
  - Chapters 1-2: NO challenge (null) - pure narrative
  - Chapters 3-8: Optional challenges (include if it advances the story, omit if it disrupts narrative flow)
  - Each challenge teaches something specific from the world's learning focus
  - Challenges feel like NATURAL STORY MOMENTS, not inserted homework

===== NARRATIVE CONTINUITY FROM PREVIOUS STORIES =====
${memoryContext}

===== STRUCTURE REQUIREMENTS =====
Create exactly 6-8 chapters minimum (not 3-4)
Each chapter:
  - words : 110 - 120 words
  - CHAPTERS 1-2: NO challenge - pure narrative only for comprehension building
  - CHAPTERS 3+: Challenge is OPTIONAL (not required for every chapter)
  - When included, challenge must be comprehension or skills-based

---

### OUTPUT FORMAT (MUST BE VALID JSON ONLY)
\`\`\`json
{
  "title": "The chosen story title",
  "chapters": [
    {
      "title": "Chapter 1 Title",
      "content": "110 - 120 words of engaging narrative for pure comprehension building. No challenge here.",
      "order": 0,
      "challenge": null
    },
    {
      "title": "Chapter 2 Title",
      "content": "110 - 120 words continuing the narrative. Still focusing on comprehension without challenge.",
      "order": 1,
      "challenge": null
    },
    {
      "title": "Chapter 3 Title",
      "content": "110 - 120 words. Now challenges MAY be included (optional).",
      "order": 2,
      "challenge": {
        "type": "MULTIPLE_CHOICE",
        "question": "A comprehension question about the chapter content",
        "hints": ["A helpful hint if child struggles"],
        "baseStars": 20,
        "answers": [
          { "text": "Correct answer", "isCorrect": true, "order": 0 },
          { "text": "Wrong answer 1", "isCorrect": false, "order": 1 },
          { "text": "Wrong answer 2", "isCorrect": false, "order": 2 }
        ]
      }
    },
    {
      "title": "Chapter 4 Title",
      "content": "110 - 120 words. Challenges are optional for variety.",
      "order": 3,
      "challenge": null
    },
    {
      "title": "Chapter 5 Title",
      "content": "110 - 120 words continuing the engaging story.",
      "order": 4,
      "challenge": {
        "type": "TRUE_FALSE",
        "question": "Is this statement true based on the chapter?",
        "hints": ["Think about what happened..." ],
        "baseStars": 20,
        "answers": [
          { "text": "True", "isCorrect": true, "order": 0 },
          { "text": "False", "isCorrect": false, "order": 1 }
        ]
      }
    },
    {
      "title": "Chapter 6 Title",
      "content": "110 - 120 words. Conclude the story with engaging narrative and closure.",
      "order": 5,
      "challenge": null
    }
  ]
}
\`\`\`

### CHALLENGE DESIGN (When You Include Challenges in Chapters 3+)
**Challenge Types** - Pick based on story moment and learning objective:

- **MULTIPLE_CHOICE**: Comprehension check (3-4 options, 1 correct)
  - Use for: Plot details, character actions, sequence
  - Example: "What did Alex find in the forest?"

- **TRUE_FALSE**: Quick comprehension recall (2 options)
  - Use for: Statement verification, fact checking
  - Example: "The cat was sleeping when the door opened."

- **RIDDLE**: Critical thinking & inference (3-4 options, 1 correct)
  - Use for: Inference skills, puzzle-solving
  - Example: "I'm round and roll fast. What am I?"

- **CHOOSE_ENDING**: Creative prediction (all marked correct)
  - Use for: Prediction skills, reader agency, divergent thinking
  - Example: "What do you think will happen next?"
  - Note: All answers are "correct" so child can explore possibilities

- **MORAL_DECISION**: Character empathy & ethics (all marked correct)
  - Use for: Emotional intelligence, perspective-taking
  - Example: "Should Alex tell the truth or keep the secret?"
  - Note: All answers are "correct" to validate different ethical perspectives

### PROFESSIONAL STANDARDS - QUALITY REQUIREMENTS
✓ **Output ONLY valid JSON** (no markdown, comments, or text outside JSON)
✓ **Narrative Quality**: Each chapter tells a compelling micro-story with clear beginning-middle-end
✓ **Language Precision**: Every word chosen for clarity and impact; no filler
✓ **Comprehension Support**: New vocabulary has context clues; causality is crystal clear
✓ **Character Consistency**: Personalities and voices remain stable across chapters
✓ **Pacing**: Story moves forward meaningfully each chapter; no repetition
✓ **Chapter Integrity**: Each chapter can stand alone AND connects to larger narrative
✓ **Word Count Adherence**: Chapters are 110-120 words EXACTLY (critical for reading level)
✓ **Sentence Structure**: NO sentence exceeds ${maxSentenceLength} words; nothing ambiguous
✓ **Age Appropriateness**: Content, themes, and references all suitable for ${child.age}-year-olds
✓ **Educational Value**: Learning objectives woven naturally (never obvious or forced)`;

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
      firstChapterHasChallenges: parsed.chapters?.[0]?.challenge ? true : false,
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
 * Backend persistence (not LLM responsibility)
 * Stores story with all metadata and returns contentServicePayload for content DB
 */
async function persistGeneratedStory(
  childProfileId: string,
  planItemId: string,
  story: StoryOutput,
  adaptedDifficulty: number,
) {
  try {
    // Load plan item with world context to get worldId
    const planItem = await prisma.storyPlanItem.findUnique({
      where: { id: planItemId },
      include: { world: true },
    });

    if (!planItem) throw new Error("Plan item not found for persistence");

    // Build content service payload - matches content service schema exactly
    const contentServicePayload : ContentServicePayload = {
      worldId: planItem.worldId,
      title: story.title,
      description: `AI-generated story with difficulty ${adaptedDifficulty.toFixed(1)}/5`,
      difficulty: Math.round(adaptedDifficulty),
      order: planItem.sequenceOrder,
      chapters: story.chapters.map((ch, chapterIdx) => ({
        title: ch.title,
        content: ch.content,
        order: chapterIdx,
        // Chapters 1-2: no challenge (null). Chapters 3+: challenge optional
        challenge: ch.challenge ? {
          type: ch.challenge.type,
          question: ch.challenge.question,
          hints: ch.challenge.hints || [],
          baseStars: ch.challenge.baseStars || 20,
          answers: ch.challenge.answers.map((ans, ansIdx) => ({
            text: ans.text,
            isCorrect: ans.isCorrect,
            order: ans.order ?? ansIdx,
          })),
        } : null,
      })),
    };

    // Save to AI service for tracking
    const generatedStory = await prisma.generatedStory.create({
      data: {
        planItemId,
        childProfileId,
        title: story.title,
        content: contentServicePayload as any,
        generationModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        difficultyApplied: adaptedDifficulty,
        rawLLMOutput: JSON.stringify(story),
        status: "generated",
      },
      include: {
        planItem: {
          include: {
            world: {
              include: {
                stories: true,
              },
            },
          },
        },
      },
    });

    logger.info("[Generation Service] Story persisted", {
      storyId: generatedStory.id,
      title: story.title,
      chapterCount: story.chapters.length,
      difficulty: adaptedDifficulty,
    });

    // Return both AI record and content service payload
    return generatedStory;
  } catch (error) {
    logger.error("[Generation Service] Failed to persist story", {
      error: String(error),
      planItemId,
    });
    throw error;
  }
}

/**
 * Format narrative memory context for injection into generation prompt
 *  Rich memory context prevents story incoherence
 */
function formatMemoryContext(memory: any): string {
  if (!memory) {
    return "This is the first story. Establish the world vividly with clear characters and setting.";
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
        lines.push(
          `    Experienced: ${char.emotionalTrials.join(", ")}`,
        );
      }
    }
  }

  // World state
  if (memory.worldState) {
    const locations = (memory.worldState.locations as Record<string, any>) || {};
    if (Object.keys(locations).length > 0) {
      lines.push("\nKNOWN LOCATIONS:");
      for (const [name, loc] of Object.entries(locations)) {
        lines.push(`  - ${name}: ${(loc as any).description}`);
      }
    }

    const rules = (memory.worldState.rules as Record<string, any>) || {};
    if (Object.keys(rules).length > 0) {
      lines.push("\nWORLD RULES:");
      for (const [rule, desc] of Object.entries(rules)) {
        lines.push(`  - ${rule}: ${desc}`);
      }
    }
  }

  // Active narrative threads
  if (memory.narrativeThreads && memory.narrativeThreads.length > 0) {
    const activeThreads = memory.narrativeThreads.filter(
      (t: any) => t.status === "active",
    );
    if (activeThreads.length > 0) {
      lines.push("\nACTIVE STORY THREADS:");
      for (const thread of activeThreads) {
        lines.push(`  - ${thread.name}: ${thread.description}`);
        if (thread.resolutionGoal) {
          lines.push(`    Goal: ${thread.resolutionGoal}`);
        }
      }
    }
  }

  return lines.length > 0
    ? lines.join("\n")
    : "Build upon the established world and characters.";
}

/**
 * Extract JSON from LLM response that may contain markdown or extra text
 * ISSUE 3 FIX: Robust parsing handles various response formats
 */
function extractJSON(text: string): string {
  // Try to find JSON in markdown code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // If no JSON found, log error and throw
  logger.error("[Generation] Failed to extract JSON from LLM response", {
    responsePreview: text.substring(0, 200),
  });
  throw new Error(
    `Invalid LLM response format. Could not find JSON. Response starts with: ${text.substring(0, 100)}`,
  );
}
