import { Metadata } from "next";
import ParentDashboardInteractive from "./_components/ParentDashboardInteractive";

export const metadata: Metadata = {
  title: "Parent Dashboard - Readly",
  description:
    "Monitor your children's reading progress, view achievements, and get AI-powered insights about their learning journey.",
};

export default function ParentDashboardPage() {
  return (
      <div className="min-h-screen p-4 ">
      <ParentDashboardInteractive />;
    </div>
  );
}
