export const PX_PER_HOUR = 80;

/** Convert a Y pixel position to a time string */
export function pixelToTime(y: number, gridStartTime: string, pxPerHour: number = PX_PER_HOUR): string {
  const totalMinutes = Math.round((y / pxPerHour) * 60);
  const [startH, startM] = gridStartTime.split(':').map(Number);
  const absMinutes = startH * 60 + startM + totalMinutes;
  // Prevent returning negative times or NaN
  const safeMinutes = Math.max(0, absMinutes);
  const h = Math.floor(safeMinutes / 60) % 24;
  const m = safeMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Convert a time string to Y pixel position relative to grid start */
export function timeToPixel(time: string, gridStartTime: string, pxPerHour: number = PX_PER_HOUR): number {
  if (!time || !gridStartTime) return 0;
  const [h, m] = time.split(':').map(Number);
  const [sh, sm] = gridStartTime.split(':').map(Number);
  const diffMinutes = (h * 60 + m) - (sh * 60 + sm);
  return (diffMinutes / 60) * pxPerHour;
}

/** Get the duration between two times in minutes */
export function timeDiffMinutes(startTime: string, endTime: string): number {
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

/** Snap a time strictly to a designated interval logic */
export function snapTime(time: string, snapMinutes: 15 | 30 | 60): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m;
  const snapped = Math.round(totalMinutes / snapMinutes) * snapMinutes;
  return `${Math.floor(snapped / 60).toString().padStart(2, '0')}:${(snapped % 60).toString().padStart(2, '0')}`;
}

/** Convert 24h to 12h display strictly */
export function to12Hour(time24: string): string {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  if (isNaN(h)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/** Converts "09:00" -> "9 AM" explicitly dropping minutes when zero */
export function to12HourShort(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${m.toString().padStart(2,'0')} ${ampm}`;
}

/** Build flexible time input from user string typing */
export function parseTimeInput(input: string): string | null {
  const cleaned = input.trim().toLowerCase();
  
  // Try 12-hour formats
  const match12 = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (match12) {
    let h = parseInt(match12[1]);
    const m = parseInt(match12[2] || '0');
    const period = match12[3];
    if (period === 'pm' && h !== 12) h += 12;
    if (period === 'am' && h === 12) h = 0;
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }
  
  // Try 24-hour formats
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1]);
    const m = parseInt(match24[2]);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }
  
  return null;
}

/** Yield dropdown fast arrays mapping */
export function generateQuickTimes(
  min: string = '00:00', 
  max: string = '23:59',
  intervalMinutes: number = 30
): string[] {
  const times: string[] = [];
  const [minH, minM] = min.split(':').map(Number);
  const [maxH, maxM] = max.split(':').map(Number);
  let current = minH * 60 + minM;
  const end = maxH * 60 + maxM;
  
  while (current <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    current += intervalMinutes;
  }
  return times;
}
