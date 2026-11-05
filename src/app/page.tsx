import type { Metadata } from "next";
import { homeOgImage, organizationLogo, siteDescription, siteName, siteUrl } from "./seo";
import { PatrickReddingtonHome } from "@/components/sites/patrickreddington-com-0cba0a2c/root-8a5edab2/PatrickReddingtonHome";

export const metadata: Metadata = {
  title: "Raymond James Financial Advisors | Wealth Management",
  description: siteDescription,
  keywords: [
    "Raymond James Financial",
    "personal wealth management",
    "financial advisors",
    "retirement planning",
    "investment banking",
    "market insights",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    title: "Raymond James Financial | The Power of Personal",
    description: siteDescription,
    url: "/",
    siteName,
    images: [
      {
        url: homeOgImage,
        width: 1400,
        height: 800,
        alt: "Raymond James Financial wealth management homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raymond James Financial | The Power of Personal",
    description: siteDescription,
    images: [homeOgImage],
  },
};

const sameAs = [
  "https://twitter.com/raymondJames",
  "https://www.facebook.com/raymondJames/",
  "https://www.linkedin.com/company/raymond-james-financial-inc-",
  "https://www.instagram.com/raymondJames/",
  "https://www.youtube.com/user/raymondJames",
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: organizationLogo,
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "Raymond James Financial Advisors | Wealth Management",
      description: siteDescription,
      isPartOf: {
        "@id": `${siteUrl}/#website`,
      },
      about: {
        "@id": `${siteUrl}/#financial-service`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: homeOgImage,
      },
      inLanguage: "en-US",
      dateModified: "2026-09-25",
    },
    {
      "@type": "FinancialService",
      "@id": `${siteUrl}/#financial-service`,
      name: siteName,
      url: siteUrl,
      image: homeOgImage,
      description: siteDescription,
      provider: {
        "@id": `${siteUrl}/#organization`,
      },
      areaServed: "US",
      serviceType: [
        "Wealth management",
        "Financial planning",
        "Investment management",
        "Institutional financial services",
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#services`,
      name: "Raymond James Financial services",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Wealth management",
          url: `${siteUrl}/wealth-management`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Corporations and institutions",
          url: `${siteUrl}/corporations-and-institutions`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Advisor opportunities",
          url: `${siteUrl}/advisor-opportunities`,
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PatrickReddingtonHome />
    </>
  );
}
