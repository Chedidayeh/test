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
  storyContent: string,
  question: string,
  correctAnswers: string[],
  childAnswer: string,
  challengeType: string,
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
STORY CONTEXT
--------------------------------------------------

${storyContent}

--------------------------------------------------
QUESTION
--------------------------------------------------

${question}

--------------------------------------------------
CORRECT ANSWERS
--------------------------------------------------

${correctAnswers.join(", ")}

--------------------------------------------------
CHILD ANSWER
--------------------------------------------------

${childAnswer}

${
  previousAttempts.length > 0
    ? `
--------------------------------------------------
PREVIOUS ATTEMPTS
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

MULTIPLE_CHOICE
- The answer must match one of the correct answers.
- Allow minor spelling differences.

TRUE_FALSE
- Accept "true", "false", "yes", "no".
- Map synonyms to true/false.

RIDDLE
- Open-ended answer.
- Validate using meaning comparison.
- Accept synonyms or paraphrases.

CHOOSE_ENDING
- ALL answers are correct.
- Evaluate whether the answer logically relates to the story ending.

MORAL_DECISION
- ALL answers are acceptable.
- Validate if the child demonstrates understanding of the moral.

--------------------------------------------------
EVALUATION RULES
--------------------------------------------------

1. Use STORY CONTEXT to understand the answer.
2. Accept answers with the SAME MEANING.
3. Accept synonyms and paraphrasing.
4. Accept minor spelling mistakes.
5. Reject answers referring to different characters or events.

--------------------------------------------------
CONFIDENCE SCALE
--------------------------------------------------

1.00 → exact correct answer  
0.90 → strong semantic match  
0.75 → mostly correct idea  
0.50 → uncertain  
0.25 → likely incorrect  
0.00 → completely incorrect  

--------------------------------------------------
CHILD MESSAGE RULES
--------------------------------------------------

If correct:
- congratulate the child
- be positive
- encourage reading

If incorrect:
- encourage trying again
- do NOT reveal the answer
- hint gently



--------------------------------------------------
OUTPUT FORMAT (STRICT)
--------------------------------------------------

Return ONLY valid JSON.

{
  "correct": boolean,
  "confidence": number,
  "reason": string,
  "message": string
}

Rules:
- reason: max 15 words
- message: max 20 words
- no extra text
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
