/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { ChevronRight, ChevronLeft, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
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
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useLocale } from "@/src/contexts/LocaleContext";
import { AiStorytellingIntro } from "../components/AiStorytellingIntro";
import { ChildProfile } from "@readdly/shared-types";
import { generateStorytellingAction } from "@/src/lib/ai-service/server-actions";

export default function ParentOnboarding({
  session,
  childProfile,
}: {
  session: Session | null;
  childProfile: ChildProfile;
}) {
  const user = session!.user;
  const router = useRouter();
  const t = useTranslations("OnboardingStorytelling");
  const { isRTL } = useLocale();

  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customThemeInput, setCustomThemeInput] = useState("");
  const [customThemes, setCustomThemes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [formData, setFormData] = useState<{
    childBasic: { childName?: string; childLanguage?: string };
    childPreferences: { favoriteThemes?: string[] };
    childObjectives: { learningObjectives?: string[]; otherObjective?: string };
  }>({
    childBasic: {},
    childPreferences: {},
    childObjectives: {},
  });

  // Define available themes
  const allThemes = [
    { id: "space", name: "Space" },
    { id: "magic", name: "Magic" },
    { id: "fantasy", name: "Fantasy" },
    { id: "animals", name: "Animals" },
    { id: "adventure", name: "Adventure" },
    { id: "robots", name: "Robots" },
    { id: "mystery", name: "Mystery" },
  ];

  // Merge default themes with custom themes
  const mergedThemes = [...allThemes, ...customThemes];

  // Handler to add custom theme
  const handleAddCustomTheme = () => {
    if (customThemeInput.trim()) {
      const newCustomTheme = {
        id: `custom-${Date.now()}`,
        name: customThemeInput.trim(),
      };
      setCustomThemes([...customThemes, newCustomTheme]);
      setCustomThemeInput("");
    }
  };

  // Handler to remove custom theme
  const handleRemoveCustomTheme = (themeId: string) => {
    const updatedCustomThemes = customThemes.filter((t) => t.id !== themeId);
    setCustomThemes(updatedCustomThemes);

    // Also remove from form selection if selected
    const currentThemes =
      childPreferencesForm.getValues("favoriteThemes") || [];
    const filteredThemes = currentThemes.filter((t) => t !== themeId);
    if (filteredThemes.length !== currentThemes.length) {
      childPreferencesForm.setValue("favoriteThemes", filteredThemes);
    }
  };

  // Available languages for story generation
  const availableLanguages = [
    { code: "en", label: t("English") },
    { code: "fr", label: t("French") },
    { code: "ar", label: t("Arabic") },
  ];

  // Learning objectives options (parent-friendly language)
  const learningObjectivesOptions = [
    { id: "thinking", label: t("objective_thinking") },
    { id: "reading", label: t("objective_reading") },
    { id: "vocabulary", label: t("objective_vocabulary") },
    { id: "focus", label: t("objective_focus") },
    { id: "confidence", label: t("objective_confidence") },
    { id: "social", label: t("objective_social") },
    { id: "other", label: t("objective_other") },
  ];

  // Step 1: Child Identity (Name + Language)
  const childBasicSchema = z.object({
    childName: z.string().min(1, t("childNameRequired")),
    childLanguage: z.string().min(1, t("selectLanguageRequired")),
  });

  const childBasicForm = useForm({
    resolver: zodResolver(childBasicSchema),
    defaultValues: { childName: childProfile?.name || "", childLanguage: "" },
  });

  // Step 2: Child Preferences (Themes)
  const childPreferencesSchema = z.object({
    favoriteThemes: z.array(z.string()).min(1, t("selectAtLeastOneTheme")),
  });

  const childPreferencesForm = useForm({
    resolver: zodResolver(childPreferencesSchema),
    defaultValues: { favoriteThemes: [] },
  });

  // Step 3: Learning Objectives
  const childObjectivesSchema = z.object({
    learningObjectives: z
      .array(z.string())
      .min(1, t("selectAtLeastOneObjective")),
    otherObjective: z.string().optional(),
  });

  const childObjectivesForm = useForm({
    resolver: zodResolver(childObjectivesSchema),
    defaultValues: { learningObjectives: [], otherObjective: "" },
  });

  const onChildBasicSubmit = async (data: any) => {
    setFormData({ ...formData, childBasic: data });
    setStep(2);
  };

  const onChildPreferencesSubmit = async (data: any) => {
    setFormData({ ...formData, childPreferences: data });
    setStep(3);
  };

  const onChildObjectivesSubmit = async (data: any) => {
    setFormData({ ...formData, childObjectives: data });
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate required data
      if (
        !user.email ||
        !formData.childBasic.childName ||
        !formData.childBasic.childLanguage
      ) {
        toast.error(t("missingRequired"));
        setIsLoading(false);
        return;
      }

      // Prepare request payload with AI storytelling data
      const payload = {
        childProfileId: childProfile.id,
        name: formData.childBasic.childName,
        childLanguage: formData.childBasic.childLanguage,
        favoriteThemes:
          formData.childPreferences.favoriteThemes?.map((id) => {
            const theme = mergedThemes.find((t) => t.id === id);
            return theme?.name || id;
          }) || [],
        learningObjectives: [
          // Filter out "other" from selected objectives
          ...(formData.childObjectives.learningObjectives?.filter(
            (obj) => obj !== "other",
          ) || []),
          // Add custom objective text only if provided (and it's not empty)
          ...(formData.childObjectives.otherObjective?.trim()
            ? [formData.childObjectives.otherObjective.trim()]
            : []),
        ],
      };
      console.log("Final onboarding payload:", payload);

      // Call server action to generate storytelling profile
      const result = await generateStorytellingAction(payload);

      if (!result.success) {
        toast.error(result.error || t("onboardingError"));
        setIsLoading(false);
        return;
      }

      toast.success(t("childCreated"));

      // Redirect to parent dashboard after a short delay
      router.push("/parent-dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("onboardingError");
      toast.error(message || t("onboardingError"));
      console.error("Onboarding error:", error);
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const progressPercentage = ((step - 1) / 3) * 100;

  return (
    <>
      <AiStorytellingIntro onContinue={() => setShowIntro(false)} />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl px-2 sm:px-0">
          {/* Header with Animation */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center mb-6 sm:mb-8 text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {step === 1 && t("titleStep1")}
              {step === 2 && t("titleStep2")}
              {step === 3 && t("titleStep3")}
              {step === 4 && t("titleStep4")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {step === 1 && t("descStep1")}
              {step === 2 && t("descStep2")}
              {step === 3 && t("descStep3")}
              {step === 4 && t("descStep4")}
            </p>
          </motion.div>

          {/* Animated Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              {[1, 2, 3, 4].map((s) => (
                <motion.div
                  key={s}
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all ${
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
          <div className="bg-card rounded-lg border p-4 sm:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={childBasicForm.handleSubmit(onChildBasicSubmit)}
                >
                  <FieldGroup className="space-y-4">
                    <Field>
                      <FieldLabel htmlFor="childName">
                        {t("childNameLabel")}
                      </FieldLabel>
                      <FieldDescription className="mb-2">
                        {t("childNameDesc")}
                      </FieldDescription>
                      <Input
                        id="childName"
                        placeholder={t("childNamePlaceholder")}
                        {...childBasicForm.register("childName")}
                      />
                      {childBasicForm.formState.errors.childName && (
                        <FieldDescription className="text-destructive">
                          {childBasicForm.formState.errors.childName.message}
                        </FieldDescription>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="childLanguage">
                        {t("childLanguageLabel")}
                      </FieldLabel>
                      <Controller
                        control={childBasicForm.control}
                        name="childLanguage"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t("selectLanguagePlaceholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLanguages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {childBasicForm.formState.errors.childLanguage && (
                        <FieldDescription className="text-destructive">
                          {
                            childBasicForm.formState.errors.childLanguage
                              .message
                          }
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldGroup>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={() => router.back()}
                    >
                      {isRTL ? (
                        <ChevronRight className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 mr-2" />
                      )}
                      {t("cancel")}
                    </Button>
                    <Button type="submit" className="w-full sm:flex-1">
                      {t("next")}
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
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
                  onSubmit={childPreferencesForm.handleSubmit(
                    onChildPreferencesSubmit,
                  )}
                >
                  <FieldGroup className="space-y-6">
                    <Field>
                      <FieldLabel>{t("favoriteThemesLabel")}</FieldLabel>
                      <FieldDescription className="mb-3">
                        {t("selectAllApply")}
                      </FieldDescription>
                      {allThemes.length > 0 ? (
                        <Controller
                          control={childPreferencesForm.control}
                          name="favoriteThemes"
                          render={({ field }) => (
                            <div className="space-y-4">
                              {/* Add Custom Theme Input */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder={
                                    t("addCustomThemePlaceholder") ||
                                    "Add a custom theme..."
                                  }
                                  value={customThemeInput}
                                  onChange={(e) =>
                                    setCustomThemeInput(e.target.value)
                                  }
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddCustomTheme();
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size={"sm"}
                                  type="button"
                                  variant="outline"
                                  onClick={handleAddCustomTheme}
                                  disabled={!customThemeInput.trim()}
                                >
                                  +
                                </Button>
                              </div>

                              {/* Theme Selection Grid */}
                              <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {mergedThemes.map((theme) => {
                                  const checked =
                                    Array.isArray(field.value) &&
                                    field.value.includes(theme.id);
                                  const isCustom = customThemes.some(
                                    (ct) => ct.id === theme.id,
                                  );
                                  return (
                                    <div
                                      key={theme.id}
                                      className="flex items-center justify-between gap-2 p-2 h-11 rounded border hover:bg-muted/50"
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <Checkbox
                                          id={theme.id}
                                          checked={checked}
                                          onCheckedChange={(val) => {
                                            const next = new Set(
                                              field.value || [],
                                            );
                                            if (val) next.add(theme.id);
                                            else next.delete(theme.id);
                                            field.onChange(Array.from(next));
                                          }}
                                        />
                                        <label
                                          htmlFor={theme.id}
                                          className="cursor-pointer flex-1"
                                        >
                                          {theme.name}
                                        </label>
                                      </div>
                                      {isCustom && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveCustomTheme(theme.id)
                                          }
                                          className="text-destructive hover:text-destructive/80 text-sm"
                                          title="Remove custom theme"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          {t("availableThemesEmpty")}
                        </p>
                      )}
                      {childPreferencesForm.formState.errors.favoriteThemes && (
                        <FieldDescription className="text-destructive">
                          {
                            childPreferencesForm.formState.errors.favoriteThemes
                              .message
                          }
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldGroup>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={handlePrevious}
                    >
                      {isRTL ? (
                        <ChevronRight className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 mr-2" />
                      )}{" "}
                      {t("previous")}
                    </Button>
                    <Button type="submit" className="w-full sm:flex-1">
                      {t("next")}
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
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
                  onSubmit={childObjectivesForm.handleSubmit(
                    onChildObjectivesSubmit,
                  )}
                >
                  <FieldGroup className="space-y-6">
                    <Field>
                      <FieldLabel>{t("learningObjectivesLabel")}</FieldLabel>
                      <FieldDescription className="mb-3">
                        {t("selectObjectivesDesc")}
                      </FieldDescription>
                      <Controller
                        control={childObjectivesForm.control}
                        name="learningObjectives"
                        render={({ field }) => (
                          <div className="space-y-3">
                            {learningObjectivesOptions.map((option) => {
                              const checked =
                                Array.isArray(field.value) &&
                                field.value.includes(option.id);
                              return (
                                <div key={option.id}>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={option.id}
                                      checked={checked}
                                      onCheckedChange={(val) => {
                                        const next = new Set(field.value || []);
                                        if (val) next.add(option.id);
                                        else next.delete(option.id);
                                        field.onChange(Array.from(next));
                                      }}
                                    />
                                    <label
                                      htmlFor={option.id}
                                      className="cursor-pointer flex items-center gap-1"
                                    >
                                      <span>{option.label}</span>
                                    </label>
                                  </div>
                                  {/* Show text input if "Other" is selected */}
                                  {option.id === "other" && checked && (
                                    <div className="ml-5 mt-2">
                                      <Input
                                        placeholder={t(
                                          "otherObjectivePlaceholder",
                                        )}
                                        {...childObjectivesForm.register(
                                          "otherObjective",
                                        )}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      />
                      {childObjectivesForm.formState.errors
                        .learningObjectives && (
                        <FieldDescription className="text-destructive">
                          {
                            childObjectivesForm.formState.errors
                              .learningObjectives.message
                          }
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldGroup>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={handlePrevious}
                    >
                      {isRTL ? (
                        <ChevronRight className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 mr-2" />
                      )}{" "}
                      {t("previous")}
                    </Button>
                    <Button type="submit" className="w-full sm:flex-1">
                      {t("next")}
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
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
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-medium mb-2">
                      {t("titleStep4")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {t("descStep4")}
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-3">
                    {/* Child Name */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {t("childNameLabel")}
                      </p>
                      <p className="text-lg font-semibold text-foreground mt-1">
                        {formData.childBasic.childName}
                      </p>
                    </div>

                    {/* Language */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {t("childLanguageLabel")}
                      </p>
                      <p className="text-lg font-semibold text-foreground mt-1">
                        {availableLanguages.find(
                          (l) => l.code === formData.childBasic.childLanguage,
                        )?.label || formData.childBasic.childLanguage}
                      </p>
                    </div>

                    {/* Themes */}
                    {(formData.childPreferences.favoriteThemes || []).length >
                      0 && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-3">
                          {t("favoriteThemesLabel")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(formData.childPreferences.favoriteThemes || []).map(
                            (themeId) => {
                              // Check both default and custom themes
                              const theme =
                                allThemes.find((t) => t.id === themeId) ||
                                customThemes.find((t) => t.id === themeId);
                              if (!theme) return null;
                              return (
                                <span
                                  key={themeId}
                                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                                >
                                  {theme.name}
                                </span>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                    {/* Learning Objectives */}
                    {(formData.childObjectives.learningObjectives || [])
                      .length > 0 && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-3">
                          {t("learningObjectivesLabel")}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(
                            formData.childObjectives.learningObjectives || []
                          ).map((objId) => {
                            // Skip "other" as we'll show it separately with the custom text
                            if (objId === "other") return null;
                            const objective = learningObjectivesOptions.find(
                              (o) => o.id === objId,
                            );
                            return (
                              <span
                                key={objId}
                                className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium"
                              >
                                {objective?.label}
                              </span>
                            );
                          })}
                        </div>
                        {/* Show custom objective if "other" is selected */}
                        {(
                          formData.childObjectives.learningObjectives || []
                        ).includes("other") &&
                          formData.childObjectives.otherObjective && (
                            <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                              {formData.childObjectives.otherObjective}
                            </span>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:flex-1"
                      disabled={isLoading}
                      onClick={handlePrevious}
                    >
                      {isRTL ? (
                        <ChevronRight className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 mr-2" />
                      )}
                      {t("previous")}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isLoading}
                      className="w-full sm:flex-1"
                    >
                      {isLoading ? t("creatingProfile") : t("createProfile")}
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
            {t("stepOf", { step, total: 4 })}
          </p>
        </div>
      </div>
    </>
  );
}
