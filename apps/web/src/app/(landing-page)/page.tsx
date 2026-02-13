"use client";

import { About } from "@/src/components/landing/about";
import { FAQ } from "@/src/components/landing/FAQ";
import Hero from "@/src/components/landing/hero";
import { HowItWorks } from "@/src/components/landing/HowItWorks";
import { Pricing } from "@/src/components/landing/Pricing";
import { useView } from "@/src/hooks/use-inViews";

const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const [ref, isInView] = useView({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </div>
  );
};

export default function Home() {
  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center ">
        <div
          className=" fixed inset-0 h-screen bg-cover bg-center bg-no-repeat -z-20 pointer-events-none"
          style={{ backgroundImage: "url('/landing-page/bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/60 to-black/80" />
        </div>

        <Hero />
      </div>
      {/* sections */}
      <div className="w-full">
        <section id="how-it-works" className="py-8">
          <HowItWorks />
        </section>

        <section id="pricing" className="py-8">
          <Pricing />
        </section>

        <section id="about" className="py-8">
          <About />
        </section>

        <section id="faq" className="py-8">
          <FAQ />
        </section>
      </div>
    </div>
  );
}
