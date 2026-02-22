/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  CircleCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field";

// Avatar options for child to choose from
const avatarOptions = [
  { id: "bun-bun", name: "Bun-Bun", image: "/child-avatars/Bun-Bun.png" },
  { id: "ellie", name: "Ellie", image: "/child-avatars/Ellie.png" },
  { id: "foxy", name: "Foxy", image: "/child-avatars/Foxy.png" },
  { id: "guacky", name: "Guacky", image: "/child-avatars/Guacky.png" },
  { id: "hammie", name: "Hammie", image: "/child-avatars/Hammie.png" },
  { id: "kitty", name: "Kitty", image: "/child-avatars/Kitty.png" },
  { id: "pandy", name: "Pandy", image: "/child-avatars/Pandy.png" },
  { id: "puppy", name: "Puppy", image: "/child-avatars/Puppy.png" },
  { id: "teddy", name: "Teddy", image: "/child-avatars/Teddy.png" },
  { id: "tiggy", name: "Tiggy", image: "/child-avatars/Tiggy.png" },
  { id: "wingy", name: "Wingy", image: "/child-avatars/Wingy.png" },
  { id: "woofy", name: "Woofy", image: "/child-avatars/Woofy.png" },
];

export default function StorySetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const onNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNicknameError("");

    if (!nickname.trim()) {
      setNicknameError("Please enter a nickname");
      return;
    }

    if (nickname.length < 2) {
      setNicknameError("Nickname must be at least 2 characters");
      return;
    }

    if (nickname.length > 20) {
      setNicknameError("Nickname must be less than 20 characters");
      return;
    }

    setStep(2);
  };

  const onAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Send story setup data to API endpoint
      console.log("Story setup data:", { nickname, selectedAvatar });
      toast.success("All set! Let's start the story!");
      router.push("/story-reading-interface"); // TODO: Redirect to story reading interface with selected avatar and nickname as query params or state
      // Redirect to story reading interface
    } catch {
      toast.error("An error occurred while starting the story");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const progressPercentage = ((step - 1) / 2) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-7xl">
        {/* Back Button */}

        {/* Header with Animation */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center mb-8 text-center"
        >
          <h1 className="text-5xl font-bold mb-2">
            {step === 1 && "Your Story Adventure Awaits!"}
            {step === 2 && "Pick Your Character"}
            {step === 3 && "All Set, " + nickname + "!"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {step === 1 &&
              "Let's get started by creating your adventure nickname."}
            {step === 2 && "Choose a character to represent you in this story."}
            {step === 3 && "You're ready to start your epic reading adventure!"}
          </p>
        </motion.div>

        {/* Form Content */}
        <div className="">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                className=" "
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={onNicknameSubmit}
              >
                <FieldGroup className="space-y-6 flex items-center justify-center w-full">
                  <Field className="w-full max-w-2xl">
                    <input
                      id="nickname"
                      type="text"
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value);
                        setNicknameError("");
                      }}
                      placeholder="e.g., BraveHeart, MysticSeeker"
                      className="h-20 text-2xl px-6 dark:bg-input/30 py-4 rounded-2xl border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 w-full"
                    />
                    {nicknameError && (
                      <FieldDescription className="text-destructive mt-2 text-base">
                        {nicknameError}
                      </FieldDescription>
                    )}
                  </Field>
                </FieldGroup>

                <div className="flex gap-3 mt-8 max-w-2xl mx-auto w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {avatarOptions.map((avatar) => (
                      <motion.div
                        key={avatar.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAvatarSelect(avatar.id)}
                        className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-200`}
                      >
                        <div
                          className={`relative w-40 h-40 rounded-full overflow-hidden ${
                            selectedAvatar === avatar.id
                              ? "ring-4 ring-primary"
                              : ""
                          }`}
                        >
                          <img
                            src={avatar.image}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <p className="font-medium text-center">{avatar.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-8 max-w-2xl mx-auto w-full">
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
                    type="button"
                    className="flex-1"
                    disabled={!selectedAvatar}
                    onClick={() => setStep(3)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <Card className="bg-primary/5 border-primary/20 mb-6 max-w-sm mx-auto">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex flex-col items-center">
                      <div
                        className={`relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-primary`}
                      >
                        <img
                          src={
                            avatarOptions.find((a) => a.id === selectedAvatar)
                              ?.image
                          }
                          alt={
                            avatarOptions.find((a) => a.id === selectedAvatar)
                              ?.name
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xl font-semibold mt-1">{nickname}</p>
                      <p className="text-muted-foreground">
                        the{" "}
                        {
                          avatarOptions.find((a) => a.id === selectedAvatar)
                            ?.name
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 mt-8 max-w-2xl mx-auto w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Starting..." : "Start Story"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step counter */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Step {step} of 3
        </p>
      </div>
    </div>
  );
}
