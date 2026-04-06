"use client";

import { useCreateTimetable } from "../context";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { ChatFallback } from "@/components/onboarding/ChatFallback";
import { Step1Subjects } from "@/components/onboarding/steps/Step1Subjects";
import { Step2Goal } from "@/components/onboarding/steps/Step2Goal";
import { Step3Commitments } from "@/components/onboarding/steps/Step3Commitments";
import { Step4Energy } from "@/components/onboarding/steps/Step4Energy";
import { Step5Goals } from "@/components/onboarding/steps/Step5Goals";
import { Step6Prefs } from "@/components/onboarding/steps/Step6Prefs";
import { Step7Review } from "@/components/onboarding/steps/Step7Review";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AICreatePage() {
  const { step, prevStep, nextStep } = useCreateTimetable();
  const router = useRouter();

  // Steps 2-7 mapped as "1 of 6" through "6 of 6" for the user
  const displayStep = step - 1; // step 2 → shows "1", step 7 → shows "6"
  const totalSteps = 6;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10B981]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-xl flex flex-col items-center relative z-10">
        
        <div className="w-full flex items-center justify-between mb-8">
           <Button variant="ghost" onClick={() => router.push('/create')} className="text-[#A0A0A0] hover:text-[#F0F0F0] group">
             <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-all duration-150-transform" />
             Back
           </Button>
           {step < 8 && <ProgressBar currentStep={displayStep} totalSteps={totalSteps} />}
           <div className="w-20" /> {/* Spacer */}
        </div>

        <div className="w-full mt-4">
          {step === 2 && <Step1Subjects onNext={nextStep} onBack={prevStep} />}
          {step === 3 && <Step2Goal onNext={nextStep} onBack={prevStep} />}
          {step === 4 && <Step3Commitments onNext={nextStep} onBack={prevStep} />}
          {step === 5 && <Step4Energy onNext={nextStep} onBack={prevStep} />}
          {step === 6 && <Step5Goals onNext={nextStep} onBack={prevStep} />}
          {step === 7 && <Step6Prefs onNext={nextStep} onBack={prevStep} />}
          {step === 8 && <Step7Review onBack={prevStep} />}
        </div>

        {step < 8 && <ChatFallback />}
      </div>
    </div>
  );
}
