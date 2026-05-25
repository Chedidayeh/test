"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";

interface MostPopularStory {
  storyId: string;
  storyTitle?: string;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  avgTimeSpentMinutes: number;
  difficulty: number | null;
}

interface ContentPerformanceData {
  mostPopularStories: MostPopularStory[];
}

interface ContentPerformanceCardProps {
  data: ContentPerformanceData;
  isLoading: boolean;
  error?: string;
}

const getCompletionRateColor = (rate: number): string => {
  if (rate < 40) return "bg-red-100 text-red-800";
  if (rate < 60) return "bg-orange-100 text-orange-800";
  if (rate < 80) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

const MostPopularStoriesTab: React.FC<{ data: MostPopularStory[] }> = ({ data }) => {
  const chartData = data.slice(0, 20).map((story) => ({
    name: story.storyTitle || story.storyId,
    completionRate: story.completionRate,
    avgTime: story.avgTimeSpentMinutes,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis yAxisId="left" label={{ value: "Completion Rate (%)", angle: -90, position: "insideLeft" }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: "Avg Time (minutes)", angle: 90, position: "insideRight" }} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="completionRate" fill="#3b82f6" name="Completion Rate (%)" />
          <Bar yAxisId="right" dataKey="avgTime" fill="#10b981" name="Avg Time (minutes)" />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Story Name</TableHead>
              <TableHead className="text-right">Started</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Rate (%)</TableHead>
              <TableHead className="text-right">Avg Time (min)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 20).map((story) => (
              <TableRow key={story.storyId}>
                <TableCell className="font-medium">{story.storyTitle || story.storyId}</TableCell>
                <TableCell className="text-right">{story.totalStarted}</TableCell>
                <TableCell className="text-right">{story.totalCompleted}</TableCell>
                <TableCell className="text-right">
                  <Badge className={getCompletionRateColor(story.completionRate)}>
                    {story.completionRate}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{story.avgTimeSpentMinutes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const ContentPerformanceCard: React.FC<ContentPerformanceCardProps> = ({
  data,
  isLoading,
  error,
}) => {

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Stories</CardTitle>
          <CardDescription>Loading stories...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Stories</CardTitle>
          <CardDescription>Error loading stories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 bg-red-50 rounded">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Most Popular Stories</CardTitle>
        <CardDescription>
          Analysis of the most popular and engaging stories
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.mostPopularStories.length > 0 ? (
          <MostPopularStoriesTab data={data.mostPopularStories} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No story data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
