/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronRight,
  ChevronLeft,
  User,
  BookOpen,
  Heart,
  CheckCircle,
  CircleCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import {
  AGE_GROUPS,
  STORY_GENRES,
} from "../../../../../packages/shared/data";
import { Session } from "next-auth";

export default function ParentOnboarding({ session }: { session: Session | null }) {
  const user = session!.user;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    parent: { parentName?: string; parentEmail?: string };
    childBasic: { childName?: string; childAge?: string };
    childPreferences: { favoriteGenres?: string[] };
  }>({
    parent: { parentName: user?.name ?? "", parentEmail: user?.email ?? "" },
    childBasic: {},
    childPreferences: {},
  });

  // Step 1: Parent Info Form
  const parentForm = useForm({
    defaultValues: { parentName: user.name, parentEmail: user.email },
  });

  // Step 2: Child Basic Info
  const childBasicSchema = z.object({
    childName: z.string().min(1, "Child name is required"),
    childAge: z
      .string()
      .min(1, "Please select an age group for your child")
      .refine((v) => (AGE_GROUPS as readonly string[]).includes(v), {
        message: "Selected age group is invalid",
      }),
  });

  const childBasicForm = useForm({
    resolver: zodResolver(childBasicSchema),
    defaultValues: { childName: "", childAge: "" },
  });

  // Step 3: Child Preferences
  const childPreferencesSchema = z.object({
    favoriteGenres: z
      .array(z.enum(STORY_GENRES as unknown as [string, ...string[]]))
      .min(1, "Select at least one genre"),
  });

  const childPreferencesForm = useForm({
    resolver: zodResolver(childPreferencesSchema),
    defaultValues: { favoriteGenres: [] },
  });

  const genreOptions = STORY_GENRES.map((g) => ({
    value: g,
    label: g
      .split("-")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" "),
  }));

  // Use shared runtime data arrays
  const ageGroups = AGE_GROUPS;

  const onParentSubmit = async (data: any) => {
    setFormData({ ...formData, parent: data });
    setStep(2);
  };

  const onChildBasicSubmit = async (data: any) => {
    setFormData({ ...formData, childBasic: data });
    setStep(3);
  };

  const onChildPreferencesSubmit = async (data: any) => {
    setFormData({ ...formData, childPreferences: data });
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate required data
      if (!formData.parent.parentEmail || !formData.childBasic.childName || !formData.childBasic.childAge) {
        toast.error("Missing required information");
        setIsLoading(false);
        return;
      }

      // Prepare request payload
      const payload = {
        parentEmail: formData.parent.parentEmail,
        name: formData.childBasic.childName,
        ageGroup: formData.childBasic.childAge,
        favoriteGenres: formData.childPreferences.favoriteGenres,
      };

      // Send to auth service
      const response = await fetch("/api/auth/create-child-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create child profile");
      }

      const result = await response.json();
      console.log("Child profile created successfully:", result);
      
      toast.success("Child profile created successfully!");
      
      // Redirect to parent dashboard after a short delay
      setTimeout(() => router.push("/parent-dashboard"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred during onboarding";
      toast.error(message);
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const progressPercentage = ((step - 1) / 3) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        {/* <div className="mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div> */}

        {/* Header with Animation */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">
            {step === 1 && "Welcome to Readly"}
            {step === 2 && "Tell us about your child"}
            {step === 3 && "What does your child enjoy?"}
            {step === 4 && "All set!"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 1 &&
              "Let's start by getting to know you and your child better."}
            {step === 2 && "Help us personalize the experience for your child."}
            {step === 3 &&
              "Select genres and reading levels to customize recommendations."}
            {step === 4 && "Your profile is ready. Let's start exploring!"}
          </p>
        </motion.div>

        {/* Animated Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {[1, 2, 3, 4].map((s) => (
              <motion.div
                key={s}
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                      ? "bg-primary/70 text-primary-foreground border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                }`}
                animate={{
                  scale: s === step ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {s < step ? (
                  <CircleCheck className="w-5 h-5 text-background" />
                ) : (
                  s
                )}
              </motion.div>
            ))}
          </div>

          {/* Smooth progress bar animation */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card rounded-lg border p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={parentForm.handleSubmit(onParentSubmit)}
              >
                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="parentName">Your Name</FieldLabel>
                    <Input
                      id="parentName"
                      placeholder="John Doe"
                      disabled
                      className=""
                      {...parentForm.register("parentName")}
                    />
                    {parentForm.formState.errors.parentName && (
                      <FieldDescription className="text-destructive">
                        {parentForm.formState.errors.parentName.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="parentEmail">Email</FieldLabel>
                    <Input
                      id="parentEmail"
                      type="email"
                      disabled
                      placeholder="you@example.com"
                      {...parentForm.register("parentEmail")}
                    />
                    {parentForm.formState.errors.parentEmail && (
                      <FieldDescription className="text-destructive">
                        {parentForm.formState.errors.parentEmail.message}
                      </FieldDescription>
                    )}
                  </Field>
                </FieldGroup>

                <div className="flex gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/")}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={childBasicForm.handleSubmit(onChildBasicSubmit)}
              >
                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="childName">
                      Child&apos;s Name
                    </FieldLabel>
                    <Input
                      id="childName"
                      placeholder="Emma"
                      {...childBasicForm.register("childName")}
                    />
                    {childBasicForm.formState.errors.childName && (
                      <FieldDescription className="text-destructive">
                        {childBasicForm.formState.errors.childName.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="childAge">Age Group</FieldLabel>
                    <Controller
                      control={childBasicForm.control}
                      name="childAge"
                      render={({ field }) => (
                        <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an age group" />
                          </SelectTrigger>
                          <SelectContent>
                            {ageGroups.map((age) => (
                              <SelectItem key={age} value={age}>
                                {age}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {childBasicForm.formState.errors.childAge && (
                      <FieldDescription className="text-destructive">
                        {childBasicForm.formState.errors.childAge.message}
                      </FieldDescription>
                    )}
                  </Field>
                </FieldGroup>

                <div className="flex gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button type="submit" className="flex-1">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={childPreferencesForm.handleSubmit(
                  onChildPreferencesSubmit,
                )}
              >
                <FieldGroup className="space-y-6">
                  <Field>
                    <FieldLabel>Favorite Genres</FieldLabel>
                    <FieldDescription className="mb-3">
                      Select all that apply
                    </FieldDescription>
                    <Controller
                      control={childPreferencesForm.control}
                      name="favoriteGenres"
                      render={({ field }) => (
                        <div className="space-y-2 grid grid-cols-3">
                          {genreOptions.map((g) => {
                            const checked = Array.isArray(field.value) && field.value.includes(g.value);
                            return (
                              <div key={g.value} className="flex items-center gap-2">
                                <Checkbox
                                  id={g.value}
                                  checked={checked}
                                  onCheckedChange={(val) => {
                                    const next = new Set(field.value || []);
                                    if (val) next.add(g.value);
                                    else next.delete(g.value);
                                    field.onChange(Array.from(next));
                                  }}
                                />
                                <label htmlFor={g.value} className="cursor-pointer">
                                  {g.label}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    />
                    {childPreferencesForm.formState.errors.favoriteGenres && (
                      <FieldDescription className="text-destructive">
                        {
                          childPreferencesForm.formState.errors.favoriteGenres
                            .message
                        }
                      </FieldDescription>
                    )}
                  </Field>

                  {/* Reading level removed — handled later or by defaults */}
                </FieldGroup>

                <div className="flex gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button type="submit" className="flex-1">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-medium mb-2">
                  Welcome to Readly, {formData.parent.parentName}!
                </h2>
                <p className="text-muted-foreground mb-4">
                  We&apos;ve set up a personalized experience for{" "}
                  <span className="font-medium text-foreground">
                    {formData.childBasic.childName}
                  </span>
                  . Let&apos;s explore amazing stories together!
                </p>



                <div className="flex gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    type="submit"
                    onClick={handleFinalSubmit}
                    className="flex-1"
                  >
                    {isLoading ? "Setting up..." : "Start Exploring"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step counter */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Step {step} of 4
        </p>
      </div>
    </div>
  );
}
