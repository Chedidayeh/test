import { Request, Response } from "express";
import {
  generateHintsAndSave,
  GenerateHintsRequest,
} from "../services/hint.service";

export async function generateHints(req: Request, res: Response) {
  try {
    const {
      storyContent,
      question,
      answers,
      challengeType,
      difficultyLevel,
      ageGroup,
    } = req.body;

    // Validate required fields
    if (
      !storyContent ||
      !question ||
      !answers ||
      !challengeType
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        code: "INVALID_REQUEST",
        details: {
          required: [
            "storyContent",
            "question",
            "answers",
            "challengeType",
          ],
        },
      });
    }

    // Validate answers is an array
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "answers must be a non-empty array",
        code: "INVALID_REQUEST",
      });
    }

    const generateHintsRequest: GenerateHintsRequest = {
      storyContent,
      question,
      answers,
      challengeType,
      difficultyLevel: difficultyLevel || 1.0,
      ageGroup: ageGroup || "6-8",
    };

    const result = await generateHintsAndSave(generateHintsRequest);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        service: "ai-service",
        agent: "hint-generator",
        message: "Hint generation failed",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    );

    res.status(500).json({
      success: false,
      error: "Failed to generate hints",
      code: "HINT_GENERATION_ERROR",
    });
  }
}

export const hintGeneratorController = {
  generateHints,
};
