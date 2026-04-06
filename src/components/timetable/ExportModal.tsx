'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { useSubscriptionStore } from '@/store/subscription-store';

interface ExportModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ExportModal({ children, isOpen, onOpenChange }: ExportModalProps) {
  const { isPro } = useSubscriptionStore();
  const [internalOpen, setInternalOpen] = useState(false);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const exportToPDF = () => console.log('Exporting to PDF...');
  const syncToGCal = () => console.log('Syncing to Google Calendar...');
  const copyShareLink = () => console.log('Copying share link...');
  const exportToImage = () => console.log('Exporting as Image...');

  const closeModal = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent className="p-0 border-[#2A2A2A] bg-[#1A1A1A] sm:max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="px-6 py-5 border-b border-[#2A2A2A]">
          <h2 className="text-base font-semibold text-[#F0F0F0] tracking-tight">
            Export Timetable
          </h2>
          <p className="text-xs text-[#606060] mt-0.5">
            Download or share your schedule
          </p>
        </div>

        {/* Export options */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {[
            {
              icon: '📄',
              title: 'Export as PDF',
              description: 'Download a printable version of your timetable',
              action: exportToPDF,
              isPro: true,
            },
            {
              icon: '🗓️',
              title: 'Sync to Google Calendar',
              description: 'Add your study blocks directly to Google Calendar',
              action: syncToGCal,
              isPro: true,
            },
            {
              icon: '🔗',
              title: 'Share Link',
              description: 'Generate a public shareable link to this timetable',
              action: copyShareLink,
              isPro: false,
            },
            {
              icon: '📷',
              title: 'Export as Image',
              description: 'Save a PNG screenshot of your timetable grid',
              action: exportToImage,
              isPro: false,
            },
          ].map(option => (
            <button
              key={option.title}
              onClick={option.isPro && !isPro ? undefined : option.action}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150-all duration-150 ${
                option.isPro && !isPro
                  ? 'border-[#2A2A2A] bg-[#111111] opacity-60 cursor-not-allowed'
                  : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#333333] hover:bg-[#222222] active:scale-[0.98]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#222222] flex items-center justify-center text-xl flex-shrink-0">
                {option.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#F0F0F0]">{option.title}</p>
                  {option.isPro && !isPro && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[#F59E0B]/25 uppercase tracking-wider">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#606060]">{option.description}</p>
              </div>

              {/* Arrow — only on available options */}
              {!(option.isPro && !isPro) && (
                <span className="text-[#606060] text-sm flex-shrink-0">→</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={closeModal}
            className="w-full h-9 rounded-xl border border-[#2A2A2A] bg-transparent text-sm font-medium text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F0F0F0] transition-all duration-150-all duration-150 active:scale-[0.97] hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
