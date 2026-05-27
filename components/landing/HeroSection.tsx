"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const barItems = [
  { label: "Perception", value: 90 },
  { label: "Comprehension", value: 75 },
  { label: "Projection", value: 85 },
];

export default function HeroSection() {
  return (
    <section className="hero-section">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <div className="hero-badge">
          <span className="badge-dot" />
          Free for all university students
        </div>

        <h1 className="hero-title">
          One in three students
          <br />
          <span className="gradient-text">experiences cyber bullying.</span>
          <br />
          Let&apos;s change that.
        </h1>

        <p className="hero-subtitle">
          CyberSense is a gamified awareness platform built for university
          students. Learn to identify, understand, and prevent cyber bullying
          through realistic simulations — not boring lectures.
        </p>

        <div className="hero-ctas">
          <Link href="/register" className="btn-hero-primary">
            Get Started — It&apos;s Free
            <i className="fas fa-arrow-right" />
          </Link>
          <a href="#awareness" className="btn-hero-secondary">
            Learn More
            <i className="fas fa-chevron-down" />
          </a>
        </div>

        <div className="hero-trust">
          <span>✓ No spam</span>
          <span>✓ Free forever</span>
          <span>✓ No credit card needed</span>
        </div>
      </motion.div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
      >
        <div className="hero-device">
          <div className="device-screen">
            <div className="screen-header">
              <span className="screen-dot red" />
              <span className="screen-dot yellow" />
              <span className="screen-dot green" />
              <span className="screen-title">CyberSense Platform</span>
            </div>

            <div className="screen-score-badge">
              <div className="score-label">Situation Awareness Score</div>
              <div className="score-value">
                87<span>%</span>
              </div>
              <div className="score-level">Advanced Level</div>
            </div>

            <div className="screen-bars">
              {barItems.map((item) => (
                <div key={item.label} className="screen-bar-item">
                  <span>{item.label}</span>
                  <div className="screen-bar">
                    <div
                      className="screen-bar-fill"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>

            <div className="screen-modules">
              <span className="module-pill active">Module 1 ✓</span>
              <span className="module-pill active">Module 2 ✓</span>
              <span className="module-pill">Module 3</span>
              <span className="module-pill">Module 4</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
