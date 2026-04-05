"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Gift, Copy, Share2, CheckCircle2, LinkIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProGate } from "@/components/subscription/ProGate";

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<{ id: string, status: string, created_at: string, reward_granted: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  const shareCode = user?.id.split('-')[0] || "";

  useEffect(() => {
    if (!user) return;
    
    const fetchReferrals = async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);
        
      if (!error && data) {
         const { data: refsData } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).not('referee_id', 'is', null);
         setReferrals(refsData || []);
      }
      setLoading(false);
    };

    fetchReferrals();
  }, [user]);

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/invite/${shareCode}` : '';

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link copied! Share it with your friends.");
  };

  const shareNative = async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StudyForge AI',
          text: 'Use my invite link to get free Pro days on StudyForge AI!',
          url: inviteLink,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      copyLink();
    }
  };

  const convertedCount = referrals.filter(r => r.status === 'rewarded' || r.status === 'converted').length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto min-h-screen">
      
      <div className="bg-gradient-to-br from-forge-accent/20 to-forge-base rounded-3xl border border-forge-accent/30 p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-forge-accent/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-forge-accent-bright/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="mx-auto w-20 h-20 rounded-2xl bg-forge-accent flex items-center justify-center shadow-forge-2xl mb-6 relative z-10">
          <Gift className="w-10 h-10 text-forge-base" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-forge-text-primary mb-4 relative z-10">
          Invite Friends, <span className="text-forge-accent-bright">Get Pro Free</span>
        </h1>
        <p className="text-forge-text-secondary text-lg max-w-2xl mx-auto mb-8 relative z-10">
          Share your unique link. When your friends sign up, you both get 30 days of StudyForge Pro, unlocking unlimited AI access.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto relative z-10">
          <div className="bg-forge-overlay border border-forge-border rounded-xl px-4 py-3 w-full flex items-center gap-3">
             <LinkIcon className="w-5 h-5 text-forge-text-muted shrink-0" />
             <input readOnly type="text" value={inviteLink} className="bg-transparent border-none outline-none text-forge-text-primary w-full text-sm font-mono truncate" />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
             <Button onClick={copyLink} className="flex-1 sm:flex-none gap-2 bg-forge-accent hover:bg-forge-accent-bright text-forge-base">
               <Copy className="w-4 h-4" /> Copy
             </Button>
             <Button onClick={shareNative} variant="secondary" className="flex-1 sm:flex-none gap-2">
               <Share2 className="w-4 h-4" />
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
         <div className="bg-forge-elevated border border-forge-border rounded-2xl p-6">
            <h3 className="text-forge-text-primary font-semibold mb-6 flex items-center gap-2">
               <Users className="w-5 h-5 text-forge-text-muted" /> Your Referrals
            </h3>
            
            <div className="flex items-center gap-8 mb-8">
               <div>
                  <p className="text-4xl font-bold text-forge-text-primary mb-1">{referrals.length}</p>
                  <p className="text-xs text-forge-text-muted uppercase tracking-widest font-bold">Total Invites</p>
               </div>
               <div className="w-px h-12 bg-forge-border" />
               <div>
                  <p className="text-4xl font-bold text-emerald-400 mb-1">{convertedCount}</p>
                  <p className="text-xs text-forge-text-muted uppercase tracking-widest font-bold">Converted</p>
               </div>
            </div>

            {loading ? (
              <div className="text-sm text-forge-text-muted">Loading your stats...</div>
            ) : referrals.length === 0 ? (
              <div className="text-sm text-forge-text-muted bg-forge-overlay/50 p-4 rounded-lg text-center">
                 No friends have joined yet.
              </div>
            ) : (
               <div className="space-y-3">
                 {referrals.map(r => (
                   <div key={r.id} className="flex items-center justify-between bg-forge-overlay p-3 rounded-lg border border-forge-border/50">
                     <span className="text-sm text-forge-text-secondary font-mono">Anonymous Friend</span>
                     {r.reward_granted ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-1 rounded">
                           <CheckCircle2 className="w-3 h-3" /> Rewarded
                        </span>
                     ) : (
                        <span className="text-xs text-forge-text-muted bg-forge-elevated px-2 py-1 rounded">Pending</span>
                     )}
                   </div>
                 ))}
               </div>
            )}
         </div>

         <div className="bg-forge-elevated border border-forge-border rounded-2xl p-6 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-forge-overlay rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-8 h-8 text-forge-text-muted" />
             </div>
             <h3 className="text-xl font-bold text-forge-text-primary mb-2">Rewards Unlocked</h3>
             <p className="text-forge-text-secondary mb-6 text-sm max-w-[250px]">
                You've unlocked {convertedCount * 30} days of Free Pro access!
             </p>
             <ProGate feature="advanced_analytics" fallback={
               <Button variant="outline" disabled className="w-full max-w-[200px] border-forge-border text-forge-text-muted">Unlock more Pro</Button>
             }>
               <Button variant="outline" className="w-full max-w-[200px] border-forge-accent text-forge-accent-bright hover:bg-forge-accent/10">View Pro Status</Button>
             </ProGate>
         </div>
      </div>
    </div>
  );
}
