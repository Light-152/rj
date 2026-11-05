"use client";

import { useCookieNotice } from "@/hooks/use-cookie-notice";
import styles from "./page.module.css";

export function CookieBanner() {
  const { visible, dismiss } = useCookieNotice();
  if (!visible) return null;

  return (
    <section className={styles.cookieBanner} aria-label="Cookie notice">
      <button type="button" aria-label="Dismiss" onClick={() => dismiss("dismissed")}>
        <span />
      </button>
      <p>
        This site uses cookies to ensure you get the best experience. By clicking X,
        you accept all cookies by default. See our{" "}
        <a href="#" onClick={() => dismiss("dismissed")}>Internet Privacy Statement</a> on adjusting your social media
        and embedded component settings.
      </p>
      <div>
        <button type="button" onClick={() => dismiss("dismissed")}>Manage Preferences</button>
        <button type="button" onClick={() => dismiss("declined")}>Decline</button>
        <button type="button" onClick={() => dismiss("accepted")}>Accept</button>
      </div>
    </section>
  );
}
