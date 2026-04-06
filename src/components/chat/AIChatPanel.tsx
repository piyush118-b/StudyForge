'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSubscriptionStore } from '@/store/subscription-store';
import { useGridStore } from '@/store/grid-store';
import { Bot, Send, User, X, Loader2, Sparkles } from 'lucide-react';
import { ProGate, AIUsageBanner } from '../subscription/ProGate';
import { trackEvent } from '@/lib/lifecycle';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  onClose: () => void;
  isOpen: boolean;
}

export function AIChatPanel({ onClose, isOpen }: AIChatPanelProps) {
  const { session } = useAuth();
  const { isPro, canUseAI, incrementAICalls } = useSubscriptionStore();
  const { id: currentTimetableId, blocks } = useGridStore();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi! I am your StudyForge AI Assistant. How can I help you optimize your timetable today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !canUseAI || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          timetableContext: {
            id: currentTimetableId,
            blockCount: Object.keys(blocks).length,
            subjects: Array.from(new Set(Object.values(blocks).map(b => b.subject))),
          }
        })
      });

      if (!res.ok) {
        if (res.status === 402) {
          throw new Error('AI limit reached! Please upgrade to Pro.');
        }
        throw new Error('Failed to fetch response');
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply
      }]);

      trackEvent('ai_chat_message_sent');

      if (!isPro) incrementAICalls();

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#111111] border-l border-[#2A2A2A] shadow-2xl z-50 flex flex-col pt-16 sm:pt-0">
      
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#111111]/95 backdrop-blur z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center border border-[#10B981]/30">
            <Bot className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">StudyForge Assistant</h3>
            <div className="flex items-center gap-1.5 text-xs text-[#606060]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded-lg text-[#A0A0A0] hover:text-[#F0F0F0] transition-all duration-150-colors active:scale-[0.97]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 bg-[#111111]/50">
        <AIUsageBanner />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 border ${
              m.role === 'user' 
                ? 'bg-[#1A1A1A] border-[#2A2A2A]' 
                : 'bg-[#10B981]/20 border-[#10B981]/30'
            }`}>
              {m.role === 'user' ? <User className="w-3 h-3 text-[#A0A0A0]" /> : <Bot className="w-3 h-3 text-[#10B981]" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#10B981] text-[#F0F0F0] rounded-tr-sm'
                : 'bg-[#1A1A1A] text-slate-200 rounded-tl-sm border border-[#2A2A2A]'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 border bg-[#10B981]/20 border-[#10B981]/30">
              <Bot className="w-3 h-3 text-[#10B981]" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-tl-sm flex items-center gap-1 hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#111111] border-t border-[#2A2A2A]">
        <ProGate feature="ai_chat" fallback={
          <div className="text-center py-3 px-4 bg-[#1A1A1A]/50 rounded-xl border border-[#2A2A2A]/50">
            <Sparkles className="w-4 h-4 text-[#10B981] mx-auto mb-2" />
            <p className="text-sm text-[#A0A0A0] mb-2">Upgrade to Pro to chat with the AI assistant inside the editor.</p>
          </div>
        }>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for advice, balance tips..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-4 pr-12 py-3 text-sm text-[#F0F0F0] placeholder:text-[#606060] focus:outline-none focus:border-[#10B981] focus:ring-1 focus-visible:ring-[#10B981]/70 transition-all duration-150-all"
              disabled={isLoading || !canUseAI}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !canUseAI}
              className="absolute right-2 p-1.5 bg-[#10B981] hover:bg-[#10B981] disabled:bg-slate-700 text-white rounded-lg transition-all duration-150-colors active:scale-[0.97]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-[#F0F0F0] hover:text-slate-200 relative -left-[1px] top-[1px]" style={{ transform: 'rotate(45deg)' }} />}
            </button>
          </div>
        </ProGate>
      </div>
    </div>
  );
}
