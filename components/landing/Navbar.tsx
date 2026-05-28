"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`landing-nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <img src="/logo.png" alt="CyberSense" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        <div className={`nav-links${menuOpen ? " open" : ""}`}>
          <a href="#awareness" className="nav-link" onClick={() => setMenuOpen(false)}>Awareness</a>
          <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#stories" className="nav-link" onClick={() => setMenuOpen(false)}>Stories</a>
          <a href="#who" className="nav-link" onClick={() => setMenuOpen(false)}>Who It&apos;s For</a>
        </div>

        <div className="nav-actions">
          <Link href="/login" className="btn-ghost">Log In</Link>
          <Link href="/register" className="btn-primary-sm">Get Started</Link>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
