import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { ChildProfile, PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";
import model from "../../../lib/model";
import type { PlanContext } from "./plan-completion";

const prisma = new PrismaClient();

/**
 * ISSUE 1 FIX: NO LangGraph agents. Simple, explicit service function.
 * ISSUE 2 FIX: LLM ONLY generates JSON output. NO database operations in LLM.
 * ISSUE 3 FIX: Structured output validation with Zod + retries.
 * ISSUE 6 FIX: Automatic plan extension triggers at thresholds.
 * ISSUE 8 FIX: Age-calibrated linguistic constraints for stories.
 * ISSUE 9 FIX: Robust retry with exponential backoff.
 */

// Zod schema for planning validation - enforces structure
const PlanSchema = z.object({
  globalGoal: z.string().min(20),
  antagonist: z.string().min(3).optional().nullable(),
  progressionStyle: z.enum(["linear", "episodic", "spiral"]),
  worlds: z.array(
    z.object({
      theme: z.string().min(3),
      title: z.string().min(5),
      description: z.string().min(50).max(1000),
      atmosphere: z.string().max(200),
      learningFocus: z.array(z.string()).min(1).max(3),
      baseDifficulty: z.coerce.number().min(1).max(5),
      estimatedStoryCount: z.coerce.number().min(5).max(15),
      stories: z.array(
        z.object({
          title: z.string().min(5).max(100),
          summary: z.string().min(100).max(300),
          storyArc: z.enum([
            "introduction",
            "development",
            "climax",
            "resolution",
          ]),
          objectives: z.array(z.string()).min(1).max(3),
          skillsToReinforce: z.array(z.string()),
          skillsToIntroduce: z.array(z.string()),
          baseDifficulty: z.coerce.number().min(1).max(5),
        }),
      ),
    }),
  ),
});

type PlanOutput = z.infer<typeof PlanSchema>;

/**
 * Generate a long-term story plan for a child
 * Creates multiple worlds, each with themed stories in strict order
 *
 * ISSUE 1 FIX: Simple service function (no agents)
 * ISSUE 6 FIX: Sets extension point for automatic plan expansion
 * ISSUE 7 FIX: Enforces sequential world + story ordering
 * PHASE 3: Accepts previous plan context for continuation planning
 */
export async function generateStoryPlan(
  childProfileId: string,
  previousPlanContext?: PlanContext,
) {
  try {
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!child) throw new Error("Child profile not found");

    logger.info("[Planning Service] Starting plan generation", {
      childProfileId,
      age: child.age,
      themes: child.favoriteThemes,
      readingLevel: child.readingLevel,
      isPlanContinuation: !!previousPlanContext,
      planVersion: previousPlanContext?.planVersion,
    });

    const plan = await retryWithBackoff(
      async () => {
        return await callPlanningLLM(child, previousPlanContext);
      },
      {
        maxRetries: parseInt(process.env.GENERATION_MAX_RETRIES || "3"),
        delayMs: parseInt(process.env.GENERATION_RETRY_DELAY_MS || "2000"),
      },
    );

    const savedPlan = await persistPlan(
      childProfileId,
      plan,
      previousPlanContext,
    );

    logger.info("[Planning Service] Plan generation completed", {
      childProfileId,
      worldCount: plan.worlds.length,
      totalStoriesEstimated: plan.worlds.reduce(
        (sum, w) => sum + w.estimatedStoryCount,
        0,
      ),
    });

    return savedPlan;
  } catch (error) {
    logger.error("[Planning Service] Failed to generate plan", {
      error: String(error),
      childProfileId,
    });
    throw error;
  }
}

/**
 * Call LLM for plan generation
 * ISSUE 2 FIX: LLM ONLY outputs JSON, no database logic
 * ISSUE 3 FIX: Structured output with Zod validation
 * PHASE 3: Accepts previous plan context for continuation planning
 */
