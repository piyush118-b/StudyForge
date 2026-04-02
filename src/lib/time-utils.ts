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
  
  let diffMinutes = (h * 60 + m) - (sh * 60 + sm);
  
  // If time is before grid start (e.g. 2am vs 7am start), assume it's the next day
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }
  
  return (diffMinutes / 60) * pxPerHour;
}

/** Get the duration between two times in minutes */
export function timeDiffMinutes(startTime: string, endTime: string): number {
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  
  // Handle cross-day (e.g. 11pm to 2am)
  if (diff < 0) {
    diff += 24 * 60;
  }
  
  return diff;
}

/** Offset a time by X minutes, wrapping 24h naturally */
export function addMinutesWrapped(time: string, minutesDelta: number): string {
  if (!time) return "00:00";
  const [h, m] = time.split(':').map(Number);
  let totalMinutes = h * 60 + m + minutesDelta;
  
  // Wrap around negative or > 24h
  totalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
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

/** Build flexible time input from user string typing (Highly Smart) */
export function parseTimeInput(input: string): string | null {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, '');
  if (!cleaned) return null;

  const matchColon = cleaned.match(/^(\d{1,2}):(\d{2})([ap]m?)?$/);
  const matchNoColon = cleaned.match(/^(\d{1,4})([ap]m?)?$/);

  let h: number, m: number, period: string | undefined;

  if (matchColon) {
    h = parseInt(matchColon[1]);
    m = parseInt(matchColon[2]);
    period = matchColon[3];
  } else if (matchNoColon) {
    const digits = matchNoColon[1];
    period = matchNoColon[2];
    
    if (digits.length <= 2) {
      h = parseInt(digits);
      m = 0;
    } else if (digits.length === 3) {
      h = parseInt(digits.slice(0, 1));
      m = parseInt(digits.slice(1));
    } else {
      h = parseInt(digits.slice(0, 2));
      m = parseInt(digits.slice(2));
    }
  } else {
    return null;
  }

  if (period) {
    const isPM = period.startsWith('p');
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
  } else {
    // Smart Defaults if no AM/PM provided:
    // 1 to 6 defaults to PM (1 PM to 6 PM)
    // 7 to 11 defaults to AM (7 AM to 11 AM)
    // 12 defaults to PM (12 Noon)
    if (h >= 1 && h <= 6) {
       h += 12;
    }
  }

  if (h >= 0 && h < 24 && m >= 0 && m < 60) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
