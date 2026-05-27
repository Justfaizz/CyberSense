"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface StatItemProps {
  display: string;
  numericEnd?: number;
  suffix?: string;
  label: string;
  source?: string;
}

function AnimatedStat({ display, numericEnd, suffix = "", label, source }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!inView || !numericEnd || started) return;
    setStarted(true);
    const duration = 1800;
    const steps = 60;
    const increment = numericEnd / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericEnd) {
        setCount(numericEnd);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, numericEnd, started]);

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-value">
        {numericEnd !== undefined ? `${count}${suffix}` : display}
      </div>
      <div className="stat-label">{label}</div>
      {source && <div className="stat-source">{source}</div>}
    </div>
  );
}

const stats: StatItemProps[] = [
  {
    display: "59%",
    numericEnd: 59,
    suffix: "%",
    label: "of teens have been bullied or harassed online",
    source: "Pew Research Center",
  },
  {
    display: "1 in 5",
    label: "university students report experiencing cyber harassment",
  },
  {
    display: "20%",
    numericEnd: 20,
    suffix: "%",
    label: "of victims ever report it to authorities",
  },
  {
    display: "2×",
    label: "more likely to suffer depression — cyber bullying victims vs non-victims",
  },
];

export default function StatsStrip() {
  return (
    <section className="stats-strip">
      <div className="stats-container">
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
