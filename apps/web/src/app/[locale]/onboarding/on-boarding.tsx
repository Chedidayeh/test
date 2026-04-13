/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as PusherPushNotifications from "@pusher/push-notifications-web";
import { useRef, useState, useEffect } from "react";
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
import { AgeGroup, LanguageCode, Theme } from "@readdly/shared-types";
import { useLocale } from "@/src/contexts/LocaleContext";
import { createChildProfileAction } from "@/src/lib/auth-service/server-actions";
import { getLanguageCode } from "@/src/lib/translation-utils";

export default function ParentOnboarding({
  session,
  ageGroups,
}: {
  session: Session;
  ageGroups: AgeGroup[];
}) {
  const user = session!.user;
  const router = useRouter();
  const t = useTranslations("Onboarding");
  const { isRTL, locale } = useLocale();
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const beamsClientRef = useRef<PusherPushNotifications.Client | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Load notification status from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotificationStatus = localStorage.getItem(
        "notificationsEnabled",
      );
      if (savedNotificationStatus === "true") {
        setNotificationsEnabled(true);
        console.log("Notifications enabled from localStorage");
      }
    }
  }, []);

  // Function to initialize Pusher Beams when user clicks the button
  const handleEnableNotifications = async () => {
    setIsEnablingNotifications(true);
    try {
      // Get parent ID from session
      const parentId = session?.user?.id;

      // Register service worker first
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/service-worker.js");
          console.log("Service Worker registered successfully");
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }

      // Wait a moment for service worker to be ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      const beamsClient = new PusherPushNotifications.Client({
        instanceId: `${process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID}`,
      });

      await beamsClient.start();
      // Subscribe to parent's ID so cron job can target this device
      await beamsClient.addDeviceInterest(parentId);
      console.log(
        "Successfully registered and subscribed to parent interest!",
        { parentId },
      );

      // Store the client instance for later cleanup
      beamsClientRef.current = beamsClient;

      // Persist the preference to localStorage
      localStorage.setItem("notificationsEnabled", "true");
      localStorage.setItem("parentId", parentId); // Also store for disable function
      setNotificationsEnabled(true);
      toast.success("Notifications enabled successfully!");
      setShowPermissionsModal(false);
    } catch (error) {
      console.error("Pusher Beams initialization failed:", error);
      toast.error("Failed to enable notifications");
      setNotificationsEnabled(false);
    } finally {
      setIsEnablingNotifications(false);
    }
  };

  const langCode = getLanguageCode(locale);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    childBasic: { childName?: string; childAge?: string; childGender?: string };
    childPreferences: { favoriteThemes?: string[] };
    readingSettings: { sessionsPerWeek?: number; enableReminders?: boolean };
  }>({
    childBasic: {},
    childPreferences: {},
    readingSettings: {},
  });

  // Helper function to get themes for selected age group
  const getThemesForAgeGroup = (ageGroupId: string): Theme[] => {
    const selectedAgeGroup = ageGroups.find((ag) => ag.id === ageGroupId);
    if (!selectedAgeGroup) return [];

    // Extract unique themes from roadmaps
    const themes = selectedAgeGroup.roadmaps.map((roadmap) => roadmap.theme);
    const uniqueThemes = Array.from(
      new Map(themes.map((t) => [t.id, t])).values(),
    );
    return uniqueThemes;
  };

  // Step 1: Child Basic Info
  const childBasicSchema = z.object({
    childName: z.string().min(1, t("childNameRequired")),
    childAge: z
      .string()
      .min(1, t("selectAgeGroup"))
      .refine((v) => ageGroups.some((ag) => ag.id === v), {
        message: t("invalidAgeGroup"),
      }),
    childGender: z
      .string()
      .min(1, t("selectGender") || "Please select a gender"),
  });

  const childBasicForm = useForm({
    resolver: zodResolver(childBasicSchema),
    defaultValues: { childName: "", childAge: "", childGender: "" },
  });

  // Step 2: Child Preferences (Themes)
  const childPreferencesSchema = z.object({
    favoriteThemes: z.array(z.string()).min(1, t("selectAtLeastOneTheme")),
  });

  const childPreferencesForm = useForm({
    resolver: zodResolver(childPreferencesSchema),
    defaultValues: { favoriteThemes: [] },
  });

  // Step 3: Reading Settings
  const readingSettingsSchema = z.object({
    sessionsPerWeek: z.number().min(1, "Select reading frequency").max(7),
    enableReminders: z.boolean(),
  });

  const readingSettingsForm = useForm({
    resolver: zodResolver(readingSettingsSchema),
    defaultValues: { sessionsPerWeek: 3, enableReminders: false },
  });

  // Get themes based on selected age group
  const selectedAgeGroupId = childBasicForm.watch("childAge");
  const availableThemes = selectedAgeGroupId
    ? getThemesForAgeGroup(selectedAgeGroupId)
    : [];

  const onChildBasicSubmit = async (data: any) => {
    setFormData({ ...formData, childBasic: data });
    setStep(2);
  };

  const onChildPreferencesSubmit = async (data: any) => {
    setFormData({ ...formData, childPreferences: data });
    setStep(3);
  };

  const onReadingSettingsSubmit = async (data: any) => {
    setFormData({ ...formData, readingSettings: data });
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      // Validate required data
      if (
        !user.email ||
        !formData.childBasic.childName ||
        !formData.childBasic.childAge ||
        !formData.childBasic.childGender
      ) {
        toast.error(t("missingRequired"));
        setIsLoading(false);
        return;
      }

      // Extract age group ID and theme IDs
      const ageGroupId = formData.childBasic.childAge;
      const themeIds = formData.childPreferences.favoriteThemes || [];
      const sessionsPerWeek = formData.readingSettings.sessionsPerWeek || 3;
      const activateNotifications =
        formData.readingSettings.enableReminders ?? true;

      // Extract roadmap IDs from selected themes
      const selectedAgeGroupData = ageGroups.find((ag) => ag.id === ageGroupId);
      const allocatedRoadmaps =
        selectedAgeGroupData?.roadmaps
          ?.filter((roadmap) => themeIds.includes(roadmap.themeId))
          .map((roadmap) => roadmap.id) || [];

      // Extract the selected age group's name for payload
      const ageGroupName = selectedAgeGroupData?.name || "";

      // Prepare request payload
      const payload = {
        session,
        parentEmail: user.email,
        parentId: user.id,
        name: formData.childBasic.childName,
        gender: formData.childBasic.childGender,
        ageGroupId,
        ageGroupName,
        themeIds,
        allocatedRoadmaps,
        sessionsPerWeek,
        activateNotifications,
      }
      console.log("Creating child profile with payload:", payload);

      const result = await createChildProfileAction(payload);

      if (!result.success) {
        throw new Error(result.error || "Failed to create child profile");
      }

      toast.success(t("childCreated"));

      // Redirect to parent dashboard after a short delay
      router.push("/parent-dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("onboardingError");
      toast.error(message || t("onboardingError"));
      console.error("Onboarding error:", error);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const progressPercentage = ((step - 1) / 3) * 100;

  // Get selected age group for display
  const selectedAgeGroup = ageGroups.find((ag) => ag.id === selectedAgeGroupId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl px-2 sm:px-0">
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
          className="flex flex-col items-center mb-6 sm:mb-8 text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {step === 1 && t("titleStep1")}
            {step === 2 && t("titleStep2")}
            {step === 3 && t("titleStep3")}
            {step === 4 && t("readyToStart")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {step === 1 && t("descStep1")}
            {step === 2 && t("descStep2")}
            {step === 3 && t("descStep3ReadingSettings")}
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
                    <FieldLabel htmlFor="childAge">
                      {t("ageGroupLabel")}
                    </FieldLabel>
                    <Controller
                      control={childBasicForm.control}
                      name="childAge"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={t("ageGroupPlaceholder")}
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
                      <FieldDescription className="text-destructive">
                        {childBasicForm.formState.errors.childAge.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    {/* <FieldLabel>{t("genderLabel")}</FieldLabel> */}
                    <Controller
                      control={childBasicForm.control}
                      name="childGender"
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
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
                              <span className="font-medium text-sm capitalize">
                                {t(`gender.${option}`) || option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {childBasicForm.formState.errors.childGender && (
                      <FieldDescription className="text-destructive">
                        {childBasicForm.formState.errors.childGender.message}
                      </FieldDescription>
                    )}
                  </Field>
                </FieldGroup>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:flex-1"
                    onClick={() => router.push("/")}
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
                    {availableThemes.length > 0 ? (
                      <Controller
                        control={childPreferencesForm.control}
                        name="favoriteThemes"
                        render={({ field }) => (
                          <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {availableThemes.map((theme) => {
                              const checked =
                                Array.isArray(field.value) &&
                                field.value.includes(theme.id);
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
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    id={theme.id}
                                    checked={checked}
                                    onCheckedChange={(val) => {
                                      const next = new Set(field.value || []);
                                      if (val) next.add(theme.id);
                                      else next.delete(theme.id);
                                      field.onChange(Array.from(next));
                                    }}
                                  />
                                  <label
                                    htmlFor={theme.id}
                                    className="cursor-pointer"
                                  >
                                    {localizedName.name}
                                  </label>
                                </div>
                              );
                            })}
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

                  {/* Reading level removed — handled later or by defaults */}
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
                onSubmit={readingSettingsForm.handleSubmit(
                  onReadingSettingsSubmit,
                )}
              >
                <FieldGroup className="space-y-6">
                  {/* Sessions Per Week */}
                  <Field>
                    <FieldLabel htmlFor="sessionsPerWeek">
                      {t("sessionsPerWeekLabel", {
                        childName: formData.childBasic.childName!,
                      })}
                    </FieldLabel>
                    <FieldDescription className="mb-3">
                      {t("selectReadingFrequency")}
                    </FieldDescription>
                    <Controller
                      control={readingSettingsForm.control}
                      name="sessionsPerWeek"
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => field.onChange(day)}
                              className={`p-3 border rounded-lg font-medium transition-all ${
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
                    {readingSettingsForm.formState.errors.sessionsPerWeek && (
                      <FieldDescription className="text-destructive">
                        {
                          readingSettingsForm.formState.errors.sessionsPerWeek
                            .message
                        }
                      </FieldDescription>
                    )}
                  </Field>

                  {/* Enable Reminders Toggle */}
                  <Field>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div>
                        <FieldLabel className="mb-1">
                          {t("enableReadingReminders")}
                        </FieldLabel>
                        <FieldDescription>
                          {t("enableRemindersDescription", {
                            childName: formData.childBasic.childName!,
                          })}
                        </FieldDescription>
                      </div>
                      <Controller
                        control={readingSettingsForm.control}
                        name="enableReminders"
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => {
                              if (!field.value) {
                                // When toggling ON, show permissions modal
                                field.onChange(true);
                                setShowPermissionsModal(true);
                              } else {
                                // When toggling OFF, just turn it off
                                field.onChange(false);
                              }
                            }}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                              field.value ? "bg-primary" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                field.value ? "translate-x-7" : "translate-x-1"
                              }`}
                            />
                          </button>
                        )}
                      />
                    </div>
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
                    )}
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
                className="text-center space-y-4"
              >
                <h2 className="text-2xl font-medium mb-2">{t("titleStep3")}</h2>
                <p className="text-muted-foreground mb-4">{t("descStep3")}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("childNameLabel")}
                    </p>
                    <p className="font-medium text-foreground">
                      {formData.childBasic.childName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ageGroupLabel")}
                    </p>
                    <p className="font-medium text-foreground">
                      {selectedAgeGroup?.name || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("genderLabel") || "Gender"}
                    </p>
                    <p className="font-medium text-foreground capitalize">
                      {t(`gender.${formData.childBasic.childGender}`) ||
                        formData.childBasic.childGender}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("readingFrequency")}
                    </p>
                    <p className="font-medium text-foreground">
                      {t("sessionsPerWeekDisplay", {
                        count: formData.readingSettings.sessionsPerWeek!,
                      })}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {t("readingReminders")}
                    </p>
                    <p className="font-medium text-foreground">
                      {formData.readingSettings.enableReminders
                        ? t("enabled")
                        : t("disabled")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
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
                    type="submit"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="w-full sm:flex-1"
                  >
                    {isLoading ? t("settingUp") : t("startExploring")}
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

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-sm w-full p-6"
          >
            <h2 className="text-xl font-medium mb-3 text-foreground">
              {t("enableNotificationsTitle") || "Enable Notifications"}
            </h2>
            {/* <p className="text-sm text-muted-foreground mb-4">
              {t("enableNotificationsDescription") ||
                "Allow us to send you reminders about your child's reading sessions so you stay informed and can encourage them to read regularly."}
            </p> */}

            {/* Instructions for browser notification permission */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {t("browserPermissionSteps") || "How to enable notifications:"}
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>{t("step1BrowserPrompt") || "Click the button below"}</li>
                <li>{t("step2AcceptPrompt") || "Your browser will ask you to allow notifications"}</li>
                <li>{t("step3ClickAllow") || "Click 'Allow' in the browser popup"}</li>
                <li>
                  {t("step4IfNoPopup") ||
                    "If no popup appears, go to your browser settings and allow notifications for this site"}
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleEnableNotifications}
                disabled={isEnablingNotifications}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isEnablingNotifications ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    {t("enabling") || "Enabling..."}
                  </>
                ) : (
                  t("allowNotifications") || "Allow Notifications"
                )}
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => setShowPermissionsModal(false)}
                className="w-full"
              >
                {t("notNow") || "Not Now"}
              </Button> */}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
