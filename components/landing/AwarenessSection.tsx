"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const types = [
  {
    icon: "💬",
    title: "Harassment & Threats",
    desc: "Repeated hostile messages, intimidation, or threats sent via social media, messaging apps, or gaming platforms.",
  },
  {
    icon: "🔓",
    title: "Doxxing",
    desc: "Publicly exposing someone's private information — home address, phone number, or personal data — without consent.",
  },
  {
    icon: "🚫",
    title: "Exclusion & Humiliation",
    desc: "Deliberately excluding someone from group chats, online communities, or using group dynamics to humiliate them.",
  },
  {
    icon: "🎭",
    title: "Impersonation",
    desc: "Creating fake profiles or accounts using someone's identity to damage their reputation or deceive their contacts.",
  },
  {
    icon: "📷",
    title: "Non-Consensual Sharing",
    desc: "Sharing private images, screenshots, or videos of a person without their knowledge or permission.",
  },
];

function AwarenessCard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="awareness-card"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="awareness-icon">{icon}</div>
      <div className="awareness-title">{title}</div>
      <p className="awareness-desc">{desc}</p>
    </motion.div>
  );
}

export default function AwarenessSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px" });

  return (
    <section className="awareness-section" id="awareness">
      <div className="landing-section-inner">
        <motion.div
          ref={headerRef}
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-eyebrow">What is Cyber Bullying?</div>
          <h2 className="section-title">
            It happens at university
            <br />
            more than you think.
          </h2>
          <p className="section-subtitle">
            Many people don&apos;t recognise what they&apos;re experiencing. Cyber bullying
            takes many forms — understanding them is the first step to protecting yourself and others.
          </p>
        </motion.div>

        <div className="awareness-grid">
          {types.map((type, i) => (
            <AwarenessCard key={type.title} {...type} index={i} />
          ))}
        </div>

        <p className="awareness-note">
          💡 If any of this sounds familiar, you&apos;re not alone — and you don&apos;t have to face it without support.
        </p>
      </div>
    </section>
  );
}
