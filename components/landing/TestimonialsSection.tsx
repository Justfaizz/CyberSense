"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    initial: "A",
    quote:
      "Someone created a fake profile using my name and photos and started messaging my classmates. I had no idea that was even a cybersecurity threat — I thought it was just drama. CyberSense taught me it's called masquerading, and now I know exactly how to respond.",
    name: "Anonymous Student",
    role: "2nd Year, Business Administration",
  },
  {
    initial: "A",
    quote:
      "I kept clicking links my gaming friends sent me. After going through the phishing module on CyberSense, I realised how close I was to having my university account compromised. The severity rating hit me hard — in the best way.",
    name: "Anonymous Student",
    role: "3rd Year, Computer Science",
  },
  {
    initial: "A",
    quote:
      "A junior in my faculty was being flamed in a group chat. Before CyberSense, I wouldn't have known what to do. Now I could predict how it would escalate and I reported it to the admin before it got worse.",
    name: "Anonymous Student",
    role: "Final Year, Psychology",
  },
];

function TestimonialCard({ initial, quote, name, role, index }: typeof testimonials[0] & { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="testimonial-card"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="quote-mark">&ldquo;</div>
      <p className="testimonial-text">{quote}</p>
      <div className="testimonial-author">
        <div className="author-avatar">
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, color: 'var(--neon-purple)', fontSize: '1rem' }}>
            {initial}
          </span>
        </div>
        <div>
          <div className="author-name">{name}</div>
          <div className="author-role">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px" });

  return (
    <section className="testimonials-section" id="stories">
      <div className="landing-section-inner">
        <motion.div
          ref={headerRef}
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="section-eyebrow">Real Stories</div>
          <h2 className="section-title">
            Students just like you
            <br />
            are already trained.
          </h2>
          <p className="section-subtitle">
            Every one of these scenarios is real. The names are anonymous. The impact was not.
          </p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
