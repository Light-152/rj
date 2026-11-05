import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/account-access"],
        disallow: [
          "/account-access/forgot-password",
          "/account-access/forgot-username",
          "/account-access/input-otp",
          "/account-access/otp-method",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
