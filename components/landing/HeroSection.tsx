"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
            Start Learning Free
            <i className="fas fa-arrow-right" />
          </Link>
          <a href="#awareness" className="btn-hero-secondary">
            See How It Works
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
        transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
      >
        <div className="hero-scene">
          <svg viewBox="0 0 420 360" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Glow orbs */}
            <ellipse cx="210" cy="310" rx="130" ry="28" fill="rgba(196,144,228,0.08)" />
            <circle cx="210" cy="200" r="110" fill="rgba(13,2,18,0.01)" />

            {/* Shield — protection symbol */}
            <path d="M210 80 L258 100 L258 148 C258 178 237 202 210 212 C183 202 162 178 162 148 L162 100 Z"
              fill="rgba(196,144,228,0.08)" stroke="rgba(196,144,228,0.45)" strokeWidth="1.5" />
            <path d="M210 96 L248 113 L248 148 C248 172 231 193 210 201 C189 193 172 172 172 148 L172 113 Z"
              fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.3)" strokeWidth="1" strokeDasharray="4 3" />
            <path d="M200 148 L208 156 L222 138" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Student figure */}
            <circle cx="210" cy="240" r="18" fill="rgba(196,144,228,0.15)" stroke="rgba(196,144,228,0.5)" strokeWidth="1.5" />
            <text x="210" y="246" textAnchor="middle" fontSize="14" fill="rgba(196,144,228,0.9)">👤</text>
            <line x1="210" y1="258" x2="210" y2="300" stroke="rgba(196,144,228,0.3)" strokeWidth="1.5" />
            <line x1="210" y1="270" x2="192" y2="285" stroke="rgba(196,144,228,0.3)" strokeWidth="1.5" />
            <line x1="210" y1="270" x2="228" y2="285" stroke="rgba(196,144,228,0.3)" strokeWidth="1.5" />
            <line x1="210" y1="300" x2="196" y2="320" stroke="rgba(196,144,228,0.3)" strokeWidth="1.5" />
            <line x1="210" y1="300" x2="224" y2="320" stroke="rgba(196,144,228,0.3)" strokeWidth="1.5" />

            {/* Threat bubble — left (harassment) */}
            <rect x="28" y="155" width="130" height="52" rx="12" fill="rgba(255,77,77,0.07)" stroke="rgba(255,77,77,0.3)" strokeWidth="1" />
            <polygon points="148,178 162,178 155,192" fill="rgba(255,77,77,0.07)" stroke="rgba(255,77,77,0.3)" strokeWidth="1" />
            <text x="93" y="176" textAnchor="middle" fontSize="9" fill="rgba(255,150,150,0.8)" fontFamily="Montserrat,sans-serif">&quot;Nobody likes you here&quot;</text>
            <text x="93" y="192" textAnchor="middle" fontSize="8" fill="rgba(255,100,100,0.5)" fontFamily="Montserrat,sans-serif">Harassment · Denigration</text>
            <circle cx="42" cy="150" r="7" fill="rgba(255,77,77,0.15)" stroke="rgba(255,77,77,0.4)" strokeWidth="1" />
            <text x="42" y="154" textAnchor="middle" fontSize="8" fill="rgba(255,120,120,0.9)">!</text>

            {/* Threat bubble — right (impersonation) */}
            <rect x="262" y="140" width="130" height="52" rx="12" fill="rgba(255,170,0,0.06)" stroke="rgba(255,170,0,0.28)" strokeWidth="1" />
            <polygon points="272,162 258,162 265,176" fill="rgba(255,170,0,0.06)" stroke="rgba(255,170,0,0.28)" strokeWidth="1" />
            <text x="327" y="161" textAnchor="middle" fontSize="9" fill="rgba(255,200,80,0.85)" fontFamily="Montserrat,sans-serif">Fake profile created</text>
            <text x="327" y="177" textAnchor="middle" fontSize="8" fill="rgba(255,170,50,0.55)" fontFamily="Montserrat,sans-serif">Masquerading · Identity Theft</text>
            <circle cx="378" cy="135" r="7" fill="rgba(255,170,0,0.12)" stroke="rgba(255,170,0,0.35)" strokeWidth="1" />
            <text x="378" y="139" textAnchor="middle" fontSize="8" fill="rgba(255,200,80,0.9)">!</text>

            {/* Bottom bubble — phishing */}
            <rect x="105" y="315" width="118" height="36" rx="10" fill="rgba(0,240,255,0.05)" stroke="rgba(0,240,255,0.22)" strokeWidth="1" />
            <text x="164" y="330" textAnchor="middle" fontSize="8.5" fill="rgba(0,240,255,0.75)" fontFamily="Montserrat,sans-serif">Suspicious link received</text>
            <text x="164" y="344" textAnchor="middle" fontSize="7.5" fill="rgba(0,200,220,0.45)" fontFamily="Montserrat,sans-serif">Phishing · Account Takeover</text>

            {/* Connection lines — threat to person */}
            <line x1="158" y1="182" x2="192" y2="248" stroke="rgba(255,77,77,0.18)" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="262" y1="168" x2="228" y2="245" stroke="rgba(255,170,0,0.16)" strokeWidth="1" strokeDasharray="4 3" />

            {/* Awareness glow ring */}
            <circle cx="210" cy="240" r="34" fill="none" stroke="rgba(0,230,118,0.12)" strokeWidth="8" />
            <circle cx="210" cy="240" r="34" fill="none" stroke="rgba(0,230,118,0.25)" strokeWidth="1.5" strokeDasharray="6 4" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
