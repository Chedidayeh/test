
"use server";

/**
 * Server Actions for AI Service
 *
 * Wraps `ai-service` server-api calls for use in Server Components / Actions
 */

import { ServiceResponse, TTSAudio } from "@readdly/shared-types";
import { getTTSByChapterId } from "./server-api";

export async function fetchTTSByChapterAction(
	chapterId: string,
): Promise<ServiceResponse<TTSAudio | TTSAudio[] | null>> {
	try {
		console.log("[AI Service Action] Fetching TTS by chapterId:", chapterId);

		const result = await getTTSByChapterId(chapterId);

		return {
			success: true,
			data: result ,
		};
	} catch (error) {
		console.error("Server action error fetching TTS by chapterId:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to fetch TTS",
		};
	}
}


