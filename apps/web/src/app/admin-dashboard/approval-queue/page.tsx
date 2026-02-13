"use client";

import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { toast } from "sonner";
import { mockApprovalQueue, ApprovalItem } from "../_data/mockData";

export default function ApprovalQueuePage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(
    mockApprovalQueue
  );

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "approved" as const } : a
      )
    );
    toast.success("Content approved");
  };

  const handleReject = (id: string) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "rejected" as const } : a
      )
    );
    toast.success("Content rejected");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approval Queue</h1>
        <p className="text-slate-600 mt-1">Review and approve pending content</p>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-600">No pending approvals</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {item.itemTitle}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {item.itemType}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      Submitted by {item.submittedBy}
                    </span>
                    <span className="text-sm text-slate-500">
                      {item.submittedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                {item.itemType === "story" && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-2">
                      {item.preview.title}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {item.preview.description}
                    </p>
                  </div>
                )}
                {item.itemType === "riddle" && (
                  <div>
                    <p className="text-sm text-slate-900 mb-2">
                      {item.preview.question}
                    </p>
                    <p className="text-sm text-slate-600">
                      Answer: {item.preview.correctAnswer}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-red-600 hover:text-red-700"
                  onClick={() => handleReject(item.id)}
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => handleApprove(item.id)}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
