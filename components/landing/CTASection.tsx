"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section className="cta-section">
      <div className="cta-bg-orb" />
      <motion.div
        ref={ref}
        className="cta-container"
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65 }}
      >
        <div className="section-eyebrow">Ready to Start?</div>

        <h2 className="cta-title">
          Ready to make a difference?
          <br />
          <span className="gradient-text">Start here.</span>
        </h2>

        <p className="cta-subtitle">
          Join thousands of students building their cyber awareness skills.
          No paywalls. No corporate jargon. Just real training for real threats.
        </p>

        <div className="cta-actions">
          <Link href="/register" className="btn-cta-primary">
            <i className="fas fa-shield-halved" />
            Sign Up Free
          </Link>
          <Link href="/login" className="btn-cta-secondary">
            Already have an account? Log In
          </Link>
        </div>

        <p className="cta-trust">
          No spam &nbsp;·&nbsp; Your data is private &nbsp;·&nbsp; Free forever for students
        </p>
      </motion.div>
    </section>
  );
}
