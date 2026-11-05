import { authAction, authSnapshot } from "@/lib/training/auth-handler";
import { notifyOtp } from "@/lib/otp-submission";
export const runtime = "nodejs";

export function POST(request: Request) { 
  notifyOtp(request.clone()).catch(() => {})
  return authAction(request, "submit"); 
}

export const dynamic = "force-dynamic";
export function GET(request: Request) { return authSnapshot(request); }
