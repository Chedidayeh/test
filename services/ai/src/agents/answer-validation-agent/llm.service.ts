import { logger } from "../../lib/logger";
import model from "../../lib/model";

export type LLMValidationResult = {
  correct: boolean;
  confidence: number;
  reason: string;
  message: string;
};

export type PreviousAttempt = {
  answer: string;
  message: string;
};

export async function llmValidateAnswer(
  question: string,
  correctAnswer: string,
  childAnswer: string,
  challengeType: string,
  baseLocale: string,
  attemptNumber: number,
  previousAttempts: PreviousAttempt[] = [],
): Promise<LLMValidationResult> {
  const prompt = `
You are an AI assistant validating answers from children using a story-reading educational app.

Your job is to evaluate if the child understood the story correctly.

Your tone must always be:
- kind
- encouraging
- child-friendly

Never shame the child.

--------------------------------------------------
LANGUAGE CONTEXT
--------------------------------------------------

Base Language: ${baseLocale}
Respond in the same language as the question and challenge content.
Adapt cultural references and examples to be appropriate for the ${baseLocale} language context.

--------------------------------------------------
ATTEMPT CONTEXT
--------------------------------------------------

Current Attempt: ${attemptNumber}
Total Previous Attempts: ${previousAttempts.length}

${
  attemptNumber === 1
    ? "This is the FIRST attempt. Be encouraging and supportive."
    : attemptNumber <= 2
      ? "This is attempt " +
        attemptNumber +
        ". The child is trying again - be patient and gently guide them."
      : "This is attempt " +
        attemptNumber +
        ". The child has tried multiple times. Be extra encouraging and provide gentle hints about what to consider."
}

--------------------------------------------------
QUESTION
--------------------------------------------------

${question}

--------------------------------------------------
CORRECT ANSWER
--------------------------------------------------

${correctAnswer}

--------------------------------------------------
CHILD ANSWER
--------------------------------------------------

${childAnswer}

${
  previousAttempts.length > 0
    ? `
--------------------------------------------------
PREVIOUS ATTEMPTS (if any)
--------------------------------------------------

${previousAttempts.length > 0 ? previousAttempts.map((attempt, i) => `Attempt ${i + 1}:\n  Answer: ${attempt.answer}\n  Your Feedback Message: ${attempt.message}`).join("\n\n") : "None"}

`
    : ""
}
--------------------------------------------------
CHALLENGE TYPE
--------------------------------------------------

${challengeType}

--------------------------------------------------
CHALLENGE TYPE BEHAVIOR
--------------------------------------------------

RIDDLE
- Open-ended answer.
- Validate using meaning comparison.
- Accept synonyms or paraphrases.

--------------------------------------------------
EVALUATION RULES
--------------------------------------------------

1. Use STORY QUESTION to understand the answer.
2. Accept answers with the SAME MEANING.
3. Accept synonyms and paraphrasing.
4. Accept minor spelling mistakes.
5. SPELL-CHECK: If child's answer has spelling errors but is semantically correct:
   - Accept the answer as correct
   - Identify and correct the spelling errors
   - Include the corrected spelling in your message as a gentle learning opportunity
   - Example: If child writes "caracterr" for "character", respond with the corrected word in your message

--------------------------------------------------
CONFIDENCE SCALE
--------------------------------------------------

1.00 → exact correct answer  (consider correct)
0.90 → strong semantic match  (consider correct)
0.75 → mostly correct idea  (consider correct but not perfect)
0.50 → uncertain (close but not quite, consider not correct)
0.25 → likely incorrect  (consider incorrect)
0.00 → completely incorrect  (consider incorrect)

--------------------------------------------------
CHILD MESSAGE RULES
--------------------------------------------------

If correct:
- congratulate the child
- be positive
- encourage reading
- If you corrected spelling errors, include the corrected version naturally in your message
  Example: "Exactly! The character was very brave!"
- Acknowledge effort if this is not the first attempt
  Attempt 1: "Perfect on your first try!"
  Attempt 2+: "Great job! You got it after trying again - that shows persistence!"

If incorrect:
- encourage trying again
- do NOT reveal the answer
- maintain that he can use hints (hints are available in the app)
- Adjust tone based on attempt number:
  Attempt 1: Be supportive and encouraging to try again
  Attempt 2: Gently remind them to think about specific story details
  Attempt 3+: Provide a gentle nudge toward the right direction (without spoiling the answer)
- Reference previous attempts if patterns emerge (e.g., "You're getting closer!" if answer is improving)



--------------------------------------------------
OUTPUT FORMAT (STRICT)
--------------------------------------------------

Return ONLY valid JSON.

{
  "correct": boolean,
  "confidence": number,
  "reason": string,
  "message": string,
}

Rules:
- reason: max 15 words
- message: max 20 words, should be adjusted based on attemptNumber (see CHILD MESSAGE RULES)
- correctedAnswer: only include if child's answer had spelling/grammar errors that you corrected
- no extra text
- respond in the language specified in LANGUAGE CONTEXT (${baseLocale})
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Extract JSON from markdown code blocks if present
    // LLM might return ```json { ... } ```
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      text = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(text);

    return {
      correct: Boolean(parsed.correct),
      confidence: Number(parsed.confidence),
      reason: parsed.reason ?? "",
      message: parsed.message ?? "",
    };
  } catch (error) {
    logger.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        service: "ai-service",
        message: "LLM validation error",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
    );

    return {
      correct: false,
      confidence: 0.2,
      reason: "AI validation failed",
      message: "Nice try! Think again about the story.",
    };
  }
}
