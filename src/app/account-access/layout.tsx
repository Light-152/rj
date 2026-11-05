import type { Metadata } from "next";
import type { ReactNode } from "react";
import { loginPageRobots, siteName } from "../seo";

export const metadata: Metadata = {
  title: "Account Access",
  description: "Secure sign-in portal for Raymond James Client Access.",
  alternates: {
    canonical: "/account-access",
  },
  openGraph: {
    title: `Account Access | ${siteName}`,
    description: "Secure sign-in portal for Raymond James Client Access.",
    url: "/account-access",
  },
  robots: loginPageRobots,
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