async function callPlanningLLM(
  child: ChildProfile,
  previousPlanContext?: PlanContext,
): Promise<PlanOutput> {
  // Build learning history section if previous context exists
  const learningHistorySection = previousPlanContext
    ? buildLearningHistorySection(previousPlanContext)
    : "";

  const prompt = `## READDLY AI - MASTER NARRATIVE ARCHITECT

### OUR MISSION: Transform Reading Into Discovery
You are designing the COMPLETE EDUCATIONAL JOURNEY for a young reader. Your role is to create a personalized learning pathway through interconnected stories that will:

✓ **Build Confidence**: Every story meets the child at their level and gently challenges growth
✓ **Ignite Curiosity**: Multiple themed worlds explore topics the child LOVES
✓ **Develop Deep Literacy**: Progressive complexity builds comprehension from foundation to mastery
✓ **Create Narrative Memory**: Characters, conflicts, and learning threads weave across the entire journey
✓ **Foster Independent Thinking**: Stories model problem-solving and discovery, not answers
✓ **Celebrate Growth**: Reading level increases naturally across the story arc

This is not a curriculum - it's a PERSONALIZED LITERARY JOURNEY tailored to ${child.name}.

---

### THE CHILD'S READING PROFILE
**Name:** ${child.name}
**Age Group:** ${child.age} years old
**Current Reading Level:** ${child.readingLevel}/5
- Level 1-2: Emerging reader (foundational phonics, simple narratives)
- Level 3: Transitional reader (longer sentences, varied vocabulary)
- Level 4: Independent reader (complex plots, inference required)
- Level 5: Advanced reader (themes, symbolism, literary devices)

**Learning Objectives** (What ${child.name} needs to develop):
${child.objectives.map((obj, i) => `  ${i + 1}. ${obj}`).join("\n")}

**Favorite Themes** (Topics that EXCITE ${child.name}):
${child.favoriteThemes.map((theme, i) => `  ${i + 1}. ${theme}`).join("\n")}

**Engagement Style:** ${child.engagementStyle || "interactive"}
- interactive = Wants to make choices and affect outcomes
- immersive = Loves being fully absorbed in story worlds
- discovery = Prefers uncovering secrets and solving mysteries
- character-driven = Cares deeply about characters' feelings and growth

**Target Grade Level:** ${Math.min(6, Math.ceil(child.readingLevel * 1.5))} (based on reading level)
based on child age group: 
**Story Complexity for Age choose from the following options: 
"Simple plots, concrete language, familiar settings"
 "Multi-part plots, emerging complexity, some time jumps"
  "Complex narratives, character development, emotional depth, thematic exploration"

${learningHistorySection}

---

### STRATEGIC PLANNING FRAMEWORK

**1. WORLD SEQUENCE & NARRATIVE ARCHITECTURE**
   - Create EXACTLY ONE WORLD for each favorite theme (ensures focused learning)
   - Worlds are presented in STRICT ORDER (not random or mixed)
   - Each successive world BUILDS ON PREVIOUS LEARNING:
     * Characters from earlier worlds may appear (callback)
     * Skills taught in World 1 are prerequisites for World 2
     * Difficulty increases gradually world-to-world
     * Themes connect thematically (e.g., Nature → Environment → Conservation)

**2. WITHIN-WORLD STORY PROGRESSION**
   - Each world contains 8-10 individual stories (enough for deep learning)
   - Stories increase in difficulty WITHIN the world
   - Story 1: Introduces characters, world, core conflict (easiest)
   - Stories 2-7: Develop conflict, teach related skills, raise stakes
   - Stories 8-10: Climax, resolution, mastery demonstration (hardest)
   - Characters persist across world (child develops relationships)
   - Conflicts build naturally (not separate, disconnected stories)

**3. LEARNING OBJECTIVE INTEGRATION**
   Each of ${child.name}'s learning objectives MUST appear mapped to specific story moments:
   - Objective #1: Taught in World 1, Stories 3-5 (foundation building)
   - Objective #2: Taught in World 1-2, Stories 5-8 (reinforcement + expansion)
   - Objective #3: Taught across all worlds (spiral learning - deeper each time)
   - Advanced skills: Appear in later stories as child grows

**4. NARRATIVE QUALITY & CHARACTER DEVELOPMENT**
   - Create 3-5 PRIMARY CHARACTERS that ${child.name} will care about:
     * Main character: Face relatable challenges, model growth
     * Supporting characters: Each teaches something, have their own arcs
     * Antagonist: Misguided (not evil), provides conflict for learning
   - Character arcs span MULTIPLE STORIES (not resolved in one chapter)
   - Emotional range appropriate to age: based on the child's age
     -"Simple emotions (happy, sad, surprised), family focus" or "Deeper emotions (disappointment, pride, friendship), peer relationships" or "Complex emotions (betrayal, redemption, identity), social insight"
   - Conflicts are SOLVABLE through learning (not overwhelming trauma)

**5. COMPREHENSION & LITERACY SCAFFOLDING**
   - Story 1-3: Explicit cause-and-effect, clear plot
   - Story 4-6: Character motivation becomes complex, some inference required
   - Story 7-10: Foreshadowing, multiple plot threads, reader prediction valued
   - Each story slightly increases vocabulary diversity (not overwhelming)
   - Each world introduces new literary techniques appropriate to level

**6. STRUCTURE & CONTENT SPECIFICATIONS**
   **GlobalGoal:** A SINGULAR inspiring narrative that ties all worlds together
   - Example: "${child.name} discovers their power to change the world"
   - Example: "${child.name}'s friendship saves a magic kingdom"
   - Must be aspirational (makes child WANT to read)

   **Each World:**
   - Clear theme (matches one of ${child.name}'s favorite themes)
   - 1-3 learning focus areas (MINIMUM 1, MAXIMUM 3)
   - Rich description: age-appropriate detail without overwhelming
   - Atmosphere: Specific mood that carries across all stories in world
   - 8-10 stories progressing from simple to complex
   - Base difficulty: 1-5 range (1=easiest for world, 5=most challenging for world)

   **Each Story:**
   - 6-8 chapters (enables proper pacing, comprehension building)
   - 110-120 words per chapter (appropriate reading load per session for age)
   - From title: Immediately tells what the story is ABOUT
   - Summary: Intriguing (makes child WANT to read it)
   - Story Arc: Follows narrative structure appropriate to development stage
   - Multiple Learning Objectives integrated into plot
   - Base difficulty increases story-to-story within world

**7. PROGRESSION ARCHITECTURE**
   Reading Level Progression: As ${child.name} progresses through worlds:
   - Vocabulary complexity increases gradually
   - Sentence lengths expand without overwhelming
   - Plot complexity deepens (more subplots, more foreshadowing)
   - Character motivation becomes subtler (more inference required)
   - Thematic depth increases (multiple themes per story later)

   Skill Building Spiral:
   - Skill first taught: Explicit instruction in story
   - Skill reinforced: Practiced without explicit mention (child doesn't notice)
   - Skill mastered: Complex application in challenging context
   - Example: Comprehension → Inference → Prediction → Critical Analysis

CRITICAL REQUIREMENTS:

1. WORLD SEQUENCE (ISSUE 7 FIX):
   - Create exactly ONE world for EACH favorite theme
   - Worlds MUST be presented in strict order (not mixed)
   - Each world builds on the previous one's learning

2. STORY PROGRESSION:
   - Each world should contain 8-10 individual stories
   - Stories within a world must increase in difficulty
   - Build narrative continuity: characters and conflicts carry across stories
   - Each story teaches new skills while reinforcing previous ones

3. NARRATIVE QUALITY (For age ${child.age}):
   - Create compelling characters the child will care about
   - Establish clear conflicts and resolutions in each world
   - Include age-appropriate challenges: puzzles, riddles, moral choices
   - Match vocabulary to reading level ${child.readingLevel} (target grade ${Math.min(6, Math.ceil(child.readingLevel * 1.5))})

4. LEARNING ARCHITECTURE:
   - Map learning objectives to specific story moments
   - Use varied story arcs to maintain engagement
   - Include opportunities for different skill types to be practiced
   - Progressive difficulty ensures "just right" challenge level

5. STRUCTURE & CONSTRAINTS:
   - globalGoal: Must inspire the child and span the entire learning journey
   - Each world has a clear theme and learning focus (MAXIMUM 3 focus areas per world, MINIMUM 1)
   - Each story has 6-8 chapters of 110-120 words each
   - Base difficulty ranges 1 (easiest) to 5 (most challenging)


---

### OUTPUT FORMAT (MUST BE VALID JSON ONLY)
\`\`\`json
{
  "globalGoal": "A compelling long-term narrative goal that will motivate ${child.name} throughout their learning journey",
  "antagonist": "If there's an overarching antagonist or challenge driving the narrative, describe it here; otherwise null",
  "progressionStyle": "linear or episodic or spiral (determines how worlds connect)",
  "worlds": [
    {
      "theme": "The theme name (one of ${child.name}'s favorites)",
      "title": "Engaging world title",
      "description": "Rich world description (50-1000 chars) - vivid but age-appropriate",
      "atmosphere": "Mood/tone of this world (mysterious, adventurous, cozy, etc.)",
      "learningFocus": ["Primary learning objective 1", "Primary learning objective 2"],
      "baseDifficulty": "1 to 5 scale",
      "estimatedStoryCount": "8 to 10",
      "stories": [
        {
          "title": "Story title",
          "summary": "100-300 character summary of the story",
          "storyArc": "introduction or development or climax or resolution",
          "objectives": ["What skill/concept is taught", "What reinforces previous learning"],
          "skillsToReinforce": ["skill1", "skill2"],
          "skillsToIntroduce": ["newskill1"],
          "baseDifficulty": "1 to 5"
        }
      ]
    }
  ]
}
\`\`\`

---

### PROFESSIONAL STANDARDS & QUALITY REQUIREMENTS

**Narrative Excellence:**
✓ GlobalGoal is ASPIRATIONAL - makes ${child.name} excited to begin their reading journey
✓ Character arcs are MEANINGFUL - show growth and change across stories
✓ Conflicts are AGE-APPROPRIATE - solvable through learning, not overwhelming
✓ Worlds are COHESIVE - characters and themes weave across all stories in world
✓ Pacing is INTENTIONAL - difficulty builds smoothly, no sudden jumps

**Pedagogical Rigor:**
✓ Learning objectives are VISIBLE in story moments (not hidden or forced)
✓ Skills BUILD PROGRESSIVELY - foundation skills in early stories, complex skills later
✓ Difficulty INCREASES NATURALLY - each story slightly more complex than previous
✓ Vocabulary EXPANDS CONTEXTUALLY - new words explained through story events
✓ Story choices SUPPORT LEARNING - every plot point connects to an objective

**Structural Integrity:**
✓ Output ONLY valid JSON (no markdown, explanation, or text outside JSON)
✓ Each world contains 8-10 stories (ensures sustained engagement in theme)
✓ Each story contains 6-8 chapters (enables proper developmental scaffolding)
✓ Each chapter is 110-120 words (appropriate reading load for age)
✓ Story titles are DESCRIPTIVE (child knows what story is about from title)
✓ Summaries are INTRIGUING (make child WANT to read)

**Constraint Compliance:**
✓ learningFocus per world: MINIMUM 1, MAXIMUM 3 items (strict array size limits)
✓ objectives per story: MINIMUM 1, MAXIMUM 3 items  
✓ estimatedStoryCount per world: Between 8-10 stories
✓ baseDifficulty ranges: 1-5 scale per world, 1-5 scale per story
✓ stories array: Minimum 8, Maximum 10 items
✓ Output ONLY the JSON object. No explanation, no markdown, no extra text.`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    logger.debug("[Planning Service] LLM response received", {
      textLength: text.length,
    });

    // ISSUE 3 FIX: Robust JSON extraction and validation
    const jsonStr = extractJSON(text);
    const parsed = JSON.parse(jsonStr);

    // Validate against schema - throws if invalid
    const validatedPlan = PlanSchema.parse(parsed);

    logger.debug("[Planning Service] Plan validated successfully", {
      worldCount: validatedPlan.worlds.length,
    });

    return validatedPlan;
  } catch (error) {
    logger.error("[Planning Service] LLM call failed", {
      error: String(error),
    });
    throw new Error(
      `Failed to generate valid story plan from LLM: ${String(error)}`,
    );
  }
}

