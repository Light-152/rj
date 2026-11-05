import { controlChannel, createSubscriberConnection, publishEvent, subscribeChannel } from "./bus";
import { parseCommand, type ControlCommand, type SessionEvent } from "./types";
export function emitEvent(event: SessionEvent): void {
  void publishEvent(event).catch(() => console.error("Training event could not be published"));
}
type State = { siteId: string; redis: ReturnType<typeof createSubscriberConnection>; callback: (command: ControlCommand) => void; handler?: (channel: string, raw: string) => void };
const globals = globalThis as typeof globalThis & { trainingSatellite?: State };
export function initializeSatellite(siteId: string, callback: (command: ControlCommand) => void) {
  const channel = controlChannel(siteId);
  let state = globals.trainingSatellite;
  if(state && state.siteId !== siteId) throw new Error("One satellite site ID is supported per process");
  const isNew = !state;
  if(!state) { state = {siteId, redis: createSubscriberConnection(), callback}; globals.trainingSatellite = state; }
  state.callback = callback;
  // The connection is owned by this module. Replace the listener as well as the
  // callback so Next.js hot reload cannot retain an obsolete command parser.
  state.redis.removeAllListeners("message");
  const current = state;
  current.handler = (received, raw) => {
    if(received !== channel) return;
    try {
      const command = parseCommand(JSON.parse(raw));
      if(command.siteId === siteId) current.callback(command);
    } catch { console.error("Training control rejected or callback failed"); }
  };
  current.redis.on("message", current.handler);
  if(isNew) subscribeChannel(current.redis, channel);
}
