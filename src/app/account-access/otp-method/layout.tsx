import type { Metadata } from "next";
import type { ReactNode } from "react";
import { secureFlowRobots } from "../../seo";

export const metadata: Metadata = {
  title: "Verification Method",
  description: "Choose a verification method for Raymond James Client Access.",
  alternates: {
    canonical: "/account-access/otp-method",
  },
  robots: secureFlowRobots,
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
