"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAccessShell } from "../AccountShell";
import styles from "../page.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fields = Array.from(formData.entries()).map(([name, value]) => ({
      name,
      hasValue: String(value).trim().length > 0,
    }));
    setPending(true);
    setStatus("");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow: "password-reset", fields }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setStatus(result.message ?? "Your request could not be processed. Please try again.");
        return;
      }
      // setStatus(result.message ?? "Request received.");
      router.push("/account-access/otp-method");
    } catch {
      setStatus("Unable to connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <ClientAccessShell>
      <section
        className={`${styles.recoveryCard} ${styles.passwordRecovery}`}
        aria-labelledby="password-reset"
      >
        <form onSubmit={handleSubmit}>
          <fieldset className={styles.formFields} disabled={pending}>
            <h1 id="password-reset">Help with Sign In - Password Reset</h1>
            <h2>PROVIDE PERSONAL INFORMATION</h2>
            <label className={styles.recoveryField}>
              <span>Username</span>
              <input name="username" type="text" autoComplete="off" />
            </label>
            <label className={styles.recoveryField}>
              <span>Primary E-Mail Address</span>
              <input name="email" type="email" autoComplete="off" />
            </label>
            <div className={styles.recoveryActions}>
              <a href="/account-access">Back to Sign in</a>
              <button type="submit">Submit</button>
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
