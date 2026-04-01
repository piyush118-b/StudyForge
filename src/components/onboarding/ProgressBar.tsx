import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const MESSAGES = [
  "Let's get to know you 👋",
  "What are you studying? 📚",
  "How much to study daily? ⏱️",
  "Fixed commitments 🔒",
  "How does your brain work? 🧠",
  "Goals & Constraints 🎯",
  "A few more things... ✨",
  "Review everything 🧾",
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const value = (currentStep / totalSteps) * 100;
  const message = MESSAGES[currentStep - 1] || "Just a sec...";

  return (
    <div className="w-full space-y-2 mb-8 px-4">
      <div className="flex justify-between text-sm font-medium text-white/70">
        <span>Step {currentStep} of {totalSteps}</span>
        <span className="text-teal-400 font-semibold">{message}</span>
      </div>
      <Progress value={value} className="h-2 bg-white/10" />
    </div>
  );
}
