"use client";

import Link from "next/link";
import { useCookieNotice } from "@/hooks/use-cookie-notice";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PatrickReddingtonHome.module.css";

const rjBase = "https://www.raymondJames.com";

const navItems = [
  {
    label: "Wealth Management",
    href: `${rjBase}/wealth-management`,
    left: { title: "Find an Advisor", copy: "Connect with a Raymond James advisor or an office near you.", cta: "Find An Advisor", href: `${rjBase}/find-an-advisor`, search: true },
    intro: { title: "Wealth Management", copy: "Your Raymond James advisor will help you prepare for life’s major financial milestones and every moment in between.", cta: "Explore Wealth Management" },
    menu: [
      ["What Are You Planning For?", `${rjBase}/wealth-management/what-are-you-planning-for`],
      ["Advice, Products & Services", `${rjBase}/wealth-management/advice-products-and-services`],
      ["Why a Raymond James Advisor", `${rjBase}/wealth-management/why-a-raymond-james-advisor`],
      ["Power of Personal", `${rjBase}/wealth-management/power-of-personal`],
    ],
  },
  {
    label: "Corporations & Institutions",
    href: `${rjBase}/corporations-and-institutions`,
    left: { title: "Raymond James Accolades", copy: "The strength of Raymond James is reflected in both these ongoing accomplishments and in the consistent recognition we receive from our industry and our peers.", cta: "Grow With Us", href: `${rjBase}/corporations-and-institutions/accolades` },
    intro: { title: "Corporations & Institutions", copy: "Together we take a strategic approach to capital markets, backed by the strength of full-service offerings and broad and deep industry expertise.", cta: "View Management Team", href: `${rjBase}/corporations-and-institutions/management-team` },
    menu: [
      ["Investment Banking", `${rjBase}/corporations-and-institutions/investment-banking`],
      ["Public Finance", `${rjBase}/corporations-and-institutions/public-finance`],
      ["Global Equities & Investment Banking", `${rjBase}/corporations-and-institutions/global-equities-and-investment-banking`],
      ["Fixed Income Capital Markets", `${rjBase}/corporations-and-institutions/fixed-income-capital-markets`],
      ["Raymond James Investment Management", `${rjBase}/corporations-and-institutions/rjim`],
      ["Solutions for Businesses", `${rjBase}/corporations-and-institutions/solutions-for-businesses`],
      ["Depository Institution Services", `${rjBase}/corporations-and-institutions/depository-institution-services`],
      ["Additional Institutional Services", `${rjBase}/corporations-and-institutions/additional-institutional-services`],
    ],
  },
  {
    label: "Commentary & Insights",
    href: `${rjBase}/commentary-and-insights`,
    left: { title: "Commentary and Insights", copy: "Thoughtful, timely investing and planning insights from the leading professionals at Raymond James.", cta: "Commentary and Insights" },
    menu: [
      ["Economy & Policy", `${rjBase}/commentary-and-insights/economy-policy`],
      ["Markets & Investing", `${rjBase}/commentary-and-insights/markets-investing`],
      ["Retirement & Longevity", `${rjBase}/commentary-and-insights/retirement-longevity`],
      ["Estate & Giving", `${rjBase}/commentary-and-insights/estate-giving`],
      ["Family & Lifestyle", `${rjBase}/commentary-and-insights/family-life-events`],
      ["Technology & Innovation", `${rjBase}/commentary-and-insights/lifestyle-technology`],
      ["Tax Planning", `${rjBase}/commentary-and-insights/tax-planning`],
      ["Business Ownership", `${rjBase}/commentary-and-insights/business-ownership`],
    ],
  },
  {
    label: "Advisor Opportunities",
    href: `${rjBase}/advisor-opportunities`,
    left: { title: "Contact an AdvisorChoice® Consultant", copy: "Have a confidential conversation with our recruiters about what your business would look like as an advisor at Raymond James.", cta: "Talk to a consultant", href: `${rjBase}/advisor-opportunities/contact-us/talk-to-a-recruiter` },
    intro: { title: "Advisor Opportunities", copy: "Our advisors are viewed as clients of the firm, which means we provide world-class resources and support to help run their business on their terms.", cta: "Explore Advisor Opportunities" },
    menu: [
      ["Affiliation Options", `${rjBase}/advisor-opportunities/affiliation-options`],
      ["Our Culture", `${rjBase}/advisor-opportunities/our-culture`],
      ["Home Office Visit", `${rjBase}/advisor-opportunities/hov`],
      ["Resources & Support", `${rjBase}/advisor-opportunities/resources-and-support`],
      ["Networks", `${rjBase}/advisor-opportunities/networks`],
      ["Advisor Essentials Podcast", `${rjBase}/advisor-opportunities/advisor-essentials`],
      ["Practice Insights", `${rjBase}/advisor-opportunities/practice-insights`],
      ["Press Releases", `${rjBase}/advisor-opportunities/press-releases`],
      ["Contact Us", `${rjBase}/advisor-opportunities/contact-us`],
    ],
  },
  {
    label: "More...",
    href: `${rjBase}/about-us`,
    left: { title: "About Raymond James", copy: "No matter the business, we believe if we do what’s right for clients, we’ll help them achieve success while also realizing our own. It’s that simple.", cta: "Learn More" },
    intro: { title: "Careers at Raymond James", copy: "Our associates are more than the heart and soul of our firm – they’re the key to its continued success.", cta: "Take Your Next Step", href: `${rjBase}/careers` },
    menu: [
      ["About Us", `${rjBase}/about-us`],
      ["Corporate Responsibility", `${rjBase}/about-us/corporate-responsibility`],
      ["Our Culture", `${rjBase}/about-us/our-culture`],
      ["Company History", `${rjBase}/about-us/company-history`],
      ["Leadership Team", `${rjBase}/about-us/leadership-team`],
      ["Careers", `${rjBase}/careers`],
      ["Investor Relations", `${rjBase}/investor-relations`],
      ["News & Media", `${rjBase}/news-and-media`],
      ["Contact Us", `${rjBase}/contact-us`],
    ],
  },
];

