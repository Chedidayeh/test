import { motion } from "motion/react";

export default function RoadmapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">

      <div className="container">{children}</div>
    </div>
  );
}
