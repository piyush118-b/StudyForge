import type { ReminderSettings } from '@/types/reminder.types'

const MOTIVATIONAL_TEMPLATES = {
  fiveMin: [
    "{subject} starts in 5 minutes. Time to lock in. 🔥",
    "{subject} is up. Deep work mode: ON. 💪",
    "5 minutes to {subject}. Close the tabs. Focus up.",
    "{subject} session incoming. Let's make it count.",
    "Clock's ticking. {subject} in 5. Get ready.",
    "Your {subject} block starts in 5. Protect the streak.",
    "Time to dominate {subject}. 5 minutes. Let's go.",
    "{subject} is starting soon. Every session compounds.",
    "5 minutes until {subject}. This is where legends are built.",
    "Lock in. {subject} starts at {time}. You've got this.",
  ],
  oneMin: [
    "{subject} starts in 60 seconds. Close everything else.",
    "1 minute. {subject}. Let's GO. 🚀",
    "Final warning — {subject} is NOW. Open your notes.",
    "{subject} in 1 minute. No more delays.",
    "It's almost {time}. {subject} time. Focus.",
  ]
}

const PROFESSIONAL_TEMPLATES = {
  fiveMin: [
    "Reminder: {subject} session begins in 5 minutes.",
    "Your {subject} block starts at {time}.",
    "{subject} is scheduled to begin in 5 minutes.",
    "Upcoming: {subject} at {time}.",
    "Preparation reminder: {subject} in 5 minutes.",
  ],
  oneMin: [
    "{subject} begins in 1 minute.",
    "Your {subject} session starts momentarily.",
    "Final reminder: {subject} at {time}.",
  ]
}

const FRIENDLY_TEMPLATES = {
  fiveMin: [
    "Hey! {subject} is coming up in 5 minutes! 😊",
    "Almost time for {subject}! Get comfy and ready.",
    "{subject} soon! Grab your notes and your focus 📚",
    "Heads up — {subject} starts in 5! You've got this.",
    "5-minute warning for {subject}. You're doing great!",
    "Time to prep for {subject}! See you in 5 ✨",
  ],
  oneMin: [
    "1 minute till {subject}! Let's go! 🎯",
    "{subject} is basically starting. Ready?",
    "Almost! {subject} in 60 seconds 🙌",
  ]
}

const STRICT_TEMPLATES = {
  fiveMin: [
    "{subject} in 5 minutes. No excuses.",
    "5 minutes. {subject}. Be ready.",
    "{subject} starts at {time}. Don't be late.",
    "You committed to {subject}. 5 minutes. Honor it.",
    "{subject}: 5 minutes. Close distractions. Now.",
  ],
  oneMin: [
    "{subject}: 1 minute. Move.",
    "No more delays. {subject} is now.",
    "{subject} starts NOW. Sit down and open your notes.",
  ]
}

const TONE_MAP = {
  motivational: MOTIVATIONAL_TEMPLATES,
  professional: PROFESSIONAL_TEMPLATES,
  friendly: FRIENDLY_TEMPLATES,
  strict: STRICT_TEMPLATES
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fillTemplate(
  template: string,
  subject: string,
  startTime: string,
  studentName?: string
): string {
  const displayTime = to12Hour(startTime)
  return template
    .replace(/{subject}/g, subject)
    .replace(/{time}/g, displayTime)
    .replace(/{name}/g, studentName || 'you')
}

function to12Hour(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export function generateReminderMessage(
  subject: string,
  startTime: string,
  minutesBefore: number,
  settings: Pick<ReminderSettings, 'toneStyle' | 'useStudentName'>,
  studentName?: string
): string {
  const templates = TONE_MAP[settings.toneStyle]
  const pool = minutesBefore <= 1 ? templates.oneMin : templates.fiveMin
  const template = pickRandom(pool)
  
  let message = fillTemplate(template, subject, startTime, studentName)
  
  if (settings.useStudentName && studentName && Math.random() > 0.5) {
    const namePrefix = `${studentName.split(' ')[0]}, `
    message = namePrefix + message.charAt(0).toLowerCase() + message.slice(1)
  }
  
  return message
}

export function generateNotificationBody(
  subject: string,
  startTime: string,
  minutesBefore: number
): string {
  const displayTime = to12Hour(startTime)
  if (minutesBefore <= 1) {
    return `${subject} starts NOW at ${displayTime}.`
  }
  return `${subject} starts in ${minutesBefore} minutes at ${displayTime}.`
}

export function generateVoiceText(
  subject: string,
  startTime: string,
  minutesBefore: number,
  studentName?: string
): string {
  const displayTime = to12Hour(startTime)
    .replace('AM', 'A M')
    .replace('PM', 'P M')
  
  const namePrefix = studentName ? `${studentName.split(' ')[0]}, ` : ''
  
  if (minutesBefore <= 1) {
    return `${namePrefix}your ${subject} session is starting right now at ${displayTime}. Time to focus.`
  }
  
  return `${namePrefix}your ${subject} session starts in ${minutesBefore} minutes at ${displayTime}. Get ready to lock in.`
}
