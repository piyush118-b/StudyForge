"use client";

import { useEffect } from 'react';

export function PwaRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('StudyForge SW registered: ', registration.scope);
          })
          .catch((err) => {
            console.error('StudyForge SW registration failed: ', err);
          });
      });
    }
  }, []);

  return null;
}
