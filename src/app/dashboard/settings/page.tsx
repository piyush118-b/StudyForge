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

export default function SettingsPage() {
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
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <Settings className="w-8 h-8 text-indigo-400" />
          </div>
          Settings
        </h1>
        <p className="text-slate-400 mt-3">Manage your profile and academic preferences.</p>
      </div>

      {/* Account Info (read-only for auth'd users) */}
      {user && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
            <User className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">{profile?.full_name || name || 'Student'}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            Verified
          </span>
        </div>
      )}

      {/* Academic Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Academic Profile</h2>
            <p className="text-xs text-slate-500">
              {user ? 'Saved to your account — used for AI timetable generation.' : 'Saved locally on this device.'}
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-slate-300">Your Name</Label>
            <Input 
              placeholder="E.g. Rahul" 
              className="bg-slate-950 border-slate-700 text-white rounded-xl h-12"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">College / University</Label>
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
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your college name" 
                  className="bg-slate-950 border-slate-700 text-white rounded-xl h-12 flex-1"
                  value={college}
                  autoFocus
                  onChange={e => setCollege(e.target.value)}
                />
                <Button variant="outline" className="border-slate-700 text-slate-400" onClick={() => setShowCustomCollege(false)}>
                  Back
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Semester / Year</Label>
              <Select value={semester} onValueChange={val => setSemester(val || '')}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white rounded-xl h-12">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-[300px]">
                  {SEMESTERS.map(sem => (
                    <SelectItem key={sem} value={sem} className="hover:bg-slate-800 cursor-pointer">{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Branch / Stream</Label>
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
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type stream" 
                    className="bg-slate-950 border-slate-700 text-white rounded-xl h-12 flex-1"
                    value={branch}
                    autoFocus
                    onChange={e => setBranch(e.target.value)}
                  />
                  <Button variant="outline" className="border-slate-700 text-slate-400" onClick={() => setShowCustomBranch(false)}>
                    Back
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={!isValid || saving}
            className={`gap-2 px-6 transition-all ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center">
        {user ? 'Profile is stored securely in your account and used by the AI timetable generator.' : 'Sign in to save your profile to the cloud and access it from any device.'}
      </p>
    </div>
  );
}
