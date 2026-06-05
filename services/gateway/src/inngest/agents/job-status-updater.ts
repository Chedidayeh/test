import axios from "axios";
import { logger } from "../../utils/logger";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const API_BASE_URL_V1 = "/api/v1";

interface UpdateJobStatusParams {
  eventId: string | undefined;
  status: "running" | "completed" | "failed";
  runId?: string;
  startedAt?: Date;
  completedAt?: Date;
  output?: any;
  error?: any;
}

/**
 * Update job status in AI service database
 * Called from within Inngest functions to track job lifecycle
 */
export async function updateJobStatus(
  params: UpdateJobStatusParams,
): Promise<void> {
  try {
    if (!AI_SERVICE_URL) {
      logger.warn("[Job Status Updater] AI_SERVICE_URL not configured");
      return;
    }

    if (!params.eventId) {
      logger.warn("[Job Status Updater] No eventId provided, skipping status update");
      return;
    }

    const updateData: any = {
      status: params.status,
    };

    if (params.runId) updateData.runId = params.runId;
    if (params.startedAt) updateData.startedAt = params.startedAt;
    if (params.completedAt) updateData.completedAt = params.completedAt;
    if (params.output) updateData.output = params.output;
    if (params.error) updateData.error = params.error;

    await axios.patch(
      `${AI_SERVICE_URL}${API_BASE_URL_V1}/jobs/${params.eventId}`,
      updateData,
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      },
    );

    logger.debug("[Job Status Updater] Job status updated", {
      eventId: params.eventId,
      status: params.status,
    });
  } catch (error) {
    // Non-fatal: status update failure shouldn't break job execution
    logger.error("[Job Status Updater] Failed to update job status", {
      eventId: params.eventId,
      status: params.status,
      error: String(error),
    });
  }
}