/**
 * ISSUE 2 FIX: Backend persistence (not LLM responsibility)
 * ISSUE 7 FIX: Enforces strict ordering through sequenceOrder and order fields
 * ISSUE 8 FIX: Calculates age-calibrated linguistic constraints
 * PHASE 3: Links to previous plan via planVersionChainId and previousPlanId
 */
async function persistPlan(
  childProfileId: string,
  plan: PlanOutput,
  previousPlanContext?: PlanContext,
) {
  try {
    // ISSUE 6 FIX: Calculate when to trigger plan extension
    const totalEstimatedStories = plan.worlds.reduce(
      (sum, w) => sum + w.estimatedStoryCount,
      0,
    );
    const extensionThreshold = parseInt(
      process.env.PLAN_EXTENSION_THRESHOLD || "2",
    );
    const nextExtensionPoint = totalEstimatedStories - extensionThreshold;

    // PHASE 3: Get previous plan if this is a continuation
    let previousPlanId: string | undefined;
    let planVersionChainId: string | undefined;
    let planVersion = 1;

    if (previousPlanContext) {
      previousPlanId = previousPlanContext.completedPlanId;

      // Get the previous plan to access its chain ID
      const prevPlan = await prisma.storyPlan.findUnique({
        where: { id: previousPlanContext.completedPlanId },
        select: { planVersionChainId: true, planVersion: true },
      });

      if (prevPlan) {
        // If previous plan already has a chain ID, continue with it
        // Otherwise, use the previous plan's ID as the chain root
        planVersionChainId =
          prevPlan.planVersionChainId || previousPlanContext.completedPlanId;
        planVersion = prevPlan.planVersion + 1;
      }
    }

    const storyPlan = await prisma.storyPlan.create({
      data: {
        childProfileId,
        globalGoal: plan.globalGoal,
        antagonist: plan.antagonist || "",
        progressionStyle: plan.progressionStyle,
        estimatedTotalWorlds: plan.worlds.length,
        estimatedStoriesPerWorld: Math.round(
          totalEstimatedStories / plan.worlds.length,
        ),

        // ISSUE 6 FIX: Set extension point
        nextExtensionPoint,

        // PHASE 3: Set versioning fields
        planVersionChainId,
        previousPlanId,
        planVersion,
        planStatus: "active",
        previousPlanContext: previousPlanContext
          ? JSON.stringify(previousPlanContext)
          : undefined,
        previousPlanSummary:
          previousPlanContext?.estimatedLearningGains || undefined,

        worlds: {
          create: plan.worlds.map((world, worldIndex) => ({
            order: worldIndex, // ISSUE 7: Strict world order
            theme: world.theme,
            title: world.title,
            description: world.description,
            atmosphere: world.atmosphere,
            learningFocus: world.learningFocus,
            baseDifficulty: world.baseDifficulty,
            estimatedStoryCount: world.estimatedStoryCount,

            // ISSUE 7 FIX: Create stories with strict sequencing
            stories: {
              create: world.stories.map((story, storyIndex) => ({
                sequenceOrder: storyIndex, // ISSUE 7: Strict sequence within world
                title: story.title,
                summary: story.summary,
                storyArc: story.storyArc,
                objectives: story.objectives,
                skillsToReinforce: story.skillsToReinforce,
                skillsToIntroduce: story.skillsToIntroduce,
                baseDifficulty: story.baseDifficulty,

                // ISSUE 8 FIX: Calculate age-calibrated constraints
                targetReadingGrade: calculateReadingGrade(
                  story.baseDifficulty,
                  story.objectives,
                ),
                maxSentenceLength: calculateMaxSentenceLength(
                  story.baseDifficulty,
                ),
                status: "pending", // Ready to be generated
              })),
            },
          })),
        },
      },
    });

    // PHASE 3: Record plan creation in history (with parent reference)
    await prisma.planHistory.create({
      data: {
        storyPlanId: storyPlan.id,
        event: previousPlanContext ? "regenerated" : "created",
        description: previousPlanContext
          ? `New plan generated based on learnings from plan version ${previousPlanContext.planVersion}`
          : "Initial plan generated",
        metadata: previousPlanContext
          ? {
              planVersion: storyPlan.planVersion,
              previousPlanId: storyPlan.previousPlanId,
              createdAt: storyPlan.createdAt.toISOString(),
            }
          : undefined,
      },
    });

    logger.info("[Planning Service] Plan persisted to database", {
      childProfileId,
      storyPlanId: storyPlan.id,
      worldCount: plan.worlds.length,
      nextExtensionPoint,
      planVersion: storyPlan.planVersion,
      isPlanContinuation: !!previousPlanContext,
    });

    return storyPlan;
  } catch (error) {
    logger.error("[Planning Service] Failed to persist plan", {
      error: String(error),
      childProfileId,
    });
    throw error;
  }
}

