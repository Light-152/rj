import type { ReactNode } from "react";
import Link from "next/link";
import { UserRound, Search, MapPin } from "lucide-react";
import { SiteFooter } from "@/components/sites/patrickreddington-com-0cba0a2c/root-8a5edab2/PatrickReddingtonHome";
import styles from "./page.module.css";



const navItems = [
  "Wealth Management",
  "Corporations & Institutions",
  "Commentary & Insights",
  "Advisor Opportunities",
  "More...",
];

const socialLinks = [
  { label: "twitter", text: "X" },
  { label: "facebook", text: "f" },
  { label: "linkedin", text: "in" },
  { label: "instagram", text: "ig" },
  { label: "youtube", text: "yt" },
];

const footerNavLinks = ["About Us", "Careers", "Investor Relations", "News & Media", "Contact Us"];
const footerLinks = [
  "Legal Disclosures",
  "Privacy",
  "Security & Account Protection",
  "Manage Cookie Preferences",
  "Terms of Use",
  "Equal Opportunity Employer",
];

export function Header() {
  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/" aria-label="Home">
        <span className={styles.wordmark}>Raymond James</span>
      </Link>
      <nav className={styles.desktopNav} aria-label="Primary navigation">
        {navItems.map((item) => (
          <a href="#" key={item}>
            {item}
          </a>
        ))}
      </nav>
      <div className={styles.utilityNav}>
        <a href="/account-access">
          <UserRound size={19} aria-hidden="true" />
          <span>Account Login</span>
        </a>
        <a href="#">
          <Search size={19} aria-hidden="true" />
          <span>Search</span>
        </a>
        <a href="#">
          <MapPin size={19} aria-hidden="true" />
          <span>Find Advisor</span>
        </a>
      </div>
      <button className={styles.menuButton} type="button" aria-label="Menu">
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

export function SocialBand() {
  return (
    <section className={styles.socialBand} aria-label="Raymond James links">
      <div className={styles.socialInner}>
        <div className={styles.socialIcons}>
          {socialLinks.map((link) => (
            <a href="#" key={link.label} aria-label={link.label}>
              {link.text}
            </a>
          ))}
        </div>
        <nav className={styles.socialNav} aria-label="Footer navigation">
          {footerNavLinks.map((link) => (
            <a href="#" key={link}>
              {link}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      {footerLinks.map((link) => (
        <a href="#" key={link}>
          {link}
        </a>
      ))}
      <span>© 2026 Raymond James Financial, Inc. All rights reserved.</span>
    </footer>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page} id="main-content">
      <Header />
      {children}
      <SiteFooter />
    </main>
  );
}

export function ClientAccessShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.recoveryPage} id="main-content">
      <header className={styles.recoveryHeader}>
        <a href="/account-access" aria-label="Raymond James Client Access">
          <span className={styles.wordmark}>Raymond James<span>CLIENT ACCESS</span></span>
        </a>
      </header>
      {children}
      <SiteFooter />
    </main>
  );
}

export function ClientAccessFooter() {
  return (
    <footer className={styles.recoveryFooter}>
      <section>
        <h2>CLIENT SUPPORT</h2>
        <p>
          For assistance with login issues, please contact Client Access Support at
          877-RJ-ACCESS (877-752-2237).
        </p>
        <h3>Hours</h3>
        <p>
          For technical support: Monday through Friday: 8 a.m. to 9 p.m. ET
          (excluding holidays)
        </p>
        <p>Saturday and Sunday: 8 a.m. to 5 p.m. ET (excluding holidays)</p>
      </section>
      <p className={styles.recoveryLegal}>
        © 2026 Raymond James &amp; Associates, Inc., Member New York Stock
        Exchange/SIPC. | Statement of Financial Condition | Client Access Terms
        and Conditions
      </p>
    </footer>
  );
}
