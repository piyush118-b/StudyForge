"use client";

import { useState } from "react";
import { useCreateTimetable } from "@/app/create/context";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CategorizedCombobox } from "@/components/ui/categorized-combobox";
import { INDIAN_COLLEGES, BRANCHES, SEMESTERS } from "@/lib/constants";
import { X, ArrowRight } from "lucide-react";

export function Step0BasicProfile({ onNext }: { onNext: () => void }) {
  const { userData, updateField, saveProfile } = useCreateTimetable();
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomBranch, setShowCustomBranch] = useState(false);

  const isValid = Boolean(userData.name && userData.college && userData.semester && userData.branch);

  function handleNext() {
    saveProfile();
    onNext();
  }

  return (
    <StepCard title="Let's get to know you 👋" description="Help us tweak the AI to match your academic level.">
      <div className="space-y-6 pb-6 border-b border-white/5">
        
        <div className="space-y-2">
          <Label className="text-white/70">What should we call you?</Label>
          <Input 
            placeholder="E.g. Rahul" 
            className="bg-slate-900 border-white/20 text-white rounded-xl h-12"
            value={userData.name}
            onChange={e => updateField("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/70">College / University</Label>
          {!showCustomCollege ? (
            <CategorizedCombobox 
              categories={INDIAN_COLLEGES}
              value={userData.college}
              onChange={(val) => updateField("college", val)}
              placeholder="Search your college..."
              emptyText="College not listed."
              customAddText="+ Add my college"
              onCustomAdd={() => {
                setShowCustomCollege(true);
                updateField("college", "");
              }}
            />
          ) : (
            <div className="flex gap-2 relative">
              <Input 
                placeholder="Type your college name" 
                className="bg-slate-900 border-teal-500/50 text-white rounded-xl h-12 w-full pr-12"
                value={userData.college}
                autoFocus
                onChange={e => updateField("college", e.target.value)}
              />
              <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setShowCustomCollege(false)}>
                <X className="w-4 h-4"/>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white/70">Semester / Year</Label>
          <Select value={userData.semester} onValueChange={val => updateField("semester", val || "")}>
            <SelectTrigger className="w-full bg-slate-900 border-white/20 text-white rounded-xl h-12">
              <SelectValue placeholder="Select your current semester" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20 text-white max-h-[300px]">
              {SEMESTERS.map(sem => (
                <SelectItem key={sem} value={sem} className="hover:bg-slate-800 cursor-pointer">{sem}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white/70">Branch / Stream</Label>
          {!showCustomBranch ? (
            <CategorizedCombobox 
              categories={BRANCHES}
              value={userData.branch}
              onChange={(val) => updateField("branch", val)}
              placeholder="Search your stream..."
              emptyText="Stream not listed."
              customAddText="+ My stream isn't listed — I'll type it"
              onCustomAdd={() => {
                setShowCustomBranch(true);
                updateField("branch", "");
              }}
            />
          ) : (
            <div className="flex gap-2 relative">
              <Input 
                placeholder="Type your stream name" 
                className="bg-slate-900 border-teal-500/50 text-white rounded-xl h-12 w-full pr-12"
                value={userData.branch}
                autoFocus
                onChange={e => updateField("branch", e.target.value)}
              />
              <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setShowCustomBranch(false)}>
                <X className="w-4 h-4"/>
              </Button>
            </div>
          )}
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={!isValid} className="bg-white text-black hover:bg-slate-200 px-8">
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </StepCard>
  );
}
