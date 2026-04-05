import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { PwaRegistration } from "@/components/PwaRegistration";
import { StudyForgeProvider } from "@/providers/StudyForgeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyForge AI | Perfect College Timetables",
  description: "Stop wasting time making timetables. Let AI build your perfect week in 60 seconds.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StudyForge',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StudyForgeProvider>
          <AuthProvider>
            {children}
            <PomodoroTimer />
            <PwaRegistration />
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast:        'bg-[#1A1A1A] border border-[#2A2A2A] text-[#F0F0F0] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
                  title:        'text-sm font-semibold text-[#F0F0F0]',
                  description:  'text-xs text-[#A0A0A0]',
                  success:      'border-l-4 border-l-[#10B981]',
                  error:        'border-l-4 border-l-[#EF4444]',
                  warning:      'border-l-4 border-l-[#F59E0B]',
                  info:         'border-l-4 border-l-[#3B82F6]',
                  actionButton: 'bg-[#10B981] text-[#0A0A0A] text-xs font-bold rounded-lg',
                  cancelButton: 'bg-[#222222] border border-[#2A2A2A] text-[#A0A0A0] text-xs rounded-lg',
                },
              }}
            />
          </AuthProvider>
        </StudyForgeProvider>
      </body>
    </html>
  );
}
