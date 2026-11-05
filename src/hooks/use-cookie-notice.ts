"use client";

import { useState, useSyncExternalStore } from "react";

const storageKey = "demo-cookie-choice";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("cookie-choice", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("cookie-choice", onChange);
  };
}

function hasSavedChoice() {
  try {
    return window.localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

export function useCookieNotice() {
  const savedChoice = useSyncExternalStore(subscribe, hasSavedChoice, () => true);
  const [visible, setVisible] = useState(true);

  const dismiss = (choice: "accepted" | "declined" | "dismissed") => {
    try {
      window.localStorage.setItem(storageKey, choice);
      window.dispatchEvent(new Event("cookie-choice"));
    } catch {
      // Still allow dismissal when browser storage is unavailable.
    }
    setVisible(false);
  };

  return { visible: visible && !savedChoice, dismiss };
}
