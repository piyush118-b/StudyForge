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
            <Toaster position="bottom-right" theme="dark" richColors />
          </AuthProvider>
        </StudyForgeProvider>
      </body>
    </html>
  );
}
