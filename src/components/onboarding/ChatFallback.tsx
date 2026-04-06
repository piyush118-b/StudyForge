"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ChatFallback() {
  const [msg, setMsg] = useState("");
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" className="mt-6 text-sm text-teal-400 hover:bg-teal-400/10 transition-all duration-150-colors" />}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Or just chat with AI instead
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#111111] border-white/10 text-[#F0F0F0]">
        <DialogHeader>
          <DialogTitle>Chat with StudyForge AI</DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            Too lazy for steps? Just tell me about your week yaar! What are you studying and what are your commitments?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 h-[300px] overflow-y-auto">
          {/* Mock chat messages */}
          <div className="bg-[#1A1A1A] rounded-lg p-3 text-sm rounded-bl-sm self-start w-[80%]">
            Hey! What are we studying this week? Tell me about your college and daily goals.
          </div>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="E.g., I'm in IIT, need 6 hrs of studying, 3 subjects..." 
            className="flex-1 bg-[#1A1A1A] border-white/10"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <Button size="icon" className="bg-teal-500 hover:bg-teal-600"><Send className="w-4 h-4"/></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
