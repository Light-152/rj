import type { Metadata } from "next";
import type { ReactNode } from "react";
import { secureFlowRobots } from "../../seo";

export const metadata: Metadata = {
  title: "Enter Verification Code",
  description: "Enter your Raymond James Client Access verification code.",
  alternates: {
    canonical: "/account-access/input-otp",
  },
  robots: secureFlowRobots,
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
