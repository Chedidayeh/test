"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLoginModal } from "@/src/providers/login-provider";
import { Button } from "../ui/button";
import { FlipWords } from "../ui/flip-words";

export default function Hero() {
  const words = ["Think", "Imagine", "Explore", "Learn"];

  const { data: session } = useSession();
  const router = useRouter();
  const loginModal = useLoginModal();

  return (
    <div>
      {/* Hero Content */}
      <div className="text-center max-w-4xl mx-auto">
        {/* Main Headline */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            Stories That Make Your Child <br/>
            <FlipWords words={words} />
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 drop-shadow-md font-medium">
            Journey through magical tales and solve mind-bending riddles
          </p>
          <p className="text-sm sm:text-base text-gray-200 drop-shadow-md max-w-2xl mx-auto">
            Perfect for young readers (6-14 years old) • Build reading skills •
            Develop critical thinking
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 sm:pt-20">
          <Button
            className="px-8 py-3 sm:py-4"
            onClick={() => {
              if (session?.user) {
                router.push("/onboarding");
              } else {
                loginModal.open();
              }
            }}
          >
            Start Your child Adventure
          </Button>
          {/* <Button
            variant={"outline"}
            className="px-8 py-3 sm:py-4"
            onClick={() => {
              window.location.href = "#about";
            }}
          >
            Learn More
          </Button> */}
        </div>

        {/* Trust Badge */}
        <div className="mt-10 sm:mt-20">
          <p className="text-gray-200 text-sm drop-shadow-md">
            ✨ Trusted by parents and educators • Safe & educational •
            AI-powered learning
          </p>
        </div>
      </div>
    </div>
  );
}