const assets = {
  logo: "https://www.raymondJames.com/-/media/RJ/DotCom/Images/global/raymond-james-logo-blue.svg?la=en&hash=6E7EE86DF23E3F83A22874B34F596368",
  login: "https://www.raymondJames.com/-/media/RJ/DotCom/Images/global/icon-login.svg?la=en&hash=048AA94C7BAAF001C703D4952EECC91E",
  search: "https://www.raymondJames.com/-/media/RJ/DotCom/Images/global/icon-search.svg?la=en&hash=D60453E81CBDCDA390DAB09F3E892062",
  find: "https://www.raymondJames.com/-/media/RJ/DotCom/Images/global/icon-find.svg?la=en&h=150&w=101&hash=039B713C042C057E3936762959B40099",
  handshake: "https://www.raymondJames.com/-/media/RJ/DotCom/Images/Home/popersonal-png.png?la=en&h=920&w=1390&hash=A53642FAED90013FA557FC917C84C327",
  spotlight: "https://www.raymondJames.com/-/media/RJ/DotCom/Images/Home/Subcore-Images/spotlight-1-rjsh-associates-meet-at-table.jpg",
  insight: "https://www.raymondJames.com/-/media/RJ/DotCom/Images/Home/Subcore-Images/HNW_Article_-_Private_Credit_1400x800.jpg",
  advisor: "https://www.raymondJames.com/-/media/2b938909fbbc4c8693e1131131c9d03e.ashx",
};

