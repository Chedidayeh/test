import axios from "axios";
import { logger } from "../utils/logger";

const INNGEST_API_URL = process.env.INNGEST_API_URL || "https://api.inngest.com";
const INNGEST_SIGNING_KEY = process.env.INNGEST_SIGNING_KEY;

export interface InngestRunStatus {
  id: string;
  status: "Queued" | "Running" | "Completed" | "Failed" | "Cancelled";
  event_id: string;
  function_id: string;
  started_at: string | null;
  ended_at: string | null;
  output: any;
  error: {
    message: string;
    name: string;
    stack?: string;
  } | null;
}

export interface InngestRunsResponse {
  data: InngestRunStatus[];
}

/**
 * Inngest REST API Client
 * Provides methods to interact with Inngest's API for monitoring job runs
 */
export class InngestApiService {
  /**
   * Fetch all runs triggered by a specific event ID
   * @param eventId - The Inngest event ID
   * @returns Array of run statuses
   */
  static async getRunsForEvent(
    eventId: string,
  ): Promise<InngestRunStatus[]> {
    if (!INNGEST_SIGNING_KEY) {
      logger.warn(
        "[Inngest API] INNGEST_SIGNING_KEY not configured, cannot fetch run status",
      );
      return [];
    }

    try {
      logger.debug("[Inngest API] Fetching runs for event", { eventId });

      const response = await axios.get<InngestRunsResponse>(
        `${INNGEST_API_URL}/v1/events/${eventId}/runs`,
        {
          headers: {
            Authorization: `Bearer ${INNGEST_SIGNING_KEY}`,
          },
          validateStatus: () => true,
        },
      );

      if (response.status !== 200) {
        logger.error("[Inngest API] Failed to fetch runs", {
          eventId,
          status: response.status,
          data: response.data,
        });
        return [];
      }

      logger.debug("[Inngest API] Successfully fetched runs", {
        eventId,
        runCount: response.data.data?.length || 0,
      });

      return response.data.data || [];
    } catch (error) {
      logger.error("[Inngest API] Error fetching runs for event", {
        eventId,
        error: String(error),
      });
      return [];
    }
  }

  /**
   * Get the latest run status for an event
   * Useful when you expect only one run per event
   * @param eventId - The Inngest event ID
   * @returns Latest run status or null
   */
  static async getLatestRunForEvent(
    eventId: string,
  ): Promise<InngestRunStatus | null> {
    const runs = await this.getRunsForEvent(eventId);

    if (runs.length === 0) {
      return null;
    }

    // Return the most recent run (first in the array)
    return runs[0];
  }

  /**
   * Poll for run completion with timeout
   * Useful for waiting on job completion
   * @param eventId - The Inngest event ID
   * @param timeoutMs - Maximum time to wait in milliseconds
   * @param intervalMs - Polling interval in milliseconds
   * @returns Final run status or null if timeout
   */
  static async pollUntilComplete(
    eventId: string,
    timeoutMs: number = 30000,
    intervalMs: number = 1000,
  ): Promise<InngestRunStatus | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const run = await this.getLatestRunForEvent(eventId);

      if (!run) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }

      if (
        run.status === "Completed" ||
        run.status === "Failed" ||
        run.status === "Cancelled"
      ) {
        return run;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    logger.warn("[Inngest API] Polling timed out", { eventId, timeoutMs });
    return null;
  }

  /**
   * Map Inngest status to simplified status
   * @param inngestStatus - Inngest run status
   * @returns Simplified status string
   */
  static mapStatus(
    inngestStatus: InngestRunStatus["status"],
  ): "queued" | "running" | "completed" | "failed" | "cancelled" {
    const statusMap: Record<
      InngestRunStatus["status"],
      "queued" | "running" | "completed" | "failed" | "cancelled"
    > = {
      Queued: "queued",
      Running: "running",
      Completed: "completed",
      Failed: "failed",
      Cancelled: "cancelled",
    };

    return statusMap[inngestStatus];
  }
}