/**
 * Extract JSON from LLM response (may include explanatory text)
 */
function extractJSON(text: string): string {
  // Try to find JSON object in response
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(
      "No JSON object found in LLM response. Response: " +
        text.substring(0, 200),
    );
  }
  return match[0];
}

/**
 * PHASE 3: Build learning history section for plan continuation
 * Extracts previous learning context and informs next plan generation
 *
 * @param context - PlanContext from completed plan
 * @returns Markdown section to inject into LLM prompt
 */
function buildLearningHistorySection(context: PlanContext): string {
  return `---

### LEARNING HISTORY & PROGRESSION
**THIS IS PLAN VERSION ${context.planVersion + 1} - BUILDING ON PREVIOUS LEARNING**

${context.childName ? `${context.childName} has just completed their previous learning journey! This new plan builds on that foundation.` : "This child is ready for their next learning journey!"}

**WHAT WAS LEARNED IN PREVIOUS PLAN (Version ${context.planVersion}):**

**Worlds Already Explored:**
${context.taughtThemes.map((theme, i) => `  ${i + 1}. ${theme}`).join("\n")}

**Objectives Already Mastered:**
${context.taughtObjectives.map((obj, i) => `  ${i + 1}. ${obj}`).join("\n")}

**Skills Demonstrated Mastery In:**
${context.masteredSkills.length > 0 ? context.masteredSkills.map((skill, i) => `  ${i + 1}. ${skill} (strong comprehension and application)`).join("\n") : "  (Wait for skill assessment)"}

**Skills That Need Further Development:**
${context.needsDevelopmentSkills.length > 0 ? context.needsDevelopmentSkills.map((skill, i) => `  ${i + 1}. ${skill} (include in new plan for reinforcement)`).join("\n") : "  (Child is progressing well across all areas)"}

**Reading Progress:**
- Started at Reading Level: ${context.startingReadingLevel}/5
- Progressed to Reading Level: ${context.endingReadingLevel}/5
- Difficulty Path: ${context.startingDifficulty.toFixed(1)} → ${context.endingDifficulty.toFixed(1)} (average: ${context.averageDifficulty.toFixed(1)})

**Memorable Characters from Previous Journey:**
${context.frequentCharacters.length > 0 ? context.frequentCharacters.map((char, i) => `  ${i + 1}. ${char}`).join("\n") : "  (Fresh characters in new worlds)"}

**Achievements:**
${context.achievements.map((achievement, i) => `  ✓ ${achievement}`).join("\n")}

**Total Stories Completed:** ${context.totalStoriesCompleted} stories

---

### CRITICAL DIRECTIVES FOR NEW PLAN (Version ${context.planVersion + 1}):

**1. AVOID REPETITION - PROGRESS NOT REPETITION**
   - DO NOT use these themes (they're in the "been there, done that" category):
     ${context.avoid.themes.map((theme, i) => `${i + 1}. ${theme}`).join(", ")}
   - Instead, choose NEW favorite themes that weren't explored yet, OR combine them in novel ways
   - DO NOT repeat ${Math.ceil(context.taughtObjectives.length * 0.3)} of the learning objectives from last time

**2. BUILD ON MASTERY - DEEPEN NOT RESTART**
   - The child HAS MASTERED: ${context.masteredSkills.join(", ") || "multiple reading skills"}
   - Build on this mastery with HIGHER-ORDER applications in new stories
   - Use complex inference, prediction, and critical thinking with these formerly-taught skills
   - Example: If they mastered "character motivation", now they should analyze CONFLICTING motivations

**3. SCAFFOLD DEVELOPMENT AREAS**
   - Child is still developing: ${context.needsDevelopmentSkills.join(", ") || "various skills"}
   - Include INTENTIONAL reinforcement of these in new worlds
   - Pair with mastered skills so they build confidence while learning
   - Create opportunities for these skills WITHOUT explicit teaching (implicit mastery building)

**4. PROGRESSIVE DIFFICULTY - UP THE CHALLENGE**
   - Previous plan difficulty range: ${context.startingDifficulty.toFixed(1)} → ${context.endingDifficulty.toFixed(1)}
   - NEW PLAN DIFFICULTY: Start at ${context.endingDifficulty.toFixed(1)} and progress to ${Math.min(5, context.endingDifficulty + 1)}
   - Reading level was: ${context.startingReadingLevel} → ${context.endingReadingLevel}
   - NEW READING LEVEL: Target ${Math.min(5, context.endingReadingLevel + 1)} (increase vocabulary, sentence complexity, plot depth)

**5. NARRATIVE CONTINUITY (If desired)**
   - Some of these characters COULD return: ${context.frequentCharacters.slice(0, 2).join(", ") || "original characters"}
   - But primary focus should be NEW characters and NEW worlds
   - Allow child to grow beyond previous relationships
   - Can reference previous adventures as backstory/context

**6. LEARNING SUMMARY FROM PREVIOUS PLAN**
\`\`\`
${context.estimatedLearningGains}
\`\`\`

`;
}

