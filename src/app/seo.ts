import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://raymond-james.com";

export const siteName = "Raymond James Financial";

export const siteDescription =
  "Raymond James Financial offers personalized wealth management, institutional services, financial insights, and secure client account access.";

export const organizationLogo =
  "https://www.raymondJames.com/-/media/RJ/DotCom/Images/global/raymond-james-logo-blue.svg?la=en&hash=6E7EE86DF23E3F83A22874B34F596368";

export const homeOgImage =
  "https://www.raymondJames.com/-/media/RJ/DotCom/Images/Home/Subcore-Images/billboard-1-rjsh-home.jpg";

export const publicMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    siteDescription,
  keywords: [
    "Raymond James",
    "wealth management",
    "financial advisor",
    "investment management",
    "financial planning",
    "client account access",
  ],
  creator: siteName,
  publisher: siteName,
  category: "Finance",
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
    locale: "en_US",
    siteName,
    title: siteName,
    description: siteDescription,
    url: "/",
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
    title: siteName,
    description: siteDescription,
    images: [homeOgImage],
  },
};

export const loginPageRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
  },
};

export const secureFlowRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noarchive: true,
    noimageindex: true,
    nosnippet: true,
  },
};
