/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/src/components/ui/switch";

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

import { AgeGroup, LanguageCode, Theme } from "@readdly/shared-types";
import { createChildProfileAction } from "@/src/lib/auth-service/server-actions";
import { Session } from "next-auth";
import { useLocale } from "@/src/contexts/LocaleContext";
import { getLanguageCode } from "@/src/lib/translation-utils";

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
  const t = useTranslations("ParentDashboard");
  const tOnboarding = useTranslations("Onboarding");
  const { isRTL, locale } = useLocale();
  const langCode = getLanguageCode(locale);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    childBasic: { childName: string; childAge: string; childGender: string };
    childPreferences: { favoriteThemes: string[] };
    readingSettings: { sessionsPerWeek?: number; enableReminders?: boolean };
  }>({
    childBasic: { childName: "", childAge: "", childGender: "" },
    childPreferences: { favoriteThemes: [] },
    readingSettings: {},
  });

  // Schema for step 1 (using translated messages)
  const childBasicSchema = z.object({
    childName: z.string().min(1, t("addChildDialog.errors.childNameRequired")),
    childAge: z
      .string()
      .min(1, t("addChildDialog.errors.selectAgeGroup"))
      .refine((v) => ageGroups?.some((ag) => ag.id === v) ?? false, {
        message: t("addChildDialog.errors.invalidAgeGroup"),
      }),
    childGender: z
      .string()
      .min(1, t("addChildDialog.errors.selectGender") || "Please select a gender")
      .refine((v) => ["boy", "girl"].includes(v), {
        message: t("addChildDialog.errors.selectGender") || "Please select a gender",
      }),
  });

  // Schema for step 2 (translated messages)
  const childPreferencesSchema = z.object({
    favoriteThemes: z
      .array(z.string())
      .min(1, t("addChildDialog.errors.selectAtLeastOneTheme")),
  });

  // Schema for step 3 (reading settings)
  const readingSettingsSchema = z.object({
    sessionsPerWeek: z.number().min(1, "Select reading frequency").max(7),
    enableReminders: z.boolean(),
  });

  const childBasicForm = useForm({
    resolver: zodResolver(childBasicSchema),
    defaultValues: { childName: "", childAge: "", childGender: "" },
  });

  const childPreferencesForm = useForm({
    resolver: zodResolver(childPreferencesSchema),
    defaultValues: { favoriteThemes: [] },
  });

  const readingSettingsForm = useForm({
    resolver: zodResolver(readingSettingsSchema),
    defaultValues: { sessionsPerWeek: 3, enableReminders: false },
  });

  const selectedAgeGroupId = childBasicForm.watch("childAge");
  const selectedAgeGroup = ageGroups?.find((ag) => ag.id === selectedAgeGroupId);

  const getThemesForAgeGroup = (ageGroupId: string): Theme[] => {
    const ag = ageGroups?.find((a) => a.id === ageGroupId);
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

  const handleStep3Submit = async (data: any) => {
    setFormData({ ...formData, readingSettings: data });
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      const ageGroupId = formData.childBasic.childAge;
      const themeIds = formData.childPreferences.favoriteThemes || [];
      const sessionsPerWeek = formData.readingSettings.sessionsPerWeek || 3;
      const activateNotifications = formData.readingSettings.enableReminders ?? false;

      const selectedAgeGroupData = ageGroups?.find((ag) => ag.id === ageGroupId);
      const allocatedRoadmaps =
        selectedAgeGroupData?.roadmaps
          ?.filter((roadmap) => themeIds.includes(roadmap.themeId))
          .map((roadmap) => roadmap.id) || [];

      const ageGroupName = selectedAgeGroupData?.name || "N/A";

      const payload = {
        session,
        parentEmail,
        parentId,
        name: formData.childBasic.childName,
        gender: formData.childBasic.childGender,
        ageGroupId,
        ageGroupName,
        themeIds,
        allocatedRoadmaps,
        sessionsPerWeek,
        activateNotifications,
      };

      const result = await createChildProfileAction(payload);

      if (!result.success) {
        throw new Error(result.error || "Failed to create child profile");
      }

      toast.success(t("addChildDialog.messages.createdSuccess"));

      // Reset form and close dialog
      childBasicForm.reset();
      childPreferencesForm.reset();
      readingSettingsForm.reset();
      setStep(1);
      setFormData({
        childBasic: { childName: "", childAge: "", childGender: "" },
        childPreferences: { favoriteThemes: [] },
        readingSettings: {},
      });
      onOpenChange(false);

      // Trigger parent data refetch
      onChildAdded();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("addChildDialog.messages.createError");
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
      readingSettingsForm.reset();
      setStep(1);
      setFormData({
        childBasic: { childName: "", childAge: "", childGender: "" },
        childPreferences: { favoriteThemes: [] },
        readingSettings: {},
      });
    }
    onOpenChange(newOpen);
  };

  const progressPercentage = ((step - 1) / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("addChildDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              {[1, 2, 3, 4].map((s) => (
                <motion.div
                  key={s}
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
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
                  <h3 className="font-medium text-sm mb-1">
                    {t("addChildDialog.step1.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("addChildDialog.step1.description")}
                  </p>
                </div>

                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="childName">
                      {t("addChildDialog.step1.childNameLabel")}
                    </FieldLabel>
                    <Input
                      id="childName"
                      placeholder={t(
                        "addChildDialog.step1.childNamePlaceholder",
                      )}
                      {...childBasicForm.register("childName")}
                    />
                    {childBasicForm.formState.errors.childName && (
                      <FieldDescription className="text-red-500">
                        {childBasicForm.formState.errors.childName.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>
                      {t("addChildDialog.step1.ageGroupLabel")}
                    </FieldLabel>
                    <Controller
                      control={childBasicForm.control}
                      name="childAge"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "addChildDialog.step1.ageGroupPlaceholder",
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {ageGroups.map((age) => {
                              const localizedageGroupName = (() => {
                                const translation = age.translations?.find(
                                  (tr: { languageCode: LanguageCode }) =>
                                    tr.languageCode === langCode,
                                );
                                return {
                                  name: translation?.name || age.name,
                                };
                              })();
                              return (
                                <SelectItem key={age.id} value={age.id}>
                                  {localizedageGroupName.name}
                                </SelectItem>
                              );
                            })}
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

                  <Field>
                    <FieldLabel>{t("addChildDialog.step1.genderLabel") || "Gender"}</FieldLabel>
                    <Controller
                      control={childBasicForm.control}
                      name="childGender"
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-3">
                          {["boy", "girl"].map((option) => (
                            <label
                              key={option}
                              className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                                field.value === option
                                  ? option === "boy"
                                    ? "border-sky-500 bg-sky-500/10"
                                    : option === "girl"
                                    ? "border-rose-500 bg-rose-500/10"
                                    : "border-primary bg-primary/10"
                                  : "border-muted hover:border-primary/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="childGender"
                                value={option}
                                checked={field.value === option}
                                onChange={() => field.onChange(option)}
                                className="hidden"
                              />
                              <span className="font-medium capitalize">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {childBasicForm.formState.errors.childGender && (
                      <FieldDescription className="text-red-500">
                        {childBasicForm.formState.errors.childGender.message}
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
                    {t("addChildDialog.buttons.cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {t("addChildDialog.buttons.next")}
                    {isRTL ? (
                      <ChevronLeft className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
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
                  <h3 className="font-medium text-sm mb-1">
                    {t("addChildDialog.step2.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("addChildDialog.step2.description", {
                      name: formData.childBasic.childName || "",
                    })}
                  </p>
                </div>

                <FieldGroup className="space-y-3">
                  {availableThemes.length > 0 ? (
                    availableThemes.map((theme) => {
                      const localizedName = (() => {
                        const translation = theme.translations?.find(
                          (tr: { languageCode: LanguageCode }) =>
                            tr.languageCode === langCode,
                        );
                        return {
                          name: translation?.name || theme.name,
                        };
                      })();
                      return (
                        <div
                          key={theme.id}
                          className="flex items-center space-x-2"
                        >
                          <Controller
                            control={childPreferencesForm.control}
                            name="favoriteThemes"
                            render={({ field }) => (
                              <Checkbox
                                id={`theme-${theme.id}`}
                                checked={
                                  field.value?.includes(theme.id) || false
                                }
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, theme.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== theme.id),
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
                            {localizedName.name}
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("addChildDialog.step2.noThemes")}
                    </p>
                  )}
                </FieldGroup>

                {childPreferencesForm.formState.errors.favoriteThemes && (
                  <FieldDescription className="text-red-500 mt-4">
                    {
                      childPreferencesForm.formState.errors.favoriteThemes
                        .message
                    }
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
                    {isRTL ? (
                      <ChevronRight className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    )}
                    {t("addChildDialog.buttons.previous")}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {t("addChildDialog.buttons.next")}
                    {isRTL ? (
                      <ChevronLeft className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Reading Settings */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={readingSettingsForm.handleSubmit(handleStep3Submit)}
              >
                <div className="mb-4">
                  <h3 className="font-medium text-sm mb-1">
                    {tOnboarding("titleStep3") || "Reading Settings"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tOnboarding("descStep3ReadingSettings") ||
                      "Set up reading goals and preferences"}
                  </p>
                </div>

                <FieldGroup className="space-y-6">
                  {/* Sessions Per Week */}
                  <Field>
                    <FieldLabel htmlFor="sessionsPerWeek">
                      {tOnboarding("sessionsPerWeekLabel", {
                        childName: formData.childBasic.childName,
                      }) || "How often should this child read?"}
                    </FieldLabel>
                    <FieldDescription className="mb-3">
                      {tOnboarding("selectReadingFrequency") ||
                        "Select a reading frequency"}
                    </FieldDescription>
                    <Controller
                      control={readingSettingsForm.control}
                      name="sessionsPerWeek"
                      render={({ field }) => (
                        <div className="grid grid-cols-7 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => field.onChange(day)}
                              className={`p-2 border rounded-lg font-medium text-sm transition-all ${
                                field.value === day
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-muted hover:border-primary/50"
                              }`}
                            >
                              {day}x
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </Field>

                  {/* Enable Reminders Toggle */}
                  <Field>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div>
                        <FieldLabel className="mb-1">
                          {tOnboarding("enableReadingReminders") ||
                            "Enable Reading Reminders"}
                        </FieldLabel>
                        <FieldDescription>
                          {tOnboarding("enableRemindersDescription", {
                            childName: formData.childBasic.childName,
                          }) || "Get notifications for reading sessions"}
                        </FieldDescription>
                      </div>
                      <Controller
                        control={readingSettingsForm.control}
                        name="enableReminders"
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </Field>
                </FieldGroup>

                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isRTL ? (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    )}
                    {tOnboarding("previous") || "Back"}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {tOnboarding("next") || "Next"}
                    {isRTL ? (
                      <ChevronLeft className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h3 className="font-medium text-sm mb-2">
                  {t("addChildDialog.step3.title")}
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 mt-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("addChildDialog.step3.nameLabel")}
                    </p>
                    <p className="font-medium">
                      {formData.childBasic.childName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("addChildDialog.step3.ageGroupLabel")}
                    </p>
                    <p className="font-medium">
                      {(() => {
                        const translation =
                          selectedAgeGroup?.translations?.find(
                            (tr: { languageCode: LanguageCode }) =>
                              tr.languageCode === langCode,
                          );
                        return translation?.name || selectedAgeGroup?.name;
                      })()}{" "}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("addChildDialog.step3.genderLabel") || "Gender"}
                    </p>
                    <p className="font-medium capitalize">
                      {formData.childBasic.childGender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("addChildDialog.step3.favoriteThemesLabel")}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {formData.childPreferences.favoriteThemes?.map(
                        (themeId) => {
                          const theme = availableThemes.find(
                            (t) => t.id === themeId,
                          );
                          const translation = theme?.translations?.find(
                            (tr: { languageCode: LanguageCode }) =>
                              tr.languageCode === langCode,
                          );
                          return (
                            <span
                              key={themeId}
                              className="text-sm bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {translation?.name || theme?.name}
                            </span>
                          );
                        },
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {tOnboarding("readingFrequency") || "Reading Frequency"}
                    </p>
                    <p className="font-medium">
                      {tOnboarding("sessionsPerWeekDisplay", {
                        count: formData.readingSettings.sessionsPerWeek || 3,
                      }) || `${formData.readingSettings.sessionsPerWeek || 3}x per week`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {tOnboarding("readingReminders") || "Reading Reminders"}
                    </p>
                    <p className="font-medium">
                      {formData.readingSettings.enableReminders
                        ? tOnboarding("enabled") || "✓ Enabled"
                        : tOnboarding("disabled") || "Disabled"}
                    </p>
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
                    {isRTL ? (
                      <ChevronRight className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    )}
                    {t("addChildDialog.buttons.previous")}
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading
                      ? t("addChildDialog.step3.creating")
                      : t("addChildDialog.step3.createButton")}
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
      </DialogContent>
    </Dialog>
  );
}
