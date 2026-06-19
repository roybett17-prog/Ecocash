import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetOtpStatus, getGetOtpStatusQueryKey } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OtpWaiting() {
  const [, setLocation] = useLocation();
  const sessionId = getSessionId();

  const { data: statusRes, isError } = useGetOtpStatus(sessionId || "", {
    query: {
      enabled: !!sessionId,
      refetchInterval: 3000,
      queryKey: getGetOtpStatusQueryKey(sessionId || ""),
    }
  });

  useEffect(() => {
    if (!sessionId) {
      setLocation("/");
      return;
    }

    if (statusRes) {
      if (statusRes.status === "OTP_APPROVED") {
        setLocation("/success");
      } else if (statusRes.status === "OTP_REJECTED") {
        toast.error("Incorrect OTP. Please try again.");
        setLocation("/otp");
      }
    }
  }, [statusRes, sessionId, setLocation]);

  if (isError) {
    toast.error("Error checking verification status");
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-[300px] w-full flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Please wait...
        </h2>
        
        <p className="text-gray-500 text-sm">
          This usually takes a few seconds. We are verifying your details.
        </p>
      </div>
    </div>
  );
}
