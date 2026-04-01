"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserData, FixedCommitment, Deadline, Subject } from "@/lib/types";

// Default Initial State covering all Step 1-6 expansions
const defaultUserData: UserData = {
  name: "",
  college: "",
  semester: "",
  branch: "",
  dailyHours: "8 hrs",
  subjects: [],
  commitments: [
    { id: "sleep-1", type: "Sleep", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], startTime: "23:00", endTime: "06:30" }
  ],
  energyLevel: "Morning Person", 
  chronotype: "Morning Person",
  peakWindow: "10 AM – 2 PM",
  breaksFreq: "Normal",
  breakLength: "15 min",
  sessionLength: "45 min",
  mainGoals: [],
  deadlines: [],
  heavyLightDays: {},
  hardConstraints: [],
  learningStyles: [],
  revisionPref: "Smart (AI decides)",
  pomodoroPref: "Classic",
  culturalPrefs: [],
  bufferTime: "30 min",
  displayFormat: "Combined"
};

interface CreateTimetableContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  updateField: <K extends keyof UserData>(field: K, value: UserData[K]) => void;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  nextStep: () => void;
  prevStep: () => void;
}

const CreateTimetableContext = createContext<CreateTimetableContextType | undefined>(undefined);

export function CreateTimetableProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [step, setStep] = useState(1);

  const updateField = <K extends keyof UserData>(field: K, value: UserData[K]) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => Math.min(8, s + 1)); // 0: Profile, 1: Subj, 2: Goal, 3: Commit, 4: Energy, 5: Goals, 6: Prefs, 7: Review... wait.
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  return (
    <CreateTimetableContext.Provider value={{ userData, setUserData, updateField, step, setStep, nextStep, prevStep }}>
      {children}
    </CreateTimetableContext.Provider>
  );
}

export function useCreateTimetable() {
  const context = useContext(CreateTimetableContext);
  if (context === undefined) {
    throw new Error("useCreateTimetable must be used within a CreateTimetableProvider");
  }
  return context;
}
