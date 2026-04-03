import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAchievementStore } from '@/store/achievement-store';

export type LifecycleEventType = 
  | 'page_view'
  | 'timetable_created'
  | 'timetable_saved'
  | 'timetable_shared'
  | 'pomodoro_completed'
  | 'block_marked_done'
  | 'block_marked_skipped'
  | 'ai_auto_balance_used'
  | 'ai_chat_message_sent'
  | 'push_notification_enabled'
  | 'upgraded_to_pro'
  | 'downgraded_to_free';

export interface LifecycleEventPayload {
  [key: string]: any;
}

// Session ID for tracking anonymous users transitioning to authenticated
let localSessionId: string | null = null;
if (typeof window !== 'undefined') {
  localSessionId = localStorage.getItem('sf_session_id');
  if (!localSessionId) {
    localSessionId = uuidv4();
    localStorage.setItem('sf_session_id', localSessionId);
  }
}

export const trackEvent = async (
  eventType: LifecycleEventType, 
  eventData: LifecycleEventPayload = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('lifecycle_events').insert({
      user_id: userId,
      session_id: localSessionId,
      event_type: eventType,
      event_data: eventData,
      page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      device_type: getDeviceType()
    }).then(({ error }: any) => {
      // Intentionally swallow telemetry errors to avoid UI disruption
      if (error && process.env.NODE_ENV === 'development') {
        console.warn('Telemetry error:', error);
      }
    });

    // Determine if we need to promote lifecycle stage
    if (userId) {
      checkLifecycleStage(userId, eventType);
    }

  } catch (err) {
      // Swallow completely
  }
};

// Extremely basic device detection for analytics sorting
function getDeviceType() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Checks and automatically awards 'Engaged' or 'Power User' status tracking
 * via the achievements layer, as requested in the plan "Construct lifecycle staging formulas"
 */
async function checkLifecycleStage(userId: string, eventType: LifecycleEventType) {
  // We use local context tracking to avoid aggressively triggering confetti for already unlocked achievements locally.
  const notifyIfNew = (key: string, name: string, desc: string, emoji: string) => {
    if (typeof window === 'undefined') return;
    const localKey = `ach_${key}`;
    if (!localStorage.getItem(localKey)) {
      localStorage.setItem(localKey, 'true');
      useAchievementStore.getState().triggerAchievement(name, desc, emoji);
    }
  };

  // Trigger 'Engaged' if they do an active operation like saving or marking
  if (['timetable_saved', 'block_marked_done'].includes(eventType)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('achievements').upsert({
      user_id: userId,
      achievement_key: 'engaged_user',
      achievement_name: 'Getting Serious',
      achievement_description: 'Marked your first blocks or saved your timetable.',
      badge_emoji: '🔥',
    }, { onConflict: 'user_id,achievement_key', ignoreDuplicates: true }).then(({ error }: any) => {
      if (!error) notifyIfNew('engaged_user', 'Getting Serious', 'Marked your first blocks or saved your timetable.', '🔥');
    });
  }

  // Trigger 'Power User' if they dive deep into AI or Pomodoro
  if (['ai_auto_balance_used', 'pomodoro_completed'].includes(eventType)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('achievements').upsert({
      user_id: userId,
      achievement_key: 'power_user',
      achievement_name: 'Power User',
      achievement_description: 'Using advanced productivity features.',
      badge_emoji: '⚡',
    }, { onConflict: 'user_id,achievement_key', ignoreDuplicates: true }).then(({ error }: any) => {
      if (!error) notifyIfNew('power_user', 'Power User', 'Using advanced productivity features.', '⚡');
    });
  }
}
