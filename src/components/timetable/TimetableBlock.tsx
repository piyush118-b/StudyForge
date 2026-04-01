"use client";

import { TimetableSlot } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  slotContent: TimetableSlot;
  timeLabel: string;
  onUpdate?: (updated: TimetableSlot) => void;
}

export function TimetableBlock({ slotContent, timeLabel, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [edited, setEdited] = useState(slotContent);

  const save = () => {
    onUpdate?.(edited);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button 
          type="button"
          className="p-2 sm:p-3 h-full w-full rounded-md border flex flex-col justify-start text-left cursor-pointer hover:brightness-110 transition-all text-xs sm:text-sm"
          style={{ 
            backgroundColor: `${slotContent.color}20`, 
            borderColor: `${slotContent.color}50`,
            borderLeft: `4px solid ${slotContent.color}`
          }}
        >
          <span className="font-bold truncate text-slate-100">{slotContent.subject}</span>
          <span className="text-[10px] sm:text-xs text-slate-300 truncate">{slotContent.type}</span>
          {slotContent.notes && <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 line-clamp-2 italic max-w-full">{slotContent.notes}</span>}
        </button>
      } />
      
      <DialogContent className="sm:max-w-xs bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Edit ({timeLabel})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input 
              value={edited.subject} 
              onChange={e => setEdited({...edited, subject: e.target.value})}
              className="bg-slate-800 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Input 
              value={edited.type} 
              onChange={e => setEdited({...edited, type: e.target.value})}
              className="bg-slate-800 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label>Color (Hex)</Label>
            <div className="flex gap-2 items-center">
              <div className="w-6 h-6 rounded-full border border-white/20" style={{background: edited.color}}/>
              <Input 
                value={edited.color} 
                onChange={e => setEdited({...edited, color: e.target.value})}
                className="bg-slate-800 border-white/10 flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input 
              value={edited.notes} 
              onChange={e => setEdited({...edited, notes: e.target.value})}
              className="bg-slate-800 border-white/10"
            />
          </div>
          <Button onClick={save} className="w-full bg-indigo-600 hover:bg-indigo-500">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
