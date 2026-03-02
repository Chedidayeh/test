/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CircleCheck } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/src/components/ui/field";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";

import { AgeGroup, Theme } from "@shared/types";
import { createChildProfileAction } from "@/src/app/onboarding/actions";
import { Session } from "next-auth";

interface AddChildDialogProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ageGroups: AgeGroup[];
  parentId: string;
  parentEmail: string;
  onChildAdded: () => void;
}

export default function AddChildDialog({
  session,  
  open,
  onOpenChange,
  ageGroups,
  parentId,
  parentEmail,
  onChildAdded,
}: AddChildDialogProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    childBasic: { childName: string; childAge: string };
    childPreferences: { favoriteThemes: string[] };
  }>({
    childBasic: { childName: "", childAge: "" },
    childPreferences: { favoriteThemes: [] },
  });

  // Schema for step 1
  const childBasicSchema = z.object({
    childName: z.string().min(1, "Child name is required"),
    childAge: z
      .string()
      .min(1, "Please select an age group for your child")
      .refine((v) => ageGroups.some((ag) => ag.id === v), {
        message: "Selected age group is invalid",
      }),
  });

  // Schema for step 2
  const childPreferencesSchema = z.object({
    favoriteThemes: z.array(z.string()).min(1, "Select at least one theme"),
  });

  const childBasicForm = useForm({
    resolver: zodResolver(childBasicSchema),
    defaultValues: { childName: "", childAge: "" },
  });

  const childPreferencesForm = useForm({
    resolver: zodResolver(childPreferencesSchema),
    defaultValues: { favoriteThemes: [] },
  });

  const selectedAgeGroupId = childBasicForm.watch("childAge");
  const selectedAgeGroup = ageGroups.find((ag) => ag.id === selectedAgeGroupId);

  const getThemesForAgeGroup = (ageGroupId: string): Theme[] => {
    const ag = ageGroups.find((a) => a.id === ageGroupId);
    if (!ag) return [];
    const themes = ag.roadmaps.map((roadmap) => roadmap.theme);
    return Array.from(new Map(themes.map((t) => [t.id, t])).values());
  };

  const availableThemes = selectedAgeGroupId
    ? getThemesForAgeGroup(selectedAgeGroupId)
    : [];

  const handleStep1Submit = async (data: any) => {
    setFormData({ ...formData, childBasic: data });
    setStep(2);
  };

  const handleStep2Submit = async (data: any) => {
    setFormData({ ...formData, childPreferences: data });
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      const ageGroupId = formData.childBasic.childAge;
      const themeIds = formData.childPreferences.favoriteThemes || [];

      const selectedAgeGroupData = ageGroups.find((ag) => ag.id === ageGroupId);
      const allocatedRoadmaps = selectedAgeGroupData?.roadmaps
        ?.filter((roadmap) => themeIds.includes(roadmap.themeId))
        .map((roadmap) => roadmap.id) || [];



      const payload = {
        session,
        parentEmail,
        parentId,
        name: formData.childBasic.childName,
        ageGroupId,
        themeIds,
        allocatedRoadmaps,
      };

      const result = await createChildProfileAction(payload);

      if (!result.success) {
        throw new Error(result.error || "Failed to create child profile");
      }

      toast.success("Child profile created successfully!");

      // Reset form and close dialog
      childBasicForm.reset();
      childPreferencesForm.reset();
      setStep(1);
      setFormData({ childBasic: { childName: "", childAge: "" }, childPreferences: { favoriteThemes: [] } });
      onOpenChange(false);

      // Trigger parent data refetch
      onChildAdded();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
      console.error("Add child error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form on dialog close
      childBasicForm.reset();
      childPreferencesForm.reset();
      setStep(1);
      setFormData({ childBasic: { childName: "", childAge: "" }, childPreferences: { favoriteThemes: [] } });
    }
    onOpenChange(newOpen);
  };

  const progressPercentage = ((step - 1) / 2) * 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Child</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                    s < step
                      ? "bg-primary text-primary-foreground"
                      : s === step
                        ? "bg-primary/70 text-primary-foreground border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                  animate={{ scale: s === step ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {s < step ? <CircleCheck className="w-4 h-4" /> : s}
                </motion.div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={childBasicForm.handleSubmit(handleStep1Submit)}
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">
                    Child&apos;s Basic Information
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tell us about your child
                  </p>
                </div>

                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="childName">
                      Child&apos;s Name
                    </FieldLabel>
                    <Input
                      id="childName"
                      placeholder="e.g., Emma"
                      {...childBasicForm.register("childName")}
                    />
                    {childBasicForm.formState.errors.childName && (
                      <FieldDescription className="text-red-500">
                        {childBasicForm.formState.errors.childName.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Age Group</FieldLabel>
                    <Controller
                      control={childBasicForm.control}
                      name="childAge"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                          <SelectContent>
                            {ageGroups.map((ag) => (
                              <SelectItem key={ag.id} value={ag.id}>
                                {ag.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {childBasicForm.formState.errors.childAge && (
                      <FieldDescription className="text-red-500">
                        {childBasicForm.formState.errors.childAge.message}
                      </FieldDescription>
                    )}
                  </Field>
                </FieldGroup>

                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={childPreferencesForm.handleSubmit(handleStep2Submit)}
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">
                    Favorite Themes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    What does {formData.childBasic.childName} enjoy?
                  </p>
                </div>

                <FieldGroup className="space-y-3">
                  {availableThemes.length > 0 ? (
                    availableThemes.map((theme) => (
                      <div key={theme.id} className="flex items-center space-x-2">
                        <Controller
                          control={childPreferencesForm.control}
                          name="favoriteThemes"
                          render={({ field }) => (
                            <Checkbox
                              id={`theme-${theme.id}`}
                              checked={field.value?.includes(theme.id) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, theme.id]);
                                } else {
                                  field.onChange(
                                    current.filter((id) => id !== theme.id)
                                  );
                                }
                              }}
                            />
                          )}
                        />
                        <label
                          htmlFor={`theme-${theme.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {theme.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No themes available
                    </p>
                  )}
                </FieldGroup>

                {childPreferencesForm.formState.errors.favoriteThemes && (
                  <FieldDescription className="text-red-500 mt-4">
                    {childPreferencesForm.formState.errors.favoriteThemes.message}
                  </FieldDescription>
                )}

                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h3 className="font-semibold text-sm mb-2">
                  Review Child Profile
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 mt-4 text-left">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {formData.childBasic.childName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Age Group</p>
                    <p className="font-medium">
                      {selectedAgeGroup?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Favorite Themes
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.childPreferences.favoriteThemes?.map(
                        (themeId) => {
                          const theme = availableThemes.find(
                            (t) => t.id === themeId
                          );
                          return (
                            <span
                              key={themeId}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {theme?.name}
                            </span>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Creating..." : "Create Child"}
                    {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
