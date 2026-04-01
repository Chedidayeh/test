import prisma from "../../../lib/prisma";
import model from "../../../lib/model";

export interface GenerateHintsRequest {
  storyContent: string;
  question: string;
  answers: string[];
  challengeType: string;
  difficultyLevel?: number;
  ageGroup?: string;
}

export interface HintResponse {
  hints: string[];
  hintGenerationLogId: string;
}

/**
 * Generates hints for a challenge based on story content and challenge data
 * Saves generation attempt to the database for auditing and analytics
 */
export async function generateHintsAndSave(
  request: GenerateHintsRequest,
): Promise<HintResponse> {
  const {
    storyContent,
    question,
    answers,
    challengeType,
    difficultyLevel = 1.0,
    ageGroup = "6-8",
  } = request;

  try {
    // Generate 3 progressive hints using Gemini LLM
    // The LLM integration:
    // 1. Calls Google Generative AI (Gemini 2.5 Flash model)
    // 2. Passes complete context: story content, challenge question, correct answers
    // 3. Adapts hints based on: child's age group, difficulty level, challenge type
    // 4. Enforces child-friendly vocabulary and progressive difficulty
    // 5. Returns hints as JSON array to ensure consistent parsing

    const hints = await generateHintsFromLLM({
      storyContent,
      question,
      answers,
      challengeType,
      ageGroup,
      difficultyLevel,
    });

    // Log the generation attempt
    const hintGenerationLog = await prisma.hintGenerationLog.create({
      data: {
        question,
        answers,
        challengeType,
        hints: hints,
        hintCount: hints.length,
        ageGroup,
      },
    });

    return {
      hints,
      hintGenerationLogId: hintGenerationLog.id,
    };
  } catch (error) {
    // Log failed generation attempt
    await prisma.hintGenerationLog.create({
      data: {
        question,
        ageGroup,
        answers,
        challengeType,
        hints: [],
        hintCount: 0,
        failed: true,
        failureReason: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

/**
 * Generate hints using Gemini LLM
 * Calls Google's Generative AI to create progressive, child-friendly hints
 * Handles challenge type-specific prompting and age-appropriate language
 */
async function generateHintsFromLLM({
  storyContent,
  question,
  answers,
  challengeType,
  ageGroup,
  difficultyLevel,
}: {
  storyContent: string;
  question: string;
  answers: string[];
  challengeType: string;
  ageGroup: string;
  difficultyLevel: number;
}): Promise<string[]> {
  try {
    // Build challenge type context for better prompting
    const challengeTypeContext = getChallengTypeContext(challengeType);

    // Build age-appropriate instructions
    const ageMinimum = getAgeMinimum(ageGroup);
    const vocabularyLevel = getVocabularyLevel(ageGroup);

    const systemPrompt = `You are an expert educational assistant creating DESCRIPTIVE CLUES for children solving reading comprehension challenges in an interactive story game.

Your hints are PROGRESSIVE CLUES that guide children by revealing key details about:
1. WHAT something IS (its physical form, material, or nature)
2. WHAT it DOES or its PURPOSE/FUNCTION (how it works, what it's used for)
3. WHAT it LEADS TO or its OUTCOME (where it goes, what it reveals, what happens because of it)


GUIDELINES FOR ALL HINTS:
- Write as STATEMENTS/FACTS, NOT questions
- Be SPECIFIC and CONCRETE (not vague like "think about...")
- Make each hint slightly MORE SPECIFIC than the last (progressive revelation)
- Never state the answer directly, but make the pattern clear
- Use vocabulary appropriate for age ${ageMinimum}+ years (${vocabularyLevel} level)
- Keep sentences short and clear (max 12 words per hint)
- For ${challengeTypeContext}, follow this structure

CONTEXT: This is part of "${challengeType}" challenges in an interactive reading game where children identify story elements.
The answer students pick should logically match the progression of your hints.

CRITICAL: Respond ONLY with a valid JSON array: ["hint1", "hint2", "hint3"]
No markdown, no code blocks, no extra text - just the JSON array.`;

    const userPrompt = `STORY CONTEXT:
"${storyContent.substring(0, 1000)}${storyContent.length > 1000 ? "..." : ""}"

CHALLENGE TASK:
Question: ${question}
Multiple choice answers: ${answers.join(" | ")}
Challenge Type: ${challengeType}
Difficulty: ${difficultyLevel}/5
Child's Age: ${ageGroup}

CREATE three progressive clues following the WHAT IS → WHAT IT DOES → WHERE IT LEADS pattern.
Each clue should be a direct statement, not a question.
Make the clues specific enough that children can identify the correct answer from the story context.

Return as JSON array: ["hint1", "hint2", "hint3"]`;

    console.log(
      `[Hint Generator] Generating hints for: "${question.substring(0, 50)}..."`,
    );
    console.log(
      `[Hint Generator] Age Group: ${ageGroup}, Difficulty: ${difficultyLevel}, Type: ${challengeType}`,
    );
    console.log(
      `[Hint Generator] Answers: ${answers.join(" | ")}`,
    );

    // Call Gemini API
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: systemPrompt,
    });

    // Extract and parse response
    const responseText = response.response.text();
    console.log(`[Hint Generator] LLM Response: ${responseText}`);

    // Parse JSON array from response
    const hints = parseHintsFromLLMResponse(responseText);

    // Validate hints
    if (
      !Array.isArray(hints) ||
      hints.length === 0 ||
      hints.some((h) => typeof h !== "string")
    ) {
      throw new Error(
        `Invalid hints format. Expected array of strings, got: ${JSON.stringify(hints)}`,
      );
    }

    // Ensure exactly 3 hints, pad if necessary
    const normalizedHints = hints.slice(0, 3);
    while (normalizedHints.length < 3) {
      normalizedHints.push(`Try thinking about the answer step by step.`);
    }

    console.log(
      `[Hint Generator] Generated ${normalizedHints.length} hints:`,
    );
    normalizedHints.forEach((hint, idx) => {
      console.log(`  Hint ${idx + 1}: ${hint}`);
    });
    return normalizedHints;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Hint Generator] Error generating hints: ${errorMessage}`);
    throw new Error(`Hint generation failed: ${errorMessage}`);
  }
}

/**
 * Parse hints from LLM response, handling various JSON formats
 */
function parseHintsFromLLMResponse(responseText: string): string[] {
  // Try to extract JSON array from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON array found in LLM response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      throw new Error("Parsed content is not an array");
    }
    return parsed;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "JSON parse error";
    throw new Error(
      `Failed to parse hints JSON: ${errorMessage}. Raw: ${responseText}`,
    );
  }
}

/**
 * Get age minimum from age group string (e.g., "6-8" -> 6)
 */
function getAgeMinimum(ageGroup: string): number {
  const match = ageGroup.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 6;
}

/**
 * Determine vocabulary level based on age group
 */
function getVocabularyLevel(ageGroup: string): string {
  const age = getAgeMinimum(ageGroup);
  if (age < 7) return "beginner (simple words, short sentences)";
  if (age < 10) return "intermediate (common vocabulary, varied sentences)";
  if (age < 13) return "advanced (grade-level vocabulary, complex ideas)";
  return "mature (sophisticated vocabulary, abstract concepts)";
}

/**
 * Get challenge type specific context for better prompting
 * Maps to ChallengeType enum from shared types
 */
function getChallengTypeContext(challengeType: string): string {
  const typeMap: Record<string, string> = {
    MULTIPLE_CHOICE:
      "Multiple choice - help identify the correct answer among several options",
    TRUE_FALSE:
      "True/False - guide reasoning about why a statement is true or false",
    RIDDLE:
      "Riddle - hint should guide reasoning from story clues without direct answers",
    CHOOSE_ENDING:
      "Choose ending - hint about narrative outcomes and story direction",
    MORAL_DECISION:
      "Moral decision - guide reflection on story themes and character choices",
  };
  return typeMap[challengeType] || `${challengeType} type challenge`;
}
