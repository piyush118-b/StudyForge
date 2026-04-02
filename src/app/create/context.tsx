"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserData, FixedCommitment, Deadline, Subject } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

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
  saveProfile: () => void;
  hasExistingProfile: boolean;
}

const PROFILE_KEY = 'sf_guest_profile';

const PROFILE_FIELDS: (keyof UserData)[] = ['name', 'college', 'semester', 'branch'];

function loadSavedProfile(): Partial<UserData> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Validate it has the basic fields
    if (data.name && data.college && data.semester && data.branch) return data;
    return null;
  } catch {
    return null;
  }
}

const CreateTimetableContext = createContext<CreateTimetableContextType | undefined>(undefined);

export function CreateTimetableProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [step, setStep] = useState(2);
  const { profile } = useAuth();

  // On mount: load profile from Supabase (via auth context) or localStorage fallback
  useEffect(() => {
    if (profile?.full_name || profile?.college) {
      // Auth'd user — use Supabase data
      setUserData(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        college: profile.college || prev.college,
        semester: profile.semester || prev.semester,
        branch: profile.branch || prev.branch,
      }));
    } else {
      // Guest — fall back to localStorage
      const saved = loadSavedProfile();
      if (saved) setUserData(prev => ({ ...prev, ...saved }));
    }
  }, [profile]);

  const updateField = <K extends keyof UserData>(field: K, value: UserData[K]) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    if (typeof window === 'undefined') return;
    const profileData: Record<string, unknown> = {};
    for (const key of PROFILE_FIELDS) {
      profileData[key] = userData[key];
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
  };

  const nextStep = () => setStep(s => Math.min(8, s + 1));
  const prevStep = () => setStep(s => Math.max(2, s - 1)); // Can't go before step 2

  return (
    <CreateTimetableContext.Provider value={{ userData, setUserData, updateField, step, setStep, nextStep, prevStep, saveProfile, hasExistingProfile: true }}>
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
