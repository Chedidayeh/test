"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "../ui/button";
import { signOut } from "next-auth/react";
import { LogOut, User, Settings, Layout, Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { Session } from "next-auth";
import Link from "next/link";
import { RoleType } from "@shared/types";

export default function Profile({ session }: { session: Session }) {
  const [closeDialog, setCloseDialog] = React.useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations("Profile");

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirect: true, callbackUrl: "/" });
      toast.success(t("loggedOut"));
    } catch (err) {
      setIsLoggingOut(false);
      toast.error(t("logoutError") ?? "Failed to log out");
    }
  };

  return (
    <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
      <DialogTrigger asChild>
        <div className="w-9 h-9 cursor-pointer rounded-full border border-black/30 flex items-center justify-center bg-primary text-white text-lg">
          {session?.user?.name?.charAt(0).toUpperCase()}
        </div>
      </DialogTrigger>
      <DialogTitle></DialogTitle>

      <DialogContent showCloseButton={false}>
        <div className="flex h-full gap-4">
          {/* Sidebar */}
          <div className="w-48 bg-card rounded-lg p-4 border border-primary/20">
            <div className="mb-6 flex flex-col items-center">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border flex items-center justify-center text-white bg-primary text-lg">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  activeTab === "profile"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 bg-background/30 hover:bg-primary hover:text-white dark:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t("profile")}</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  activeTab === "settings"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 bg-background/30 hover:bg-primary hover:text-white dark:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{t("settings")}</span>
              </button>
              {session?.user?.role === RoleType.ADMIN && (
                <Link href="/admin-dashboard">
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      activeTab === "settings"
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 bg-background/30 hover:bg-primary hover:text-white dark:text-white"
                    }`}
                  >
                    <Layout className="w-4 h-4" />
                    <span>{t("dashboard")}</span>
                  </button>
                </Link>
              )}
            </nav>

            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={handleLogout}
                variant="destructive"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium mb-4">
                    {t("profileInformation")}
                  </h2>
                  <div className="bg-card rounded-lg border border-primary/20 p-4 space-y-5">
                    {/* Name */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {t("fullName")}
                        </label>
                        <p className="text-base ">{session?.user?.name}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {t("emailAddress")}
                        </label>
                        <p className="text-base ">{session?.user?.email}</p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-center justify-between  border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {t("accountType")}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-3 py-1 rounded-full text-xs bg-primary text-white">
                            {session?.user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                {/* <div className="flex gap-2">
                  <Button size={"sm"}>Edit Profile</Button>
                  <Button size={"sm"} variant="outline">
                    Change Password
                  </Button>
                </div> */}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium mb-4">{t("settings")}</h2>

                  {/* Notification Settings */}
                  <div className="bg-card rounded-lg border border-primary/20 p-6 space-y-4 mb-6">
                    <h3 className="">{t("notificationPreferences")}</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox defaultChecked className="w-4 h-4" />
                        <span className="text-sm text-gray-500">
                          {t("emailNotifications")}
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox defaultChecked className="w-4 h-4" />

                        <span className="text-sm text-gray-500">
                          {t("learningProgressUpdates")}
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox defaultChecked className="w-4 h-4" />

                        <span className="text-sm text-gray-500">
                          {t("weeklySummary")}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <h3 className="text-red-900 mb-4">{t("dangerZone")}</h3>
                    <Button variant="destructive">{t("deleteAccount")}</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
