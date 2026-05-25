import React from 'react';
import { Metadata } from 'next';
import { 
  getEngagementMetrics, 
  getReadingTimeAnalytics, 
  getPeakUsageHours,
  getLearningCompletionMetrics,
  getChallengeSuccessMetrics,
  getHintUsageMetrics,
  getReadingSpeedTrends,
  getMostFailedChallenges,
  getContentPerformanceMetrics,
} from '@/src/lib/progress-service/server-api';
import StatsPageClient from './_components/StatsPageClient';

export const metadata: Metadata = {
  title: 'Global Statistics | Admin Dashboard',
  description: 'Comprehensive analytics and statistics for the Readdly platform',
};

export default async function StatsPage() {
  // Fetch all engagement and learning metrics data sources in parallel
  const [
    engagementMetrics,
    readingTimeAnalytics,
    peakUsageHours,
    learningCompletionMetrics,
    challengeSuccessMetrics,
    hintUsageMetrics,
    readingSpeedTrends,
    mostFailedChallenges,
    contentPerformanceMetrics,
  ] = await Promise.all([
    getEngagementMetrics().catch(() => null),
    getReadingTimeAnalytics().catch(() => null),
    getPeakUsageHours().catch(() => null),
    getLearningCompletionMetrics().catch(() => null),
    getChallengeSuccessMetrics().catch(() => null),
    getHintUsageMetrics().catch(() => null),
    getReadingSpeedTrends().catch(() => null),
    getMostFailedChallenges().catch(() => null),
    getContentPerformanceMetrics().catch(() => null),
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Global Statistics</h1>
        <p className="text-slate-600">
          Comprehensive analytics and insights about platform usage and engagement
        </p>
      </div>

      {/* Tabs and Content */}
      <StatsPageClient
        engagementMetrics={engagementMetrics}
        readingTimeAnalytics={readingTimeAnalytics}
        peakUsageHours={peakUsageHours}
        learningCompletionMetrics={learningCompletionMetrics}
        challengeSuccessMetrics={challengeSuccessMetrics}
        hintUsageMetrics={hintUsageMetrics}
        readingSpeedTrends={readingSpeedTrends}
        mostFailedChallenges={mostFailedChallenges}
        contentPerformanceMetrics={contentPerformanceMetrics}
      />
    </div>
  );
}
