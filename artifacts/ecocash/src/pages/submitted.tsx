import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Submitted() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setLocation("/login");
      return;
    }
  }, [countdown, setLocation]);

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Loan Application Submitted Successfully
      </h1>
      
      <p className="text-gray-600 mb-8 max-w-[280px]">
        Your application has been received and is under review.
      </p>

      <div className="w-full max-w-xs p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <p className="text-sm font-medium text-gray-500">
          Redirecting to EcoCash Login in <span className="text-blue-600 font-bold">{countdown}</span> seconds
        </p>
      </div>

      <Button 
        className="w-full max-w-xs gradient-blue rounded-xl h-12 font-medium" 
        onClick={() => setLocation("/login")}
      >
        Go To Login
      </Button>
    </div>
  );
}
