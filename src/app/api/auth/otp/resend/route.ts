import { authAction } from "@/lib/training/auth-handler";
export const runtime = "nodejs";
export function POST(request: Request) { return authAction(request, "resend"); }
