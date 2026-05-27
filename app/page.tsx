import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsStrip from "@/components/landing/StatsStrip";
import AwarenessSection from "@/components/landing/AwarenessSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import AudienceSection from "@/components/landing/AudienceSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import "./landing.css";

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
