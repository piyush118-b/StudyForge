"use client";

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);
    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Magic link sent! Check your inbox.");
      } else {
        if (!password) {
          toast.error("Please enter your password");
          setIsLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        const savedProfile = localStorage.getItem('sf_guest_profile');
        router.push(savedProfile ? '/dashboard' : '/profile');
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to sign in. Please try again.");
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-[#F0F0F0] mb-1 tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#A0A0A0]">Sign in to your StudyForge account</p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={signInWithGoogle}
            type="button"
            className="w-full flex items-center justify-center gap-3 h-11 bg-[#222222] border border-[#2A2A2A] rounded-lg text-sm font-medium text-[#F0F0F0] hover:bg-[#2A2A2A] hover:border-[#333333] transition-all duration-150 active:scale-[0.98] mb-6 cursor-pointer"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* OR Divider */}
          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-[#2A2A2A]" />
            <span className="text-xs text-[#606060] flex-shrink-0">or continue with email</span>
            <div className="flex-1 border-t border-[#2A2A2A]" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-[0.6rem] h-4 w-4 text-[#606060]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9 h-11 bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] placeholder:text-[#606060] rounded-lg hover:border-[#333333] focus-visible:ring-[#10B981]/70 focus-visible:border-[#10B981]/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            {!isMagicLink && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#606060]">
                    Password
                  </label>
                  <a href="/auth/forgot" className="text-xs text-[#10B981] hover:text-[#34D399] transition-colors duration-150">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-[0.6rem] h-4 w-4 text-[#606060]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-11 bg-[#222222] border-[#2A2A2A] text-[#F0F0F0] placeholder:text-[#606060] rounded-lg hover:border-[#333333] focus-visible:ring-[#10B981]/70 focus-visible:border-[#10B981]/50 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isMagicLink}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 h-11 bg-[#10B981] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#34D399] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_40px_rgba(16,185,129,0.25)] transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : isMagicLink ? "Send Magic Link" : "Sign In"}
            </button>
          </form>

          {/* Magic link toggle */}
          <button
            type="button"
            onClick={() => setIsMagicLink(!isMagicLink)}
            className="w-full text-sm text-[#606060] hover:text-[#A0A0A0] transition-colors mt-4 text-center"
          >
            {isMagicLink ? "Use password instead" : "Send me a magic link instead"}
          </button>

          {/* Switch links */}
          <div className="border-t border-[#2A2A2A] mt-6 pt-6 space-y-3">
            <p className="text-center text-sm text-[#606060]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-[#10B981] hover:text-[#34D399] font-medium transition-colors duration-150">
                Create one free →
              </Link>
            </p>
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 text-sm text-[#606060] hover:text-[#A0A0A0] transition-colors"
            >
              Continue without account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
