// Netlify polls /api/auth/otp. Explicitly stop legacy EventSources.
export function trainingControlEvents() {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
