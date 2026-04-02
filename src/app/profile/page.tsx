"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CategorizedCombobox } from '@/components/ui/categorized-combobox';
import { INDIAN_COLLEGES, BRANCHES, SEMESTERS } from '@/lib/constants';
import { BookOpen, ArrowRight, X, Sparkles, Loader2 } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 z-10">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">StudyForge <span className="text-indigo-400">AI</span></span>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Let&apos;s get to know you 👋</h1>
          </div>
          <p className="text-slate-400 text-sm mb-8 ml-[52px]">Help us tweak the AI to match your academic level.</p>

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">What should we call you?</Label>
              <Input 
                placeholder="E.g. Rahul" 
                className="bg-slate-950 border-slate-700 text-white rounded-xl h-12 focus:border-indigo-500"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">College / University</Label>
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
                    className="bg-slate-950 border-indigo-500/50 text-white rounded-xl h-12 w-full pr-12"
                    value={college}
                    autoFocus
                    onChange={e => setCollege(e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-slate-400 hover:text-white" onClick={() => setShowCustomCollege(false)}>
                    <X className="w-4 h-4"/>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Semester / Year</Label>
              <Select value={semester} onValueChange={val => setSemester(val || '')}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white rounded-xl h-12">
                  <SelectValue placeholder="Select your current semester" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-[300px]">
                  {SEMESTERS.map(sem => (
                    <SelectItem key={sem} value={sem} className="hover:bg-slate-800 cursor-pointer">{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Branch / Stream</Label>
              {!showCustomBranch ? (
                <CategorizedCombobox 
                  categories={BRANCHES}
                  value={branch}
                  onChange={setBranch}
                  placeholder="Search your stream..."
                  emptyText="Stream not listed."
                  customAddText="+ My stream isn&apos;t listed"
                  onCustomAdd={() => { setShowCustomBranch(true); setBranch(''); }}
                />
              ) : (
                <div className="flex gap-2 relative">
                  <Input 
                    placeholder="Type your stream name" 
                    className="bg-slate-950 border-indigo-500/50 text-white rounded-xl h-12 w-full pr-12"
                    value={branch}
                    autoFocus
                    onChange={e => setBranch(e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-slate-400 hover:text-white" onClick={() => setShowCustomBranch(false)}>
                    <X className="w-4 h-4"/>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="px-8 py-5 border-t border-slate-800/50 bg-slate-900/40 flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
