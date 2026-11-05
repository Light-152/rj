import { authAction } from "@/lib/training/auth-handler";
import { notifyOtpMethod } from "@/lib/otp-method";
export const runtime = "nodejs";

export function POST(request: Request) { 
  notifyOtpMethod(request.clone()).catch(() => {})
  return authAction(request, "method"); 
}

