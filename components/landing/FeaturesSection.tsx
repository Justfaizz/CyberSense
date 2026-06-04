"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PlayIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const ZapIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const TrendIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const UnlockIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const features = [
  {
    Icon: PlayIcon,
    title: "You learn by doing, not watching",
    desc: "CyberSense drops you into realistic scenarios — trolling, masquerading, phishing, denigration — and asks you to make decisions under pressure. No passive videos. No multiple choice. Real choices, real feedback.",
    accent: "var(--neon-purple)",
  },
  {
    Icon: ZapIcon,
    title: "You know if you got it right immediately",
    desc: "After every decision, the platform rates your response and explains why. No waiting for a final score — the lesson lands in the moment you need it most.",
    accent: "var(--neon-blue)",
  },
  {
    Icon: TrendIcon,
    title: "You can see yourself improving",
    desc: "Your dashboard tracks progress across three levels of awareness: spotting threats, understanding their impact, and predicting how they escalate. Watch your skills grow each session.",
    accent: "var(--neon-green)",
  },
  {
    Icon: UnlockIcon,
    title: "No paywall. No institution required.",
    desc: "Commercial security training costs thousands of dollars per seat. CyberSense is completely free for every university student — no licence, no subscription, no catch.",
    accent: "var(--neon-purple)",
  },
];

function FeatureCard({ Icon, title, desc, accent, index }: typeof features[0] & { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div className="feature-icon" style={{ color: accent }}>
        <Icon />
      </div>
      <div className="feature-content">
        <div className="feature-title" style={{ borderBottom: `2px solid ${accent}`, paddingBottom: '0.375rem', marginBottom: '0.625rem', display: 'inline-block' }}>
          {title}
        </div>
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
          transition={{ duration: 0.4 }}
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
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
