"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { StoryForm } from "../_components/StoryForm";

export default function NewStoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Story created successfully");
      router.push("/admin-dashboard/stories");
    } catch (error) {
      toast.error("Failed to create story");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col  gap-4">
        <Link href="/admin-dashboard/stories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold ">Create New Story</h1>
          <p className="text-slate-500 mt-1">
            Add a new story to the platform
          </p>
        </div>
      </div>

      {/* Form */}
      <StoryForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
