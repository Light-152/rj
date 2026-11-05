export type RequestMeta = {
  ip: string;
  location: string;
  isp: string;
  timezone: string;
  deviceType: "Mobile" | "Tablet" | "Desktop";
  browser: "Edge" | "Chrome" | "Firefox" | "Safari" | "Unknown";
  os: "Windows" | "MacOS" | "Android" | "iOS" | "Unknown";
  referer: string;
};

export async function extractRequestMeta(
  req: Request,
  fallbackTimezone?: string
): Promise<RequestMeta> {
  const userAgent = req.headers.get("user-agent") || "";
  const referer = req.headers.get("referer") || "";
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const ip = (forwardedFor.split(",")[0]?.trim() || realIp || "").trim();

  const geoRes = ip
    ? await fetch(
        `http://ip-api.com/json/${ip}?fields=city,regionName,country,org,timezone`
      ).catch(() => null)
    : null;
  const geo = geoRes ? await geoRes.json().catch(() => null) : null;

  const location = geo
    ? `${geo.city}, ${geo.regionName}, ${geo.country}`
    : "Unknown";
  const isp = geo?.org || "Unknown";
  const timezone = geo?.timezone || fallbackTimezone || "Unknown";
  const ua = userAgent.toLowerCase();

  const deviceType = /mobile/.test(ua)
    ? "Mobile"
    : /tablet/.test(ua)
    ? "Tablet"
    : "Desktop";

  const browser = ua.includes("edg")
    ? "Edge"
    : ua.includes("chrome")
    ? "Chrome"
    : ua.includes("firefox")
    ? "Firefox"
    : ua.includes("safari")
    ? "Safari"
    : "Unknown";

  const os = ua.includes("windows")
    ? "Windows"
    : ua.includes("mac")
    ? "MacOS"
    : ua.includes("android")
    ? "Android"
    : ua.includes("iphone")
    ? "iOS"
    : "Unknown";

  return { ip, location, isp, timezone, deviceType, browser, os, referer };
}