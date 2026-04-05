import type { ReminderSettings } from '@/types/reminder.types'

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export async function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return []
  
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      resolve(voices)
      return
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices())
    }
    setTimeout(() => resolve([]), 2000)
  })
}

export async function getBestVoice(
  preferredName?: string | null
): Promise<SpeechSynthesisVoice | null> {
  const voices = await getAvailableVoices()
  if (voices.length === 0) return null
  
  if (preferredName) {
    const preferred = voices.find(v => v.name === preferredName)
    if (preferred) return preferred
  }
  
  const priorities = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
    (v: SpeechSynthesisVoice) => v.name.includes('Samantha'),
    (v: SpeechSynthesisVoice) => v.name.includes('Alex'),
    (v: SpeechSynthesisVoice) => v.name.includes('Daniel'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-IN',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ]
  
  for (const check of priorities) {
    const match = voices.find(check)
    if (match) return match
  }
  
  return voices[0]
}

export async function speakReminder(
  text: string,
  settings: Pick<ReminderSettings, 'voiceRate' | 'voicePitch' | 'voiceVolume' | 'preferredVoiceName'>
): Promise<void> {
  if (!isSpeechSupported()) return
  
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = settings.voiceRate
  utterance.pitch = settings.voicePitch
  utterance.volume = settings.voiceVolume
  
  const voice = await getBestVoice(settings.preferredVoiceName)
  if (voice) utterance.voice = voice
  
  utterance.onerror = (e) => {
    console.warn('[StudyForge] Speech synthesis error:', e.error)
  }
  
  return new Promise((resolve) => {
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.speak(utterance)
    
    setTimeout(resolve, 10000)
  })
}

export function stopSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel()
  }
}
