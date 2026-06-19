import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetApplicationStatus, getGetApplicationStatusQueryKey } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Waiting() {
  const [, setLocation] = useLocation();
  const sessionId = getSessionId();

  const { data: statusRes, isError } = useGetApplicationStatus(sessionId || "", {
    query: {
      enabled: !!sessionId,
      refetchInterval: 3000,
      queryKey: getGetApplicationStatusQueryKey(sessionId || ""),
    }
  });

  useEffect(() => {
    if (!sessionId) {
      setLocation("/");
      return;
    }

    if (statusRes) {
      if (statusRes.status === "LOGIN_APPROVED") {
        setLocation("/otp");
      }
    }
  }, [statusRes, sessionId, setLocation]);

  if (isError) {
    toast.error("Error checking status");
  }

  const isRejected = statusRes?.status === "LOGIN_REJECTED";

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      {isRejected ? (
        <>
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Application Not Approved
          </h1>
          
          <p className="text-red-600 mb-8 max-w-[280px]">
            Your application was not approved. Please check your credentials and try again.
          </p>

          <Button 
            className="w-full max-w-xs rounded-xl h-12 font-medium" 
            variant="outline"
            onClick={() => setLocation("/login")}
          >
            Go Back
          </Button>
        </>
      ) : (
        <>
          <div className="relative w-24 h-24 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">Eco</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Your application is under review
          </h1>
          
          <p className="text-gray-500 max-w-[280px]">
            Please wait while our team reviews your information.
          </p>
        </>
      )}
    </div>
  );
}
