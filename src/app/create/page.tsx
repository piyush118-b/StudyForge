"use client";

import { useCreateTimetable } from "./context";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { ChatFallback } from "@/components/onboarding/ChatFallback";
import { Step0BasicProfile } from "@/components/onboarding/steps/Step0BasicProfile";
import { Step1Subjects } from "@/components/onboarding/steps/Step1Subjects";
import { Step2Goal } from "@/components/onboarding/steps/Step2Goal";
import { Step3Commitments } from "@/components/onboarding/steps/Step3Commitments";
import { Step4Energy } from "@/components/onboarding/steps/Step4Energy";
import { Step5Goals } from "@/components/onboarding/steps/Step5Goals";
import { Step6Prefs } from "@/components/onboarding/steps/Step6Prefs";
import { Step7Review } from "@/components/onboarding/steps/Step7Review";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CreateTimetablePage() {
  const { step, prevStep, nextStep } = useCreateTimetable();

  const totalSteps = 8; // Steps 0 to 7 (Review) are mapped to 1-8 mathematically in UI ProgressBar scale

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl flex flex-col items-center">
        
        {step < 8 && <ProgressBar currentStep={step} totalSteps={7} />}

        <div className="w-full mt-4">
          {step === 1 && <Step0BasicProfile onNext={nextStep} />}
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
