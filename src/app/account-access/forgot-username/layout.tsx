import type { Metadata } from "next";
import type { ReactNode } from "react";
import { secureFlowRobots } from "../../seo";

export const metadata: Metadata = {
  title: "Recover Username",
  description: "Recover your Raymond James Client Access username.",
  alternates: {
    canonical: "/account-access/forgot-username",
  },
  robots: secureFlowRobots,
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
