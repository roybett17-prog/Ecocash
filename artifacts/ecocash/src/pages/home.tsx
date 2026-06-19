import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShieldCheck, Percent } from "lucide-react";

export default function Home() {
  const [amount, setAmount] = useState(1000);
  const [term, setTerm] = useState(12);
  const [, setLocation] = useLocation();

  const monthlyRepayment = (amount * 1.15) / term;

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col relative pb-10">
      <header className="pt-8 pb-4 flex justify-center w-full z-10 bg-transparent">
        <div className="text-3xl font-bold tracking-tight">
          <span className="text-blue-950">Eco</span>
          <span className="text-blue-600">Cash</span>
        </div>
      </header>

      <div className="gradient-hero text-white pt-10 pb-24 px-6 rounded-b-[40px] -mt-[72px] pt-[112px]">
        <h1 className="text-3xl font-semibold mb-2">Get Your Loan Approved Fast</h1>
        <p className="text-blue-100 opacity-90 text-sm">Quick approval • Competitive rates • Flexible terms</p>
      </div>

      <div className="px-5 -mt-16 z-20">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Loan Calculator</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-500">Loan Amount</span>
                <span className="text-xl font-bold text-blue-600">${amount.toLocaleString()}</span>
              </div>
              <Slider
                value={[amount]}
                min={100}
                max={5000}
                step={50}
                onValueChange={(val) => setAmount(val[0])}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>$100</span>
                <span>$5,000</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-500">Loan Term</span>
                <span className="text-xl font-bold text-blue-600">{term} months</span>
              </div>
              <Slider
                value={[term]}
                min={6}
                max={60}
                step={1}
                onValueChange={(val) => setTerm(val[0])}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>6 mos</span>
                <span>60 mos</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 flex flex-col items-center border border-blue-100">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Estimated Monthly Repayment</span>
              <span className="text-3xl font-bold text-gray-900">${monthlyRepayment.toFixed(2)}</span>
            </div>

            <Button 
              className="w-full gradient-blue text-white rounded-xl h-12 text-lg font-medium shadow-md shadow-blue-500/20"
              onClick={() => setLocation("/apply")}
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 px-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">Why choose us</h3>
        
        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Fast Approval</h4>
            <p className="text-xs text-gray-500">Get funds in your account within minutes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Low Interest Rates</h4>
            <p className="text-xs text-gray-500">Competitive rates starting at just 15% APR</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Secure Processing</h4>
            <p className="text-xs text-gray-500">Bank-level encryption for your data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
