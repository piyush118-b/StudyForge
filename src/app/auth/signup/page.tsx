"use client";

import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  
  const getPasswordStrength = (pwd: string): number => {
    let score = 0
    if (pwd.length >= 8)  score++
    if (pwd.length >= 12) score++
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    return Math.min(score, 4)
  }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
      
      if (data.session) {
        toast.success("Account created! Let's set up your profile.");
        router.push('/profile');
      } else {
        toast.info("Check your email to confirm your account!");
        router.push('/auth/login');
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#10B981]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#1F1F1F_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.5)] p-8">

          {/* Logo + Heading */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-150-all">
                <BookOpen className="w-5 h-5 text-[#F0F0F0]" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-1 tracking-tight">Create your account</h1>
            <p className="text-sm text-[#A0A0A0]">Start your AI-powered academic journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-[0.6rem] h-4 w-4 text-[#606060]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Rahul Kumar"
                  className="pl-9 h-11 bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] placeholder:text-[#606060] rounded-lg hover:border-[#333333] focus-visible:ring-[#10B981]/70 focus-visible:border-[#10B981]/50 transition-all duration-150-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-[0.6rem] h-4 w-4 text-[#606060] z-10" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`
                    pl-9 w-full h-11 px-3 rounded-lg text-sm
                    bg-[#222222] border transition-all duration-150
                    placeholder:text-[#606060] text-[#F0F0F0]
                    focus-visible:outline-none focus-visible:ring-2
                    ${email.length > 0 && !email.includes('@')
                      ? 'border-[#EF4444]/60 focus-visible:ring-[#EF4444]/30'
                      : email.length > 0 && email.includes('@') && email.includes('.')
                      ? 'border-[#10B981]/60 focus-visible:ring-[#10B981]/30'
                      : 'border-[#2A2A2A] hover:border-[#333333] focus-visible:ring-[#10B981]/30'
                    }
                  `}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {/* Validation icon */}
                {email.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {!email.includes('@') ? (
                      <svg className="w-4 h-4 text-[#EF4444]" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    ) : email.includes('.') ? (
                      <svg className="w-4 h-4 text-[#10B981]" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-[0.6rem] h-4 w-4 text-[#606060] z-10" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`
                    pl-9 w-full h-11 px-3 rounded-lg text-sm
                    bg-[#222222] border transition-all duration-150
                    placeholder:text-[#606060] text-[#F0F0F0]
                    focus-visible:outline-none focus-visible:ring-2
                    ${password.length > 0 && getPasswordStrength(password) < 2
                      ? 'border-[#EF4444]/60 focus-visible:ring-[#EF4444]/30'
                      : password.length > 0 && getPasswordStrength(password) >= 3
                      ? 'border-[#10B981]/60 focus-visible:ring-[#10B981]/30'
                      : 'border-[#2A2A2A] hover:border-[#333333] focus-visible:ring-[#10B981]/30'
                    }
                  `}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                
                {/* Validation icon */}
                {password.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getPasswordStrength(password) < 2 ? (
                      <svg className="w-4 h-4 text-[#EF4444]" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    ) : getPasswordStrength(password) >= 3 ? (
                      <svg className="w-4 h-4 text-[#10B981]" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : null}
                  </div>
                )}
              </div>

              {password.length > 0 && (() => {
                const passwordStrength = getPasswordStrength(password);
                return (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`
                            h-1 flex-1 rounded-full transition-all duration-300
                            ${level <= passwordStrength
                              ? passwordStrength === 1 ? 'bg-[#EF4444]'
                              : passwordStrength === 2 ? 'bg-[#F59E0B]'
                              : passwordStrength === 3 ? 'bg-[#3B82F6]'
                              :                          'bg-[#10B981]'
                              : 'bg-[#2A2A2A]'
                            }
                          `}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-[#606060]">
                      {passwordStrength === 1 ? 'Weak — add numbers or symbols'
                      : passwordStrength === 2 ? 'Fair — try a longer password'
                      : passwordStrength === 3 ? 'Good — almost there'
                      :                          'Strong password ✓'}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-[0.6rem] h-4 w-4 text-[#606060]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-11 bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] placeholder:text-[#606060] rounded-lg hover:border-[#333333] focus-visible:ring-[#10B981]/70 focus-visible:border-[#10B981]/50 transition-all duration-150-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 h-11 bg-[#10B981] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#34D399] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_40px_rgba(16,185,129,0.25)] transition-all duration-150-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          {/* Switch link */}
          <div className="border-t border-[#2A2A2A] mt-6 pt-6">
            <p className="text-center text-sm text-[#606060]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#10B981] hover:text-[#34D399] font-medium transition-all duration-150-colors duration-150">
                Sign in →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
