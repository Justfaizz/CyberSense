import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import "./landing.css";

// Below-fold sections loaded lazily — they don't block the initial render
const StatsStrip = dynamic(() => import("@/components/landing/StatsStrip"));
const AwarenessSection = dynamic(() => import("@/components/landing/AwarenessSection"));
const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection"));
const TestimonialsSection = dynamic(() => import("@/components/landing/TestimonialsSection"));
const AudienceSection = dynamic(() => import("@/components/landing/AudienceSection"));
const CTASection = dynamic(() => import("@/components/landing/CTASection"));
const LandingFooter = dynamic(() => import("@/components/landing/LandingFooter"));

export const metadata = {
  title: "CyberSense — Gamified Cyberbullying Awareness Training",
  description:
    "A free gamified cybersecurity awareness platform for university students. Learn to identify, understand, and prevent cyberbullying through realistic decision-based simulations.",
  openGraph: {
    title: "CyberSense — Gamified Cyberbullying Awareness Training",
    description:
      "Free, gamified, built for students. Train your Situation Awareness against cyber bullying — no paywalls, no lectures.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <main className="landing-page">
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <AwarenessSection />
      <FeaturesSection />
      <TestimonialsSection />
      <AudienceSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
