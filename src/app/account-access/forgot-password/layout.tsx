import type { Metadata } from "next";
import type { ReactNode } from "react";
import { secureFlowRobots } from "../../seo";

export const metadata: Metadata = {
  title: "Password Reset",
  description: "Reset your Raymond James Client Access password.",
  alternates: {
    canonical: "/account-access/forgot-password",
  },
  robots: secureFlowRobots,
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
