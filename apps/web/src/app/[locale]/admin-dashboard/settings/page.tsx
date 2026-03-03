"use client";

import { useState } from "react";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    appVersion: "1.0.0",
    enableAIHints: true,
    enableDifficultyAdaptation: true,
    enableAnalytics: true,
    maxHintLevels: 3,
    maxAttemptsPerRiddle: 5,
    emailNotificationEnabled: true,
    weeklyReportEnabled: true,
    apiRateLimit: 1000,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold ">Settings</h1>
        <p className="text-slate-500 mt-1">Manage system configuration and preferences</p>
      </div>

      {/* Feature Flags */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold  mb-4">Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="">AI-Generated Hints</Label>
              <p className="text-sm text-slate-500 mt-1">
                Enable AI to generate contextual hints for riddles
              </p>
            </div>
            <Switch
              checked={settings.enableAIHints}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableAIHints: checked })
              }
            />
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <div>
              <Label className="">Difficulty Adaptation</Label>
              <p className="text-sm text-slate-500 mt-1">
                Automatically adjust difficulty based on child performance
              </p>
            </div>
            <Switch
              checked={settings.enableDifficultyAdaptation}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableDifficultyAdaptation: checked })
              }
            />
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <div>
              <Label className="">Analytics Tracking</Label>
              <p className="text-sm text-slate-500 mt-1">
                Track user behavior and generate insights
              </p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableAnalytics: checked })
              }
            />
          </div>
        </div>
      </Card>

      {/* Game Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold  mb-4">Game Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hints">Max Hint Levels</Label>
            <Input
              id="hints"
              type="number"
              min="1"
              max="5"
              value={settings.maxHintLevels}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxHintLevels: parseInt(e.target.value),
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="attempts">Max Attempts Per Riddle</Label>
            <Input
              id="attempts"
              type="number"
              min="1"
              max="10"
              value={settings.maxAttemptsPerRiddle}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxAttemptsPerRiddle: parseInt(e.target.value),
                })
              }
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold  mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="">Email Notifications</Label>
              <p className="text-sm text-slate-500 mt-1">
                Send email updates to parents about child progress
              </p>
            </div>
            <Switch
              checked={settings.emailNotificationEnabled}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  emailNotificationEnabled: checked,
                })
              }
            />
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <div>
              <Label className="">Weekly Reports</Label>
              <p className="text-sm text-slate-500 mt-1">
                Generate and send weekly progress reports
              </p>
            </div>
            <Switch
              checked={settings.weeklyReportEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, weeklyReportEnabled: checked })
              }
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
