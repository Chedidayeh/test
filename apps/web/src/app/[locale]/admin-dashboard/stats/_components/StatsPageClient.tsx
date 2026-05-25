/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import EngagementMetricsCard from './EngagementMetricsCard';
import ReadingTimeAnalyticsCard from './ReadingTimeAnalyticsCard';
import PeakUsageHoursCard from './PeakUsageHoursCard';
import LearningCompletionCard from './LearningCompletionCard';
import ChallengeSuccessCard from './ChallengeSuccessCard';
import HintUsageCard from './HintUsageCard';
import ReadingSpeedTrendsCard from './ReadingSpeedTrendsCard';
import MostFailedChallengesCard from './MostFailedChallengesCard';
import { ContentPerformanceCard } from './ContentPerformanceCard';
import { AlertCircle } from 'lucide-react';

interface StatsPageClientProps {
  engagementMetrics: any;
  readingTimeAnalytics: any;
  peakUsageHours: any;
  learningCompletionMetrics: any;
  challengeSuccessMetrics: any;
  hintUsageMetrics: any;
  readingSpeedTrends: any;
  mostFailedChallenges: any;
  contentPerformanceMetrics: any;
}

export default function StatsPageClient({
  engagementMetrics,
  readingTimeAnalytics,
  peakUsageHours,
  learningCompletionMetrics,
  challengeSuccessMetrics,
  hintUsageMetrics,
  readingSpeedTrends,
  mostFailedChallenges,
  contentPerformanceMetrics,
}: StatsPageClientProps) {
  const [activeTab, setActiveTab] = useState('engagement');

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 mb-4">
          <TabsTrigger value="engagement" className="data-[state=active]:bg-white">
            Engagement Metrics
          </TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-white">
            Learning & Educational
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-white">
            Content Performance
          </TabsTrigger>
        </TabsList>

        {/* Engagement Metrics Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <section>
            {engagementMetrics ? (
              <EngagementMetricsCard data={engagementMetrics} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load engagement metrics. Please try again later.
                </p>
              </div>
            )}
          </section>

          <section>
            {readingTimeAnalytics ? (
              <ReadingTimeAnalyticsCard data={readingTimeAnalytics} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load reading time analytics. Please try again later.
                </p>
              </div>
            )}
          </section>

          <section>
            {peakUsageHours && peakUsageHours.length > 0 ? (
              <PeakUsageHoursCard data={peakUsageHours} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load peak usage hours. Please try again later.
                </p>
              </div>
            )}
          </section>
        </TabsContent>

        {/* Learning & Educational Metrics Tab */}
        <TabsContent value="learning" className="space-y-6">
          <section>
            {learningCompletionMetrics ? (
              <LearningCompletionCard data={learningCompletionMetrics} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load learning completion metrics. Please try again later.
                </p>
              </div>
            )}
          </section>

          <section>
            {challengeSuccessMetrics ? (
              <ChallengeSuccessCard data={challengeSuccessMetrics} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load challenge success metrics. Please try again later.
                </p>
              </div>
            )}
          </section>

          <section>
            {hintUsageMetrics ? (
              <HintUsageCard data={hintUsageMetrics} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load hint usage metrics. Please try again later.
                </p>
              </div>
            )}
          </section>

          <section>
            {readingSpeedTrends ? (
              <ReadingSpeedTrendsCard data={readingSpeedTrends} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load reading speed trends. Please try again later.
                </p>
              </div>
            )}
          </section>

          <section>
            {mostFailedChallenges ? (
              <MostFailedChallengesCard data={mostFailedChallenges} />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load most failed challenges. Please try again later.
                </p>
              </div>
            )}
          </section>
        </TabsContent>

        {/* Content Performance Metrics Tab */}
        <TabsContent value="content" className="space-y-6">
          <section>
            {contentPerformanceMetrics ? (
              <ContentPerformanceCard 
                data={contentPerformanceMetrics}
                isLoading={false}
              />
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">
                  Failed to load content performance metrics. Please try again later.
                </p>
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
