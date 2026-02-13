"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  size = "md",
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          size === "sm"
            ? "max-w-sm"
            : size === "lg"
              ? "max-w-2xl"
              : size === "xl"
                ? "max-w-4xl"
                : "max-w-md"
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">{children}</div>

        {onSubmit && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : submitText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
