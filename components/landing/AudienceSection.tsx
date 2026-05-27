"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const audiences = [
  {
    emoji: "🎓",
    title: "University Students",
    desc: "Whether you've experienced it, witnessed it, or just want to be prepared — CyberSense gives you the tools to recognise, respond to, and prevent cyberbullying in your digital environment.",
    list: [
      "Students experiencing online harassment or threats",
      "Bystanders who want to help but don't know how",
      "Anyone wanting to strengthen their digital safety skills",
      "Students concerned about their online reputation",
    ],
  },
  {
    emoji: "🌐",
    title: "Everyone",
    desc: "Cyber bullying doesn't stop at the campus boundary. Parents, educators, mental health advocates, and digital safety researchers can all benefit from understanding how these threats work.",
    list: [
      "Parents concerned about their child's online safety",
      "Educators and university counsellors",
      "Mental health advocates supporting victims",
      "Digital safety researchers and policy makers",
    ],
  },
];

function AudienceCard({
  emoji, title, desc, list, index,
}: {
  emoji: string;
  title: string;
  desc: string;
  list: string[];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="audience-card"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12 }}
    >
      <span className="audience-emoji">{emoji}</span>
      <h3 className="audience-title">{title}</h3>
      <p className="audience-desc">{desc}</p>
      <ul className="audience-list">
        {list.map((item) => (
          <li key={item}>
            <span className="list-arrow">→</span>
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function AudienceSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px" });

  return (
    <section className="audience-section" id="who">
      <div className="landing-section-inner">
        <motion.div
          ref={headerRef}
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-eyebrow">Who Is This For?</div>
          <h2 className="section-title">
            If you live online,
            <br />
            this is for you.
          </h2>
          <p className="section-subtitle">
            CyberSense was built with university students at its core, but the skills you gain
            extend far beyond the campus network.
          </p>
        </motion.div>

        <div className="audience-grid">
          {audiences.map((audience, i) => (
            <AudienceCard key={audience.title} {...audience} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.3 }}
          style={{ textAlign: "center", marginTop: "2.5rem" }}
        >
          <Link href="/register" className="btn-hero-primary" style={{ display: "inline-flex" }}>
            Join CyberSense Today
            <i className="fas fa-arrow-right" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
