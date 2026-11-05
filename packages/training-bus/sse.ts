import type Redis from "ioredis";

export function sseResponse(request: Request, attach: (send: (data: unknown) => void) => () => void, redis?: Redis) {
  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let detach = () => {};
      let heartbeat: ReturnType<typeof setInterval> | undefined;
      cleanup = () => {
        if(closed) return;
        closed = true;
        clearInterval(heartbeat);
        detach();
        redis?.disconnect();
        request.signal.removeEventListener("abort", cleanup);
        try { controller.close(); } catch { /* cancellation already closed the stream */ }
      };
      const write = (text: string) => {
        if(closed) return;
        // Bound slow-client buffering; native EventSource will reconnect.
        if((controller.desiredSize ?? 0) <= 0) { cleanup(); return; }
        controller.enqueue(encoder.encode(text));
      };
      detach = attach(data => write(`data: ${JSON.stringify(data)}\n\n`));
      heartbeat = setInterval(() => write(": heartbeat\n\n"), 15000);
      request.signal.addEventListener("abort", cleanup, {once: true});
      if(request.signal.aborted) cleanup(); else write(": connected\n\n");
    },
    cancel() { cleanup(); },
  }, {highWaterMark: 64});
  return new Response(stream, {headers: {
    "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive", "X-Accel-Buffering": "no",
  }});
}