const offerings = [
  {
    title: "Wealth Management",
    href: `${rjBase}/wealth-management`,
    copy: "Expansive support for life's major financial milestones and every moment in between.",
    cta: "Explore how we plan for life",
  },
  {
    title: "Corporations & Institutions",
    href: `${rjBase}/corporations-and-institutions`,
    copy: "Comprehensive capital markets services, strategic guidance, and an agile approach for each stage of a company's growth.",
    cta: "Explore how we drive growth",
  },
  {
    title: "Advisor Opportunities",
    href: `${rjBase}/advisor-opportunities`,
    copy: "A platform that puts advisors in control with a unique combination of resources and flexibility.",
    cta: "Explore how we empower choice",
  },
];

const serviceSummaries = [
  {
    title: "Personal wealth management",
    copy: "Financial planning, investment management, retirement income strategy, estate considerations, and guidance for major life decisions.",
    href: `${rjBase}/wealth-management`,
  },
  {
    title: "Institutional financial services",
    copy: "Capital markets, investment banking, public finance, fixed income, and business solutions for organizations with complex priorities.",
    href: `${rjBase}/corporations-and-institutions`,
  },
  {
    title: "Market commentary and planning insights",
    copy: "Timely perspectives on markets, investing, retirement, tax planning, family wealth, and business ownership.",
    href: `${rjBase}/commentary-and-insights`,
  },
];

const homepageFaqs = [
  {
    question: "What does Raymond James Financial help clients with?",
    answer:
      "Raymond James Financial helps individuals, families, businesses, and institutions plan, invest, access financial services, and make more confident decisions about long-term goals.",
  },
  {
    question: "How can I find a Raymond James financial advisor?",
    answer:
      "Use the advisor search to look up advisors by last name, city, state, or ZIP code and connect with a professional who fits your planning needs.",
  },
  {
    question: "Can existing clients access their accounts online?",
    answer:
      "Yes. Existing clients can use Account Access to sign in securely and manage their Raymond James account information online.",
  },
];

const insights = [
  {
    title: "Keep on giving",
    copy: "Prioritizing philanthropy in retirement starts with strategy.",
    tag: "Estate & Giving",
    href: `${rjBase}/commentary-and-insights/2025/12/29/keep-on-giving`,
  },
  {
    title: "Technical refinancing",
    copy: "Explore a home buying strategy designed to give you liquidity now and flexibility later.",
    tag: "Family & Lifestyle",
    href: `${rjBase}/commentary-and-insights/2025/12/11/technical-refinancing`,
  },
  {
    title: "Aging solo",
    copy: "The practicalities and possibilities of embracing the future on your own.",
    tag: "Retirement & Longevity",
    href: `${rjBase}/commentary-and-insights/2025/11/04/aging-solo`,
  },
  {
    title: "What is Qualified Small Business Stock?",
    copy: "Explore a tax exemption designed to reward emerging businesses and their investors.",
    tag: "Business Ownership",
    href: `${rjBase}/commentary-and-insights/2026/07/29/what-is-qualified-small-business-stock`,
  },
  {
    title: "Concentrated equity risk: Is it time to break your concentration?",
    copy: "Sometimes the very thing that creates substantial wealth poses its greatest threat.",
    tag: "Markets & Investing",
    href: `${rjBase}/commentary-and-insights/2026/06/10/concentrated-equity-risk-is-it-time-to-break-your-concentration`,
  },
  {
    title: "A universe of potential opportunity lies beyond the public markets",
    copy: "Technology and trends have made individual investors an important part of the private market.",
    tag: "Markets & Investing",
    href: `${rjBase}/commentary-and-insights/2026/06/03/a-universe-of-potential-opportunity-lies-beyond-the-public-markets`,
  },
];

const footerLinks = [
  ["About Us", `${rjBase}/about-us`],
  ["Careers", `${rjBase}/careers`],
  ["Investor Relations", `${rjBase}/investor-relations`],
  ["News & Media", `${rjBase}/news-and-media`],
  ["Contact Us", `${rjBase}/contact-us`],
];

