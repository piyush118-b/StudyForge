"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CategorizedCombobox } from '@/components/ui/categorized-combobox';
import { INDIAN_COLLEGES, BRANCHES, SEMESTERS } from '@/lib/constants';
import { ArrowRight, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, updateProfile, loading } = useAuth();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomBranch, setShowCustomBranch] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pre-fill from Supabase profile once loaded
  useEffect(() => {
    if (!loading && profile) {
      // If profile is already fully complete, skip to dashboard
      if (profile.full_name && profile.college && profile.semester && profile.branch) {
        router.push('/dashboard');
        return;
      }
      // Otherwise pre-fill what we have
      setName(profile.full_name || '');
      setCollege(profile.college || '');
      setSemester(profile.semester || '');
      setBranch(profile.branch || '');
    }
  }, [profile, loading, router]);

  // Guest (no user) — use localStorage
  useEffect(() => {
    if (!loading && !user) {
      try {
        const raw = localStorage.getItem('sf_guest_profile');
        if (raw) {
          const data = JSON.parse(raw);
          if (data.name && data.college && data.semester && data.branch) {
            router.push('/dashboard');
            return;
          }
          setName(data.name || '');
          setCollege(data.college || '');
          setSemester(data.semester || '');
          setBranch(data.branch || '');
        }
      } catch { /* ignore */ }
    }
  }, [user, loading, router]);

  const isValid = Boolean(name && college && semester && branch);

  async function handleSubmit() {
    if (!isValid) return;
    setSaving(true);
    try {
      if (user) {
        // Authenticated — save to Supabase
        await updateProfile({
          full_name: name,
          college,
          semester,
          branch,
        });
      } else {
        // Guest — save to localStorage only
        localStorage.setItem('sf_guest_profile', JSON.stringify({ name, college, semester, branch }));
      }
      toast.success(`Welcome to StudyForge, ${name}! 🎉`);
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">

        {/* Logo mark */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
          <span className="font-bold text-[#F0F0F0] tracking-tight">StudyForge</span>
        </div>

        {/* Main card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">

          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#10B981] mb-2">
                Profile Setup
              </p>
              <h2 className="text-2xl font-bold text-[#F0F0F0] tracking-tight mb-1">
                Let&apos;s get to know you 👋
              </h2>
              <p className="text-sm text-[#A0A0A0]">
                Help us tweak the AI to match your academic level.
              </p>
            </div>

            <div className="border-t border-[#2A2A2A] mb-6" />

            {/* Form */}
            <div className="space-y-5">

              {/* Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                  What should we call you?
                </label>
                <Input
                  placeholder="E.g. Rahul"
                  className="h-10 bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] placeholder:text-[#606060] rounded-lg hover:border-[#333333] focus-visible:ring-[#10B981]/70 focus-visible:border-[#10B981]/50 transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* College */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                  College / University
                </label>
                {!showCustomCollege ? (
                  <CategorizedCombobox
                    categories={INDIAN_COLLEGES}
                    value={college}
                    onChange={setCollege}
                    placeholder="Search your college..."
                    emptyText="College not listed."
                    customAddText="+ Add my college"
                    onCustomAdd={() => { setShowCustomCollege(true); setCollege(''); }}
                  />
                ) : (
                  <div className="flex gap-2 relative">
                    <Input
                      placeholder="Type your college name"
                      className="h-10 w-full pr-12 bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] placeholder:text-[#606060] rounded-lg hover:border-[#333333] focus-visible:ring-[#10B981]/70 focus-visible:border-[#10B981]/50 transition-all"
                      value={college}
                      autoFocus
                      onChange={e => setCollege(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 h-8 w-8 rounded flex items-center justify-center text-[#606060] hover:text-[#F0F0F0] hover:bg-[#333333] transition-all"
                      onClick={() => setShowCustomCollege(false)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                  Semester / Year
                </label>
                <Select value={semester} onValueChange={val => setSemester(val || '')}>
                  <SelectTrigger className="h-10 w-full bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] rounded-lg hover:border-[#333333] focus:ring-[#10B981]/70 transition-all">
                    <SelectValue placeholder="Select your current semester" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] max-h-[300px]">
                    {SEMESTERS.map(sem => (
                      <SelectItem key={sem} value={sem} className="cursor-pointer hover:bg-[#222222] focus:bg-[#222222]">{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                  Branch / Stream
                </label>
                {!showCustomBranch ? (
                  <CategorizedCombobox
                    categories={BRANCHES}
                    value={branch}
                    onChange={setBranch}
                    placeholder="Search your stream..."
                    emptyText="Stream not listed."
                    customAddText="+ My stream isn't listed"
                    onCustomAdd={() => { setShowCustomBranch(true); setBranch(''); }}
                  />
                ) : (
                  <div className="flex gap-2 relative">
                    <Input
                      placeholder="Type your stream name"
                      className="h-10 w-full pr-12 bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] placeholder:text-[#606060] rounded-lg hover:border-[#333333] focus-visible:ring-[#10B981]/70 focus-visible:border-[#10B981]/50 transition-all"
                      value={branch}
                      autoFocus
                      onChange={e => setBranch(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 h-8 w-8 rounded flex items-center justify-center text-[#606060] hover:text-[#F0F0F0] hover:bg-[#333333] transition-all"
                      onClick={() => setShowCustomBranch(false)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Submit footer */}
          <div className="flex justify-between items-center px-8 py-5 border-t border-[#2A2A2A] bg-[#111111]/40">
            <span className="text-xs text-[#606060]">
              {isValid ? '✓ Ready to go' : 'Fill in all fields to continue'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="h-10 px-6 rounded-lg text-sm font-bold bg-[#10B981] text-[#0A0A0A] hover:bg-[#34D399] shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.6),0_0_40px_rgba(16,185,129,0.3)] transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
