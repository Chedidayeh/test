"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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

export default function ParentOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    parent: {},
    childBasic: {},
    childPreferences: {},
  });

  // Step 1: Parent Info Form
  const parentForm = useForm({
    defaultValues: { parentName: "", parentEmail: "" },
  });

  // Step 2: Child Basic Info
  const childBasicForm = useForm({
    defaultValues: { childName: "", childAge: "" },
  });

  // Step 3: Child Preferences
  const childPreferencesForm = useForm({
    defaultValues: { favoriteGenres: [], readingLevel: "" },
  });

  const genres = [
    "Adventure",
    "Fantasy",
    "Mystery",
    "Science Fiction",
    "Fairy Tales",
    "Educational",
  ];
  const ageGroups = [
    "3-5 years",
    "6-8 years",
    "9-11 years",
    "12-14 years",
    "15+ years",
  ];
  const readingLevels = ["Beginner", "Intermediate", "Advanced", "Proficient"];

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
      // TODO: Send formData to API endpoint
      console.log("Final onboarding data:", formData);
      toast.success("Onboarding completed successfully!");
      // Redirect to dashboard or home
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch {
      toast.error("An error occurred during onboarding");
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
                    <select
                      id="childAge"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      {...childBasicForm.register("childAge")}
                    >
                      <option value="">Select an age group</option>
                      {ageGroups.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
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
                    <div className="space-y-2 grid grid-cols-3">
                      {genres.map((genre) => (
                        <div key={genre} className="flex items-center gap-2">
                          <Checkbox
                            id={genre}
                            {...childPreferencesForm.register("favoriteGenres")}
                            value={genre}
                          />
                          <label htmlFor={genre} className="cursor-pointer">
                            {genre}
                          </label>
                        </div>
                      ))}
                    </div>
                    {childPreferencesForm.formState.errors.favoriteGenres && (
                      <FieldDescription className="text-destructive">
                        {
                          childPreferencesForm.formState.errors.favoriteGenres
                            .message
                        }
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="readingLevel">
                      Reading Level
                    </FieldLabel>
                    <select
                      id="readingLevel"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      {...childPreferencesForm.register("readingLevel")}
                    >
                      <option value="">Select a reading level</option>
                      {readingLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    {childPreferencesForm.formState.errors.readingLevel && (
                      <FieldDescription className="text-destructive">
                        {
                          childPreferencesForm.formState.errors.readingLevel
                            .message
                        }
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

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to Readly, {formData.parent.parentName}!
                </h2>
                <p className="text-muted-foreground mb-4">
                  We&apos;ve set up a personalized experience for{" "}
                  <span className="font-semibold text-foreground">
                    {formData.childBasic.childName}
                  </span>
                  . Let&apos;s explore amazing stories together!
                </p>

                <Card className="bg-primary/5 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      <strong>Age Group:</strong> {formData.childBasic.childAge}
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Reading Level:</strong>{" "}
                      {formData.childPreferences.readingLevel}
                    </p>
                  </CardContent>
                </Card>

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
                    onClick={() => router.push("/parent-dashboard")}
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
