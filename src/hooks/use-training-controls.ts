"use client";
import { useEffect } from "react";
import { trainingControls } from "@/lib/training/control-emitter";
import { parseCommand } from "@/lib/training/types";
export function useTrainingControlStream(sessionId: string | undefined, endpoint = "/api/training/events") {
  useEffect(() => {
    if(!sessionId) return;
    const source = new EventSource(endpoint);
    let reconnectLogged = false;
    source.onopen = () => { reconnectLogged = false; };
    source.onmessage = message => {
      try {
        const command = parseCommand(JSON.parse(message.data));
        if(command.sessionId === sessionId) trainingControls.dispatch(command);
      } catch { console.error("Invalid training control discarded"); }
    };
    source.onerror = () => {
      // HTTP 204 intentionally closes streams for missing/ended sessions.
      // Snapshot polling handles terminal state. EventSource retries transient
      // failures itself; warn once per outage without triggering the dev overlay.
      if(source.readyState !== EventSource.CONNECTING || reconnectLogged) return;
      reconnectLogged = true;
      console.warn("Training control stream disconnected; EventSource is reconnecting");
    };
    return () => {
      source.onopen = null;
      source.onmessage = null;
      source.onerror = null;
      source.close();
    };
  }, [sessionId, endpoint]);
}
