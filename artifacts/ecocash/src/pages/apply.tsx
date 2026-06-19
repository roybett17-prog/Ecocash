import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitApplication } from "@workspace/api-client-react";
import { setSessionId } from "@/lib/session";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Apply() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const submitApplication = useSubmitApplication();

  const [formData, setFormData] = useState({
    loanType: "Personal",
    loanAmount: "1000",
    loanTerm: "12",
    loanPurpose: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    employmentStatus: "Employed",
    monthlyIncome: "500"
  });

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = () => {
    submitApplication.mutate(
      {
        data: {
          loanType: formData.loanType,
          loanAmount: Number(formData.loanAmount),
          loanTerm: Number(formData.loanTerm),
          loanPurpose: formData.loanPurpose,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          employmentStatus: formData.employmentStatus,
          monthlyIncome: Number(formData.monthlyIncome)
        }
      },
      {
        onSuccess: (data) => {
          setSessionId(data.sessionId);
          setLocation("/submitted");
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col pb-6">
      <header className="pt-6 pb-4 px-5 flex items-center bg-white border-b border-gray-100 z-10 sticky top-0">
        <button onClick={() => step === 1 ? setLocation("/") : handlePrev()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 mr-3">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">Application</h1>
          <Progress value={(step / 3) * 100} className="h-1.5 mt-2 bg-gray-100" />
        </div>
      </header>

      <div className="flex-1 px-5 pt-6 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Loan Details</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select value={formData.loanType} onValueChange={(v) => updateForm("loanType", v)}>
                    <SelectTrigger className="h-12 bg-gray-50 border-transparent rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Loan Amount ($)</Label>
                  <Input 
                    type="number" 
                    value={formData.loanAmount} 
                    onChange={e => updateForm("loanAmount", e.target.value)}
                    className="h-12 bg-gray-50 border-transparent rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loan Term (months)</Label>
                  <Select value={formData.loanTerm} onValueChange={(v) => updateForm("loanTerm", v)}>
                    <SelectTrigger className="h-12 bg-gray-50 border-transparent rounded-xl">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                      <SelectItem value="36">36 Months</SelectItem>
                      <SelectItem value="60">60 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Purpose of Loan</Label>
                  <Textarea 
                    value={formData.loanPurpose} 
                    onChange={e => updateForm("loanPurpose", e.target.value)}
                    className="bg-gray-50 border-transparent rounded-xl min-h-[100px]"
                    placeholder="Briefly describe why you need this loan"
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button className="w-full gradient-blue h-12 rounded-xl text-lg font-medium" onClick={handleNext}>
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Info</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={formData.firstName} 
                    onChange={e => updateForm("firstName", e.target.value)}
                    className="h-12 bg-gray-50 border-transparent rounded-xl"
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={formData.lastName} 
                    onChange={e => updateForm("lastName", e.target.value)}
                    className="h-12 bg-gray-50 border-transparent rounded-xl"
                    placeholder="Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex h-12 rounded-xl bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="px-3 flex items-center justify-center bg-gray-100 border-r border-gray-200 text-gray-600 font-medium">
                      +263
                    </div>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={e => updateForm("phoneNumber", e.target.value)}
                      className="flex-1 bg-transparent px-3 outline-none"
                      placeholder="77 123 4567"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="w-full h-12 rounded-xl" onClick={handlePrev}>
                  Previous
                </Button>
                <Button className="w-full gradient-blue h-12 rounded-xl font-medium" onClick={handleNext}>
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Info</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(v) => updateForm("employmentStatus", v)}>
                    <SelectTrigger className="h-12 bg-gray-50 border-transparent rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employed">Employed</SelectItem>
                      <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monthly Income ($)</Label>
                  <Input 
                    type="number" 
                    value={formData.monthlyIncome} 
                    onChange={e => updateForm("monthlyIncome", e.target.value)}
                    className="h-12 bg-gray-50 border-transparent rounded-xl"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="w-full h-12 rounded-xl" onClick={handlePrev} disabled={submitApplication.isPending}>
                  Previous
                </Button>
                <Button 
                  className="w-full gradient-blue h-12 rounded-xl font-medium" 
                  onClick={handleSubmit}
                  disabled={submitApplication.isPending}
                >
                  {submitApplication.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
