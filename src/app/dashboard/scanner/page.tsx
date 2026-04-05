"use client";

import { ImageScanner } from '@/components/scanner/ImageScanner';
import { Camera, Sparkles } from 'lucide-react';

export default function ScannerPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-6 bg-[#0A0A0A] min-h-full">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-[rgba(16,185,129,0.1)] rounded-xl border border-[#10B981]/20 flex items-center justify-center">
            <Camera className="w-5 h-5 text-[#10B981]" />
          </div>
          <h1 className="text-xl font-bold text-[#F0F0F0] tracking-tight">OCR Scanner</h1>
        </div>
        <p className="text-sm text-[#A0A0A0] mt-1 pl-0">
          Snap a photo of your whiteboard, notes, or syllabus →{' '}
          tasks appear automatically <span className="text-[#10B981]">✨</span>
        </p>
      </div>

      <ImageScanner />

    </div>
  );
}
