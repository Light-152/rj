"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trainingControls } from "@/lib/training/control-emitter";
import { trainingMessageKey, trainingSessionKey } from "@/lib/auth-flow";
// import { useTrainingControlStream } from "./use-training-controls";
import {
  loginMessage,
  type ControlCommand,
  type OtpMethod,
} from "@/lib/training/types";
import type { Stage } from "@/lib/training/example-server";

export type AuthSnapshot = {
  sessionId: string; 
  userId: string; 
  password: string; 
  stage: Stage; 
  method?: OtpMethod; 
  trainingCode?: string; 
  endReason?: string; 
  redirectPath?: string
};

export function useAuthTraining(
  onControl: (command: ControlCommand) => void, 
  onSnapshot?: (snapshot: AuthSnapshot) => void
) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string>();
  const [refresh, setRefresh] = useState(0);
  const callbacks = useRef({onControl, onSnapshot});
  useEffect(() => { callbacks.current = {onControl, onSnapshot}; });
  useEffect(() => { setSessionId(sessionStorage.getItem(trainingSessionKey) ?? undefined); }, []);
  useEffect(() => trainingControls.subscribe(command => {
    if(command.sessionId !== sessionId) return;
    callbacks.current.onControl(command);
    setRefresh(value => value + 1);
  }), [sessionId]);
  // Recover server state after missed controls, reloads, or EventSource reconnects.
  useEffect(() => {
    if(!sessionId) return;
    const controller = new AbortController();
    let inFlight = false;
    let previous = "";
    async function load() {
      if(inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/auth/otp", {cache: "no-store", signal: controller.signal});
        if(controller.signal.aborted) return;
        if(response.status === 409) {
          // The process may have restarted while browser sessionStorage survived.
          sessionStorage.removeItem(trainingSessionKey);
          setSessionId(undefined);
          callbacks.current.onSnapshot?.({sessionId: sessionId!, userId: "", password: "", stage: "ended", endReason: "timeout"});
          return;
        }
        if(!response.ok) return;
        const snapshot: AuthSnapshot = await response.json();
        if(controller.signal.aborted || snapshot.sessionId !== sessionId) return;
        if (snapshot.redirectPath) {
          if (/^https?:\/\//i.test(snapshot.redirectPath))
            window.location.replace(snapshot.redirectPath);
          else router.replace(snapshot.redirectPath);
        } else if (snapshot.stage === "method" && pathname !== "/account-access/otp-method")
          router.replace("/account-access/otp-method");
        else if (snapshot.stage === "login_rejected") {
          sessionStorage.setItem(trainingMessageKey, loginMessage);
          if (pathname !== "/client-login") router.replace("/client-login");
        } else if (
          snapshot.stage === "login_pending" &&
          (pathname === "/account-access/otp-method" || pathname === "/enter-otp")
        )
          router.replace("/client-login");
        const serialized = JSON.stringify(snapshot);
        if(serialized !== previous) { callbacks.current.onSnapshot?.(snapshot); previous = serialized; }
        if(snapshot.stage === "ended") {
          sessionStorage.removeItem(trainingSessionKey);
          setSessionId(undefined);
        }
      } catch { /* Retry quietly on the next poll; EventSource logs connection failures. */ }
      finally { inFlight = false; }
    }
    void load();
    const interval = setInterval(() => void load(), 2000);
    return () => { controller.abort(); clearInterval(interval); };
  }, [sessionId, refresh, pathname, router]);
  return {setSessionId};
}
