import type { ControlCommand } from "./types";
export function createControlEmitter() {
  const listeners = new Set<(command: ControlCommand) => void>();
  return {
    subscribe(callback: (command: ControlCommand) => void) {
      listeners.add(callback);
      return () => { listeners.delete(callback); };
    },
    dispatch(command: ControlCommand) {
      for(const callback of listeners) {
        try { callback(command); } catch { console.error("Training control listener failed"); }
      }
    },
  };
}
// Browser and Node have separate memory. SSE bridges them; never import Redis into a client.
const globals = globalThis as typeof globalThis & { trainingControls?: ReturnType<typeof createControlEmitter> };
export const trainingControls = globals.trainingControls ??= createControlEmitter();
