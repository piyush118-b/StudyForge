"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-forge-base flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-forge-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