const secondaryFooterLinks = [
  ["Legal Disclosures", `${rjBase}/legal-disclosures`],
  ["Privacy Security & Account Protection", `${rjBase}/privacy-security-and-account-protection`],
  ["Manage Cookie Preferences", `${rjBase}/privacy-security-and-account-protection/privacy-commitment/privacy-notices/manage-cookie-preferences`],
  ["Terms of Use", `${rjBase}/terms-of-use`],
  ["Equal Opportunity Employer", `${rjBase}/equal-opportunity-employer`],
];

const socialLinks = [
  {
    label: "Twitter",
    href: "https://twitter.com/raymondJames",
    viewBox: "0 0 448 512",
    path: "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-48.9 158.8c.2 2.8.2 5.7.2 8.5 0 86.7-66 186.6-186.6 186.6-37.2 0-71.7-10.8-100.7-29.4 5.3.6 10.4.8 15.8.8 30.7 0 58.9-10.4 81.4-28-28.8-.6-53-19.5-61.3-45.5 10.1 1.5 19.2 1.5 29.6-1.2-30-6.1-52.5-32.5-52.5-64.4v-.8c8.7 4.9 18.9 7.9 29.6 8.3a65.45 65.45 0 0 1-29.2-54.6c0-12.2 3.2-23.4 8.9-33.1 32.3 39.8 80.8 65.8 135.2 68.6-9.3-44.5 24-80.6 64-80.6 18.9 0 35.9 7.9 47.9 20.5 14.8-2.8 29-8.3 41.6-15.8-4.9 15.2-15.2 28-28.8 36.1 13.2-1.4 26-5.1 37.8-10.2-8.8 13.1-19.8 24.7-32.5 34.2z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/raymondJames/",
    viewBox: "0 0 448 512",
    path: "M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/raymond-james-financial-inc-",
    viewBox: "0 0 448 512",
    path: "M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3C448 46.5 433.6 32 416 32zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/raymondJames/",
    viewBox: "0 0 448 512",
    path: "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/user/raymondJames",
    viewBox: "0 0 576 512",
    path: "M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.1 337.6V175.2l142.7 81.2-142.7 81.2z",
  },
];

function ArrowCta({
  children,
  href,
  light = false,
}: {
  children: React.ReactNode;
  href: string;
  light?: boolean;
}) {
  return (
    <a className={light ? styles.lightCta : styles.arrowCta} href={href}>
      <span>{children}</span>
      <span className={styles.arrowBubble} aria-hidden="true">
        <ArrowRight size={24} strokeWidth={1.8} />
      </span>
    </a>
  );
}

