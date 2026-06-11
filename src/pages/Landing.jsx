import React, { useState } from "react";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import LogosBar from "@/components/sections/LogosBar";
import ProblemSection from "@/components/sections/ProblemSection";
import AssistantSection from "@/components/sections/AssistantSection";
import HowItWorks from "@/components/sections/HowItWorks";
import BenefitsCarousel from "@/components/sections/BenefitsCarousel";
import ComparisonTable from "@/components/sections/ComparisonTable";
import StatsBar from "@/components/sections/StatsBar";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import AuthModal from "@/components/AuthModal";

const Landing = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // "signin" or "signup"

  const triggerAuth = (mode = "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <main className="overflow-hidden bg-white">
      <Navbar 
        onCtaClick={() => triggerAuth("signup")} 
        onLoginClick={() => triggerAuth("signin")} 
      />
      <Hero onCtaClick={() => triggerAuth("signup")} />
      <LogosBar />
      <ProblemSection />
      <AssistantSection />
      <HowItWorks />
      <BenefitsCarousel />
      <ComparisonTable />
      <StatsBar />
      <PricingSection onChoose={() => triggerAuth("signup")} />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA
        onCtaClick={() => triggerAuth("signup")}
        onDemoClick={() => triggerAuth("signup")}
      />
      <Footer />

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </main>
  );
};

export default Landing;

