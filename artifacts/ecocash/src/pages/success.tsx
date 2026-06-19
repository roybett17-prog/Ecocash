import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSessionId } from "@/lib/session";
import { motion } from "framer-motion";

export default function Success() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear session when they reach the end
    clearSessionId();
  }, []);

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto gradient-blue flex flex-col items-center justify-center p-8 text-center text-white">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/20">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-4 tracking-tight">
          Verification Successful
        </h1>
        
        <p className="text-blue-100 text-lg mb-12 opacity-90">
          Congratulations! Your submission has been approved.
        </p>
      </motion.div>

      <motion.div
        className="w-full mt-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-xl h-14 text-lg font-bold shadow-lg" 
          onClick={() => setLocation("/")}
        >
          Done
        </Button>
      </motion.div>
    </div>
  );
}
