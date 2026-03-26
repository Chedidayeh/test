/**
 * Progress Analytics Services
 *
 * Exports:
 * - analyticsDataAggregator: Transforms raw child progress data into structured metrics
 * - analyticsValidationService: Validates input data before processing
 * - generateProgressReport: LLM service that generates parent-friendly weekly reports with optional enriched context
 * - Enriched context types: For building story/chapter/challenge details
 */

export { AnalyticsDataAggregator, analyticsDataAggregator } from "./analytics-data-aggregator";
export { AnalyticsValidationService, analyticsValidationService } from "./analytics-validation.service";
export { generateProgressReport, type LLMAnalyticsResponse } from "./analytics-llm.service";
export type {
  EnrichedReadingContext,
  EnrichedStory,
  EnrichedChapter,
  EnrichedChallenge,
} from "../types/enriched-context.types";
