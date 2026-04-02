"use client";

import { ImageScanner } from '@/components/scanner/ImageScanner';
import { Camera, Sparkles } from 'lucide-react';

export default function ScannerPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <Camera className="w-8 h-8 text-indigo-400" />
          </div>
          Photo Tasks Scanner
        </h1>
        <p className="text-slate-400 mt-3 text-lg flex items-center gap-2">
          Point your camera at a whiteboard or syllabus and let AI extract the text.
          <Sparkles className="w-5 h-5 inline text-amber-500" />
        </p>
      </div>

      <ImageScanner />
      
    </div>
  );
}
