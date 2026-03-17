import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { forwardToContentService } from "../helpers/content.helpers";
import { API_BASE_URL_V1, ApiResponse, TTSAudio } from "@shared/src/types";

const router = Router();

// AI service base URL (AI microservice)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

// POST /api/v1/validate-answer - Forward validation request to AI service
router.use(`/validate-answer`, async (req: Request, res: Response) => {
	try {
		if (!AI_SERVICE_URL) {
			logger.error("AI_SERVICE_URL not configured");
			return res.status(500).json({ success: false, error: "AI service not configured" });
		}

		const url = `${AI_SERVICE_URL}${API_BASE_URL_V1}/validate-answer`;
		const response = await axios.post(url, req.body, { timeout: 60000 });

		return res.status(response.status).json(response.data);
	} catch (error) {
		logger.error("Error forwarding validate-answer", { error: error instanceof Error ? error.message : String(error) });

		if (axios.isAxiosError(error) && error.response) {
			return res.status(error.response.status).json(error.response.data);
		}

		return res.status(500).json({ success: false, error: "Failed to contact AI service" });
	}
});

export default router;
