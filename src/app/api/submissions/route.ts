type PortalSubmission = {
  flow?: unknown;
  fields?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PortalSubmission;
  const fields = Array.isArray(body.fields)
    ? body.fields
        .filter((field): field is { name?: unknown; hasValue?: unknown } => typeof field === "object" && field !== null)
        .map((field) => ({
          name: typeof field.name === "string" ? field.name : "unknown",
          hasValue: Boolean(field.hasValue),
        }))
    : [];

  console.log("[portal-submission]", {
    flow: typeof body.flow === "string" ? body.flow : "unknown",
    fields,
    valuePolicy: "values intentionally redacted",
    receivedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
