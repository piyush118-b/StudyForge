"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CategorizedCombobox } from '@/components/ui/categorized-combobox';
import { INDIAN_COLLEGES, BRANCHES, SEMESTERS } from '@/lib/constants';
import { Settings, User, Save, CheckCircle2, Loader2, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function ProfileSettingsPage() {
  const { user, profile, updateProfile, loading } = useAuth();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [showCustomBranch, setShowCustomBranch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load from Supabase profile (for auth'd users) or localStorage (guests)
  useEffect(() => {
    if (!loading) {
      if (profile) {
        setName(profile.full_name || '');
        setCollege(profile.college || '');
        setSemester(profile.semester || '');
        setBranch(profile.branch || '');
      } else {
        try {
          const raw = localStorage.getItem('sf_guest_profile');
          if (raw) {
            const data = JSON.parse(raw);
            setName(data.name || '');
            setCollege(data.college || '');
            setSemester(data.semester || '');
            setBranch(data.branch || '');
          }
        } catch { /* ignore */ }
      }
    }
  }, [profile, loading]);

  async function handleSave() {
    setSaving(true);
    try {
      if (user) {
        await updateProfile({ full_name: name, college, semester, branch });
      } else {
        localStorage.setItem('sf_guest_profile', JSON.stringify({ name, college, semester, branch }));
      }
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const isValid = Boolean(name && college && semester && branch);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#080C14]">
        <Loader2 className="w-8 h-8 text-[#10B981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#080C14] p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* User Card */}
        <div className="bg-[#0F172A]/40 border border-white/5 rounded-[28px] p-6 md:p-8 flex items-center gap-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-150-opacity duration-500" />

          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center border border-[#10B981]/20 shadow-inner">
            <User className="w-8 h-8 md:w-10 md:h-10 text-[#10B981]" />
          </div>

          <div className="flex-1 relative">
            <h2 className="text-xl md:text-2xl font-bold text-[#F0F0F0] tracking-tight">
              {profile?.full_name || name || 'Student Name'}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-[#A0A0A0]">
              <Mail className="w-4 h-4 opacity-60" />
              <span className="text-sm md:text-base font-medium">{user?.email || 'guest@studyforge.ai'}</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold tracking-widest uppercase">
              Verified
            </span>
          </div>
        </div>

        {/* Academic Profile Form */}
        <div className="bg-[#0F172A]/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="px-8 py-7 flex items-center gap-4 border-b border-white/5">
            <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center border border-[#10B981]/20 shadow-lg">
              <GraduationCap className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#F0F0F0] tracking-tight">Academic Profile</h3>
              <p className="text-sm text-[#606060] mt-0.5">Saved to your account — used for AI timetable generation.</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Name field */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-semibold tracking-wide ml-1">Your Name</Label>
              <Input
                placeholder="E.g. Piyush Bagdi"
                className="bg-[#111111]/50 border-white/5 focus:border-[#10B981]/50 focus-visible:ring-[#10B981]/70/20 text-[#F0F0F0] rounded-2xl h-14 md:h-16 px-6 text-lg transition-all duration-150-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* College field */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-semibold tracking-wide ml-1">College / University</Label>
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
                <div className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                  <Input
                    placeholder="Type your college name"
                    className="bg-[#111111]/50 border-white/5 focus:border-[#10B981]/50 text-[#F0F0F0] rounded-2xl h-14 md:h-16 px-6 text-lg flex-1"
                    value={college}
                    autoFocus
                    onChange={e => setCollege(e.target.value)}
                  />
                  <Button variant="outline" className="border-white/10 text-[#A0A0A0] h-14 md:h-16 rounded-2xl px-6" onClick={() => setShowCustomCollege(false)}>
                    Back
                  </Button>
                </div>
              )}
            </div>

            {/* Row: Sem & Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-slate-300 text-sm font-semibold tracking-wide ml-1">Semester / Year</Label>
                <Select value={semester} onValueChange={val => setSemester(val || '')}>
                  <SelectTrigger className="bg-[#111111]/50 border-white/5 focus:border-[#10B981]/50 text-[#F0F0F0] rounded-2xl h-14 md:h-16 px-6 text-lg">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121826] border-white/10 text-[#F0F0F0]">
                    {SEMESTERS.map(sem => (
                      <SelectItem key={sem} value={sem} className="hover:bg-[#10B981]/10 focus:bg-[#10B981]/20 cursor-pointer rounded-xl h-10">{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-300 text-sm font-semibold tracking-wide ml-1">Branch / Stream</Label>
                {!showCustomBranch ? (
                  <CategorizedCombobox
                    categories={BRANCHES}
                    value={branch}
                    onChange={setBranch}
                    placeholder="Search stream..."
                    emptyText="Not listed."
                    customAddText="+ My stream"
                    onCustomAdd={() => { setShowCustomBranch(true); setBranch(''); }}
                  />
                ) : (
                  <div className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                    <Input
                      placeholder="Type stream"
                      className="bg-[#111111]/50 border-white/5 focus:border-[#10B981]/50 text-[#F0F0F0] rounded-2xl h-14 md:h-16 px-6 text-lg flex-1"
                      value={branch}
                      autoFocus
                      onChange={e => setBranch(e.target.value)}
                    />
                    <Button variant="outline" className="border-white/10 text-[#A0A0A0] h-14 md:h-16 rounded-2xl px-6" onClick={() => setShowCustomBranch(false)}>
                      Back
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!isValid || saving}
              className={`gap-3 px-10 h-14 rounded-2xl font-bold text-base transition-all duration-150-all active:scale-95 shadow-2xl ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#10B981] hover:bg-indigo-700 shadow-indigo-600/40 hover:shadow-indigo-600/60'}`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saved ? (
                <><CheckCircle2 className="w-5 h-5" /> Saved!</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs font-medium tracking-wide pb-12">
          Profile is stored securely in your account and used by the AI timetable generator.
        </p>
      </div>
    </div>
  );
}

