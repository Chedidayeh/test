"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChildProfile, Roadmap } from "@readdly/shared-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";
import { toast } from "sonner";
import { allocateRoadmapToChildAction } from "@/src/lib/progress-service/server-actions";
import { useRouter } from "next/navigation";

interface AllocateRoadmapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmap: Roadmap;
  childrenList: ChildProfile[];
}

export default function AllocateRoadmapDialog({
  open,
  onOpenChange,
  roadmap,
  childrenList,
}: AllocateRoadmapDialogProps) {
  const t = useTranslations("RoadmapsLibrary.allocateDialog");
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
  const handleAllocate = async () => {
    if (!selectedChildId) {
      toast.error(t("messages.selectChild"));
      return;
    }

    // Check if the selected child already has this roadmap allocated
    const selectedChild = childrenList.find((child) => child.childId === selectedChildId);
    if (selectedChild?.allocatedRoadmaps?.includes(roadmap.id)) {
      toast.error(
        t("messages.alreadyHasAccess", { childName: selectedChild.name }),
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await allocateRoadmapToChildAction(
        selectedChildId,
        roadmap.id,
      );

      if (result.success) {
        toast.success(
          t("messages.allocatedSuccess", { roadmapName: roadmap.title || roadmap.theme.name, childName: result.data?.name || "child" }),
        );
        onOpenChange(false);
        setSelectedChildId("");
        router.push(`/child-dashboard/${selectedChildId}`);
      } else {
        toast.error(result.error || t("messages.allocationFailed"));
      }
    } catch (error) {
      console.error("Error allocating roadmap:", error);
      toast.error(t("messages.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { roadmapName: roadmap.title || roadmap.theme.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {childrenList.length === 0 ? (
            <p className="text-sm text-foreground/60">
              {t("empty")}
            </p>
          ) : (
            <RadioGroup value={selectedChildId} onValueChange={setSelectedChildId}>
              <div className="space-y-3">
                {childrenList.map((child) => {
                  const alreadyAllocated = child.allocatedRoadmaps?.includes(
                    roadmap.id,
                  );
                  return (
                    <div
                      key={child.childId}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        alreadyAllocated
                          ? "bg-muted/50 border-muted"
                          : "bg-muted/50 border-muted hover:bg-muted/30"
                      }`}
                    >
                      <RadioGroupItem
                        value={child.childId}
                        id={`child-${child.childId}`}
                        disabled={alreadyAllocated}
                      />
                      <Label
                        htmlFor={`child-${child.childId}`}
                        className={`flex-1 cursor-pointer font-medium ${
                          alreadyAllocated ? "text-foreground/50" : ""
                        }`}
                      >
                        {child.name}
                      </Label>
                      {alreadyAllocated && (
                        <span className="text-xs px-2 py-1 bg-muted text-foreground/60 rounded">
                          {t("alreadyAllocated")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            onClick={handleAllocate}
            disabled={isLoading || !selectedChildId || childrenList.length === 0}
          >
            {isLoading ? t("buttons.allocating") : t("buttons.allocate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
