"use client";

import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/src/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { AgeGroupContentValidationResult } from "@shared/types";



interface AgeGroupReadinessCheckerProps {
  validationResult: AgeGroupContentValidationResult |  undefined;
  isLoading?: boolean;
  error?: string | null;
}

export function AgeGroupReadinessChecker({
  validationResult,
  isLoading = false,
  error = null,
}: AgeGroupReadinessCheckerProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-2"></div>
            <p className="text-slate-600">Checking content completeness...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validation Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!validationResult) {
    return null;
  }

  const { isComplete, missingContent, completeRoadmapsCount, roadmapsCount } =
    validationResult;

  return (
    <div className="space-y-4">
      {/* Status Summary */}
      <Card className={`p-4 border-l-4 ${isComplete ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}>
        <div className="flex items-start gap-3">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`font-semibold ${isComplete ? "text-green-900" : "text-red-900"}`}>
              {isComplete ? "✓ Ready for Activation" : "✗ Cannot Activate Yet"}
            </h3>
            <p className={`text-sm mt-1 ${isComplete ? "text-green-800" : "text-red-800"}`}>
              {completeRoadmapsCount} of {roadmapsCount} roadmaps are complete with all required content
            </p>
          </div>
        </div>
      </Card>

      {/* Roadmaps Status Table */}
      {missingContent.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b ">
            <h4 className="font-semibold">
              Incomplete Roadmaps ({missingContent.length})
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              The following roadmaps need content before this age group can be activated
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="font-semibold">Theme</TableHead>
                <TableHead className="text-center font-semibold">Worlds</TableHead>
                <TableHead className="text-center font-semibold">Stories</TableHead>
                <TableHead className="text-center font-semibold">Chapters</TableHead>
                <TableHead className="font-semibold">Missing Content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missingContent.map((content, idx) => (
                <TableRow key={idx} className="border-b">
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{content.themeName || `Roadmap ${idx + 1}`}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={content.readings.worldsCount > 0 ? "text-green-700 font-semibold" : "text-red-700"}>
                      {content.readings.worldsCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={content.readings.storiesCount > 0 ? "text-green-700 font-semibold" : "text-red-700"}>
                      {content.readings.storiesCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={content.readings.chaptersCount > 0 ? "text-green-700 font-semibold" : "text-red-700"}>
                      {content.readings.chaptersCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1">
                      {content.missingItems.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm text-red-700">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Complete Roadmaps Info */}
      {completeRoadmapsCount > 0 && completeRoadmapsCount === roadmapsCount && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-900">All Roadmaps Complete</AlertTitle>
          <AlertDescription className="text-green-800">
            All {roadmapsCount} roadmap(s) have the required worlds, stories, and chapters. This age group is ready to be activated.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
