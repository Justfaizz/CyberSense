"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: "🎮",
    title: "Learn Through Play, Not Lectures",
    desc: "CyberSense uses gamified, decision-based simulations instead of passive video lectures. You're dropped into realistic cyberbullying scenarios — trolling, flaming, masquerading, denigration, phishing — and must make choices under pressure, just like in real life.",
  },
  {
    icon: "⚡",
    title: "Real-Time Severity Score Feedback",
    desc: "After every decision, the platform instantly rates your response (Low Risk / High Risk) and awards Situation Awareness points. No waiting until the end — you learn the moment you decide.",
  },
  {
    icon: "📊",
    title: "Track Your Situation Awareness (SA)",
    desc: "Your personal dashboard visualises your progress across three SA cognitive levels: Perception (spot the threat), Comprehension (understand its impact), and Projection (predict what happens next). Watch your skills grow in real time.",
  },
  {
    icon: "🆓",
    title: "Free for All University Students",
    desc: "Unlike KnowBe4 ($5,000–$30,000 licence) or Udemy ($54.99–$189.99 per course), CyberSense is completely free. No paywalls, no institutional subscription required. Built specifically for the student digital environment.",
  },
];

function FeatureCard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="feature-icon">{icon}</div>
      <div className="feature-content">
        <div className="feature-title">{title}</div>
        <p className="feature-desc">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px" });

  return (
    <section className="features-section" id="features">
      <div className="landing-section-inner">
        <motion.div
          ref={headerRef}
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-eyebrow">How CyberSense Helps</div>
          <h2 className="section-title">
            Built for the way
            <br />
            students actually learn.
          </h2>
          <p className="section-subtitle">
            Real-world scenario training, instant feedback, and visual progress tracking —
            designed specifically for the threats university students face today.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