export function PatrickReddingtonHome() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(3);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 110);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleInsights = useMemo(() => {
    return [0, 1, 2].map((offset) => insights[(slide + offset) % insights.length]);
  }, [slide]);

  const shiftSlide = (direction: number) => {
    setSlide((current) => (current + direction + insights.length) % insights.length);
  };

  return (
    <div className={styles.page}>
      <Header scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <CookieNotice />
        <Promo />
        <Offerings />
        <SeoContent />
        <People />
        <Insights visibleInsights={visibleInsights} shiftSlide={shiftSlide} />
        <TimelyPerspectives />
        <AdvisorCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function CookieNotice() {
  const { visible, dismiss } = useCookieNotice();

  if (!visible) {
    return null;
  }

  return (
    <section className={styles.cookieNotice} aria-label="Cookie notice">
      <p>
        This site uses cookies to ensure you get the best experience. By clicking &apos;X&apos;, you
        accept all cookies by default. See our{" "}
        <a onClick={() => dismiss("dismissed")} href={`${rjBase}/privacy-security-and-account-protection/privacy-commitment/internet-privacy-statement`}>
          Internet Privacy Statement
        </a>{" "}
        on adjusting your social media and embedded component settings.
      </p>
      <div className={styles.cookieActions}>
        <button type="button" onClick={() => dismiss("dismissed")}>
          Manage Preferences
        </button>
        <button type="button" onClick={() => dismiss("declined")}>Decline</button>
        <button type="button" onClick={() => dismiss("accepted")}>Accept</button>
      </div>
      <button type="button" aria-label="Close cookie notice" onClick={() => dismiss("dismissed")}>
        <X size={18} />
      </button>
    </section>
  );
}

function Header({
  scrolled,
  menuOpen,
  setMenuOpen,
}: {
  scrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (label: string) => {
    if (closeMenuTimer.current) {
      clearTimeout(closeMenuTimer.current);
      closeMenuTimer.current = null;
    }
    setActiveMenu(label);
  };

  const scheduleMenuClose = () => {
    closeMenuTimer.current = setTimeout(() => setActiveMenu(null), 250);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerCompact : ""}`}>
      <div className={styles.headerInner}>
        <Link className={styles.logo} href="/" aria-label="Raymond James home">
          <img src={assets.logo} alt="Raymond James" />
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => (
            <div
              className={`${styles.navItem} ${activeMenu === item.label ? styles.navItemActive : ""}`}
              key={item.label}
              onMouseEnter={() => openMenu(item.label)}
              onMouseLeave={scheduleMenuClose}
              onFocus={() => openMenu(item.label)}
            >
              <a className={styles.navTopLink} href={item.href} aria-expanded={activeMenu === item.label}>
                {item.label}
              </a>
              {activeMenu === item.label && (
                <div className={styles.megaPanel} onMouseEnter={() => openMenu(item.label)} onMouseLeave={scheduleMenuClose}>
                  <div className={styles.megaPanelInner}>
                    <div className={styles.megaColumn}>
                      <h2>{item.left.title}</h2>
                      <p>{item.left.copy}</p>
                      {item.left.search && (
                        <form className={styles.advisorSearch} action={`${rjBase}/find-an-advisor`} method="get">
                          <input aria-label="Enter City, ST or ZIP Code" name="location" placeholder="Enter City, ST or ZIP Code" />
                          <input aria-label="Enter Last Name" name="lastName" placeholder="Enter Last Name" />
                          <button type="submit">Find An Advisor</button>
                        </form>
                      )}
                      {!item.left.search && item.left.cta && (
                        <a className={styles.menuButtonLink} href={item.left.href || item.href}>{item.left.cta}</a>
                      )}
                    </div>
                    <nav className={styles.megaLinks} aria-label={`${item.label} menu`}>
                      {item.menu.map(([label, href]) => (
                        <a href={href} key={`${item.label}-${label}`}>
                          <span>{label}</span>
                          {item.label === "Wealth Management" && label !== "Why a Raymond James Advisor" && label !== "Power of Personal" && (
                            <ChevronRight size={22} strokeWidth={1.25} aria-hidden="true" />
                          )}
                        </a>
                      ))}
                    </nav>
                    {item.intro && (
                      <div className={styles.megaColumn}>
                        <h2>{item.intro.title}</h2>
                        <p>{item.intro.copy}</p>
                        <a className={styles.menuButtonLink} href={item.intro.href || item.href}>{item.intro.cta}</a>
                      </div>
                    )}
                  </div>
                  <button className={styles.megaClose} type="button" aria-label="Close menu" onClick={() => setActiveMenu(null)}>
                    <X size={40} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className={styles.headerTools}>
          <Link className={styles.iconLink} href="/account-access" aria-label="Login">
            <img src={assets.login} alt="" />
          </Link>
          <a className={styles.iconLink} href={`${rjBase}/search-results`} aria-label="Search">
            <img src={assets.search} alt="" />
          </a>
          <a className={styles.iconLink} href={`${rjBase}/find-an-advisor`} aria-label="Find an advisor">
            <img src={assets.find} alt="" />
          </a>
        </div>
        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={30} />}
        </button>
      </div>
      <div className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""}`}>
        {navItems.map((item) => (
          <a href={item.href} key={item.label} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <Link href="/account-access" onClick={() => setMenuOpen(false)}>
          Login
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroCopy}>
          <h1>Raymond James Financial Advisors</h1>
          <p>Personal wealth management and financial advice powered by care, insight and expertise.</p>
        </div>
      </div>
    </section>
  );
}

function Promo() {
  return (
    <section className={styles.promo}>
      <div className={`${styles.container} ${styles.promoInner}`}>
        <img className={styles.promoImage} src={assets.handshake} alt="Financial advisor and client shaking hands" />
        <div className={styles.promoCopy}>
          <h2>Our vast capability. Your boundless possibility.</h2>
          <p>
            When care, insight and expertise come together, advice becomes more than a plan - it
            becomes a path forward built around what matters most.
          </p>
          <ArrowCta href={`${rjBase}/wealth-management/power-of-personal`} light>
            Explore Advice Driven by Connection
          </ArrowCta>
        </div>
      </div>
    </section>
  );
}

function Offerings() {
  return (
    <section className={styles.offerings}>
      <div className={styles.container}>
        <div className={styles.ruleHeading}>
          <span />
          <h2>Sophisticated offerings for every priority, objective and ambition:</h2>
          <span />
        </div>
        <div className={styles.offeringGrid}>
          {offerings.map((item) => (
            <article className={styles.offering} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <ArrowCta href={item.href}>{item.cta}</ArrowCta>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeoContent() {
  return (
    <section className={styles.seoContent} aria-labelledby="financial-services">
      <div className={styles.container}>
        <div className={styles.seoIntro}>
          <p>Wealth management, investment guidance and financial services</p>
          <h2 id="financial-services">Financial guidance built around what matters most</h2>
          <p>
            Raymond James Financial brings together personal financial advisors, institutional
            services and practical market insight to help clients plan for retirement, manage wealth,
            evaluate opportunities and move forward with clarity.
          </p>
        </div>
        <div className={styles.seoGrid}>
          {serviceSummaries.map((item) => (
            <article className={styles.seoCard} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <a href={item.href}>Learn more</a>
            </article>
          ))}
        </div>
        <div className={styles.faqGrid} aria-label="Common questions">
          {homepageFaqs.map((item) => (
            <article className={styles.faqItem} key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function People() {
  return (
    <section className={styles.people}>
      <div className={`${styles.container} ${styles.storyRow}`}>
        <div className={styles.storyHeadline}>
          <h2>A powerful firm that cares deeply about people</h2>
        </div>
        <div className={styles.storyCopy}>
          <p>
            Since our founding in 1962, Raymond James has taken a uniquely human approach to the
            complex work of investment management and wealth planning, matching robust capabilities
            with the deep personal insight into the people we serve that enables potential to be
            realized.
          </p>
        </div>
      </div>
      <div className={`${styles.container} ${styles.imageStory}`}>
        <div className={styles.spotlightCopy}>
          <h2>Who we are</h2>
          <p>
            From the beginning, our business has been people and their financial well-being. That
            emphasis on people has been the engine of our growth in good times and the touchstone
            that keeps us steady when circumstances change.
          </p>
          <div className={styles.linkList}>
            <a href={`${rjBase}/about-us/our-culture`}>Our Culture</a>
            <a href={`${rjBase}/about-us/our-stories`}>Our Stories</a>
            <a href={`${rjBase}/about-us/giving-back`}>Community Impact</a>
          </div>
        </div>
        <img src={assets.spotlight} alt="Raymond James associates meeting about financial planning" />
      </div>
    </section>
  );
}

function Insights({
  visibleInsights,
  shiftSlide,
}: {
  shiftSlide: (direction: number) => void;
  visibleInsights: { title: string; copy: string; tag: string; href: string }[];
}) {
  return (
    <section className={styles.insights}>
      <div className={`${styles.container} ${styles.sectionRule}`}>
        <span />
        <h2>Insights</h2>
        <span />
      </div>
      <div className={`${styles.container} ${styles.featuredInsight}`}>
        <div className={styles.featuredCard}>
          <h2>Private credit is a growing retirement income strategy</h2>
          <p>
            Direct lending investment strategies draw their power from the private market,
            providing an important step in the risk-reward spectrum for income-seeking investors.
          </p>
          <a
            className={styles.readMore}
            href={`${rjBase}/commentary-and-insights/retirement-longevity/2026/08/26/private-credit-is-a-growing-retirement-income-strategy`}
          >
            Read more
          </a>
        </div>
        <img src={assets.insight} alt="Private credit strategy insight for retirement income planning" />
      </div>
      <div className={`${styles.container} ${styles.carouselShell}`}>
        <button className={styles.carouselButton} type="button" onClick={() => shiftSlide(-1)} aria-label="Previous insights">
          <ArrowLeft size={22} />
        </button>
        <div className={styles.insightCards}>
          {visibleInsights.map((item) => (
            <article className={styles.insightCard} key={item.title}>
              <p className={styles.cardTag}>{item.tag}</p>
              <a href={item.href}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <span>Read</span>
              </a>
            </article>
          ))}
        </div>
        <button className={styles.carouselButton} type="button" onClick={() => shiftSlide(1)} aria-label="Next insights">
          <ArrowRight size={22} />
        </button>
      </div>
      <div className={styles.viewAllWrap}>
        <a className={styles.outlineButton} href={`${rjBase}/commentary-and-insights`}>
          View All Insights
        </a>
      </div>
    </section>
  );
}

function TimelyPerspectives() {
  return (
    <section className={styles.timely}>
      <div className={styles.container}>
        <h2>Timely perspectives, expert analysis</h2>
        <p>The latest commentary and insights from Raymond James experts.</p>
        <a className={styles.outlineButton} href={`${rjBase}/commentary-and-insights`}>
          View All Insights
        </a>
      </div>
    </section>
  );
}

function AdvisorCta() {
  return (
    <section className={styles.advisorCta}>
      <div className={`${styles.container} ${styles.advisorPanel}`}>
        <div className={styles.advisorCopy}>
          <h2>Talk to an advisor.</h2>
          <p>A more personal approach to achieving your financial goals could start today.</p>
          <form className={styles.advisorForm} action={`${rjBase}/find-an-advisor`} method="get">
            <label>
              <span>Enter Last Name</span>
              <input type="text" name="lastName" aria-label="Enter Last Name" />
            </label>
            <em>OR</em>
            <label>
              <span>Enter City, State or Zip Code</span>
              <input type="text" name="location" aria-label="Enter City, State or Zip Code" />
            </label>
            <button type="submit">Search Advisors</button>
          </form>
        </div>
        <div className={styles.advisorImage} aria-hidden="true" />
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerTop}`}>
        <div className={styles.social}>
          {socialLinks.map((link) => (
            <a href={link.href} aria-label={link.label} key={link.label}>
              <svg viewBox={link.viewBox} aria-hidden="true" focusable="false">
                <path d={link.path} />
              </svg>
            </a>
          ))}
        </div>
        <nav className={styles.footerLinks} aria-label="Footer navigation">
          {footerLinks.map(([label, href]) => (
            <a href={href} key={label}>{label}</a>
          ))}
        </nav>
      </div>
      <div className={styles.footerBottom}>
        <div className={`${styles.container} ${styles.footerBottomInner}`}>
          <nav className={styles.secondaryFooterLinks} aria-label="Legal navigation">
            {secondaryFooterLinks.map(([label, href]) => (
              <a href={href} key={label}>{label}</a>
            ))}
          </nav>
          <div>
            <p className={styles.legal}>
              © 2026 Raymond James Financial, Inc. All rights reserved. Raymond James & Associates,
              Inc., member New York Stock Exchange / SIPC, and Raymond James Financial Services, Inc.,
              member FINRA / SIPC, are subsidiaries of Raymond James Financial, Inc.
            </p>
            <p className={styles.legal}>
              Raymond James is not responsible for the content of any website or the collection or use
              of information regarding any website&apos;s users and/or members.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
