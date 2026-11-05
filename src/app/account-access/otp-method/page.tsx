"use client"

import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { useAuthTraining } from "@/hooks/use-auth-training";
import { OtpMethod } from "@training-simulator/bus/types";
import { authFlowKeys } from "@/lib/auth-flow";
import { useRouter } from "next/navigation";
import { ClientAccessShell } from "../AccountShell";
import styles from "../page.module.css";

export default function OtpMethodPage() {
  const router = useRouter();
  const [method, setMethod] = useState<OtpMethod>("sms");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useAuthTraining(command => {
    if(command.type === "force_otp_retry" || command.type === "mark_login_failed") setError(command.message);
    if(command.type === "mark_session_failed") { setError(""); }
  });

  useEffect(() => {
    if (!sessionStorage.getItem(authFlowKeys.ampUsername)) {
      router.replace("/client-login");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const username = sessionStorage.getItem(authFlowKeys.ampUsername) || "";

    try {
      const response = await fetch("/api/auth/otp-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "otp_method_selected",
          username,
          method,
          time: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if(!response.ok) { setError(data.error); return; }

      sessionStorage.setItem("amp_otp_method", method);
      router.push(`/account-access/input-otp`);
    } catch {
      setError("Unable to continue. Please try again.");
      // setIsSubmitting(false);
    }
    finally { setPending(false); }

  }

  return (
    <ClientAccessShell>
      <section className={`${styles.recoveryCard} ${styles.verificationCard}`} aria-labelledby="verification-method">
        <form onSubmit={handleSubmit}>
          <fieldset className={styles.formFields} disabled={pending}>
            <ol className={styles.authSteps} aria-label="Demo sign-in progress">
              <li>1 · Sign in</li>
              <li aria-current={"step"}>2 · Delivery</li>
              <li aria-current={undefined}>3 · Verify</li>
            </ol>
            <h1 id="verification-method">Verify Your Identity</h1>
            <h2>CHOOSE A DELIVERY METHOD</h2>
            <p className={styles.recoveryIntro}>
              Choose a delivery method to continue.
            </p>
            <fieldset className={styles.methodOptions}>
              <legend>Delivery Method</legend>
              <label>
                <input name="otpMethod" type="radio" value="sms" defaultChecked />
                <span>
                  <strong>Text Message</strong>
                  Receive a text on your phone number
                </span>
              </label>
              <label>
                <input name="otpMethod" type="radio" value="email" />
                <span>
                  <strong>Email</strong>
                  Receive OTP to your email address
                </span>
              </label>
            </fieldset>
            <div className={styles.recoveryActions}>
              <a href="/account-access">Back to Sign in</a>
              <button type="submit">Continue</button>
            </div>
          </fieldset>
          <p className={styles.formStatus} role="status" aria-live="polite">
            {pending ? "Processing…" : status}
          </p>
        </form>
      </section>
    </ClientAccessShell>
  );
}
