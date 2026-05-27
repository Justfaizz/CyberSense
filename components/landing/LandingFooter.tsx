import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="nav-logo" style={{ marginBottom: "0.875rem", display: "inline-flex" }}>
              <span className="logo-icon">⚡</span>
              <span className="logo-text">CyberSense</span>
            </Link>
            <p className="footer-tagline">
              A gamified cybersecurity awareness platform built for university students.
              Train smarter. Stay safer. Protect others.
            </p>
            <div className="footer-social">
              <a
                href="https://www.linkedin.com/in/muhammad-faiz-3b8b87277/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in" />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="#" className="social-link" aria-label="X / Twitter">
                <i className="fab fa-x-twitter" />
              </a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Platform</div>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#awareness">Awareness</a></li>
              <li><a href="#stories">Stories</a></li>
              <li><Link href="/register">Get Started</Link></li>
              <li><Link href="/login">Log In</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Resources</div>
            <ul className="footer-links">
              <li><a href="#">About CyberSense</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Report Abuse</a></li>
              <li><a href="#">For Educators</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Legal</div>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Data Protection</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-crisis">
          <strong>Need immediate help?</strong> If you are in crisis or need urgent support,
          please contact{" "}
          <strong>Befrienders Malaysia: 03-7956 8145</strong> or your university&apos;s student
          counselling service. You are not alone.
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} CyberSense. All rights reserved. Built for university students.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
