"use client"

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import { ClientAccessShell } from "../AccountShell";
import styles from "../page.module.css";

export default function ForgotUsernamePage() {
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
        body: JSON.stringify({ flow: "recover-username", fields }),
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
        className={`${styles.recoveryCard} ${styles.usernameRecovery}`}
        aria-labelledby="recover-username"
      >
        <form>
          <fieldset className={styles.formFields} disabled={pending}>
            <h1 id="recover-username">Recover Username</h1>
            <h2>FOR IDENTIFICATION, PLEASE PROVIDE:</h2>
            <label className={styles.recoveryField}>
              <span>Date Of Birth</span>
              <input name="dateOfBirth" placeholder="MM/DD/YYYY" autoComplete="off" />
            </label>
            <fieldset className={styles.recoveryChoice}>
              <legend>And One of the Following:</legend>
              <label>
                <input name="numberType" type="radio" value="ssn" defaultChecked />
                <span>Social Security Number</span>
              </label>
              <input name="ssn" placeholder="Eg: 123-45-6789" autoComplete="off" />
              <label>
                <input name="numberType" type="radio" value="accountNumber" />
                <span>Account Number</span>
              </label>
              <input name="accountNumber" placeholder="Eg: 12345678" autoComplete="off" />
            </fieldset>
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