/**
 * Calculate reading grade level based on story difficulty
 * ISSUE 8 FIX: Age-calibrated linguistic constraints
 *
 * Maps difficulty 1-5 to Flesch-Kincaid grade levels
 * Difficulty 1 → Grade 1-2 (simple words, short sentences)
 * Difficulty 5 → Grade 5-6 (complex concepts, varied sentences)
 */
function calculateReadingGrade(
  difficulty: number,
  objectives: string[],
): number {
  // Base calculation: difficulty 1 → grade 1, difficulty 5 → grade 5
  const baseGrade = Math.ceil(difficulty * 1.2);

  // Adjust based on learning objectives complexity
  const complexObjectives = objectives.filter(
    (o) =>
      o.toLowerCase().includes("abstract") ||
      o.toLowerCase().includes("analyze") ||
      o.toLowerCase().includes("infer"),
  ).length;

  const adjustedGrade = baseGrade + complexObjectives * 0.5;

  // Cap at grade 6 for young readers (typically 11-12 years old)
  return Math.min(6, Math.max(1, Math.round(adjustedGrade)));
}

/**
 * Calculate maximum sentence length constraint
 * ISSUE 8 FIX: Linguistic constraints based on difficulty
 *
 * Difficulty 1 → max 12 words/sentence (short, simple)
 * Difficulty 5 → max 20 words/sentence (longer, more complex)
 */
function calculateMaxSentenceLength(difficulty: number): number {
  // Linear interpolation: min 12 words, max 20 words
  return Math.round(12 + (difficulty - 1) * 2);
}

/**
 * ISSUE 9 FIX: Robust retry with exponential backoff
 * Retries with increasing delays: 2s, 4s, 8s, 16s, etc.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; delayMs: number },
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on the last attempt
      if (attempt < options.maxRetries - 1) {
        const delay = options.delayMs * Math.pow(2, attempt);
        logger.warn("[Planning Service] Retry attempt", {
          attempt: attempt + 1,
          maxRetries: options.maxRetries,
          delayMs: delay,
          error: lastError.message,
        });
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error("Plan generation failed after all retries");
}
