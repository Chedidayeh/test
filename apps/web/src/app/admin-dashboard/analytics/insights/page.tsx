"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Insights</h1>
          <p className="text-slate-600 mt-1">
            Automated analysis and recommendations
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Reading Level Progression
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Based on performance analysis of 42 children, we found:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              • Children in the 6-7 age group progress fastest with Easy
              difficulty riddles
            </li>
            <li>
              • Reading comprehension improves 18% when using visual hints
            </li>
            <li>
              • Memory-based riddles show 24% better completion rates than
              inference-based
            </li>
          </ul>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Engagement Patterns
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            User engagement trends discovered:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              • Highest engagement weekends at 3-5 PM (40% more active users)
            </li>
            <li>
              • Stories under 5 minutes show 35% better completion rates
            </li>
            <li>
              • Gamification (badges) increases return rate by 28%
            </li>
          </ul>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-500">
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Struggling Learners
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Identified 8 children showing learning challenges:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Emma (ID: child-1) struggles with abstract/metaphorical riddles</li>
            <li>• Lucas (ID: child-2) needs more visual support for text-heavy content</li>
            <li>
              • Recommendation: Assign visual-emphasis stories for next 2 weeks
            </li>
          </ul>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            High Performers
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Top performing users to recognize:
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Odin (ID: child-3) completes 12 stories with 90%+ success</li>
            <li>• Sophia (ID: child-4) shows rapid learning curve, ready for advancement</li>
            <li>
              • Recommendation: Challenge with Hard difficulty stories
            </li>
          </ul>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6 bg-slate-50 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Content Recommendations
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-medium text-slate-900">
                Create more fantasy stories targeting 8-9 age group
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Current performance data shows 34% higher engagement with fantasy
                genre in this age range
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-medium text-slate-900">
                Increase visual hint frequency in hard-difficulty riddles
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Hard riddles with visual hints show 40% improvement in completion
                rates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-medium text-slate-900">
                Archive 3 stories with below 60% completion rates
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Stories: &quot;Hidden Treasure in Mountains", "The Crypto Quest",
                "Ancient Prophecy"
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Generation */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <div>
              <h3 className="font-semibold text-slate-900">Generate Report</h3>
              <p className="text-sm text-slate-600 mt-1">
                Create a comprehensive PDF report of all insights and recommendations
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Generate PDF
          </Button>
        </div>
      </Card>
    </div>
  );
}
