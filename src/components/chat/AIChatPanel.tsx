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
    <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col pt-16 sm:pt-0">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">StudyForge Assistant</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 bg-slate-900/50">
        <AIUsageBanner />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 border ${
              m.role === 'user' 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-indigo-500/20 border-indigo-500/30'
            }`}>
              {m.role === 'user' ? <User className="w-3 h-3 text-slate-400" /> : <Bot className="w-3 h-3 text-indigo-400" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 border bg-indigo-500/20 border-indigo-500/30">
              <Bot className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-slate-800 border border-slate-700 rounded-tl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <ProGate feature="ai_chat" fallback={
          <div className="text-center py-3 px-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <Sparkles className="w-4 h-4 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-2">Upgrade to Pro to chat with the AI assistant inside the editor.</p>
          </div>
        }>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for advice, balance tips..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              disabled={isLoading || !canUseAI}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !canUseAI}
              className="absolute right-2 p-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-white hover:text-slate-200 relative -left-[1px] top-[1px]" style={{ transform: 'rotate(45deg)' }} />}
            </button>
          </div>
        </ProGate>
      </div>
    </div>
  );
}
