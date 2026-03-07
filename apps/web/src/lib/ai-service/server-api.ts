/**
 * Auth Service Server API
 *
 * RSC (React Server Component) layer for frontend to communicate with Auth Service
 * through the Gateway. All requests are authenticated via JWT from NextAuth session.
 *
 * Pattern follows content-service/server-api.ts for consistency.
 */

import type { ApiResponse, Child, TTSAudio } from "@shared/types";
import { apiRequest, isApiError } from "../helpers";



export async function getTTSByChapterId(
	chapterId: string,
) {
	console.log("[AI Service API] Fetching TTS by chapterId:", chapterId);

	const response = await apiRequest<ApiResponse<TTSAudio | TTSAudio[]>>(
		`/tts/chapterId/${chapterId}`,
	);

	if (isApiError(response)) {
		console.warn(
			"[AI Service API] Failed to fetch TTS by chapterId:",
			response.error.message,
		);
		return null;
	}

	if (!response.success) {
		console.warn(
			"[AI Service API] Failed to fetch TTS by chapterId: API returned success=false",
		);
		return null;
	}

	return response.data || null;
}



