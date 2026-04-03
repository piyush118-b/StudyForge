// REFACTOR: Centralized grid logic to avoid duplication across dashboard and editor components.
import { UnifiedBlock, DayOfWeek } from '@/types';

// Helper to convert "HH:MM" or "HH:MM AM/PM" to minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  
  // Handle 12-hour format
  if (timeStr.toLowerCase().includes('m')) {
    const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const period = (match[3] || '').toLowerCase();
    
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  }
  
  // Handle 24-hour format
  const match = timeStr.match(/(\d{1,2}):?(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function detectClash(a: UnifiedBlock, b: UnifiedBlock): boolean {
  if (a.day !== b.day) return false;
  if (a.id === b.id) return false;
  
  const aStart = parseTimeToMinutes(a.startTime);
  const aEnd = parseTimeToMinutes(a.endTime);
  const bStart = parseTimeToMinutes(b.startTime);
  const bEnd = parseTimeToMinutes(b.endTime);

  return aStart < bEnd && aEnd > bStart;
}

export function getDuration(block: UnifiedBlock): number {
  const start = parseTimeToMinutes(block.startTime);
  const end = parseTimeToMinutes(block.endTime);
  let diff = end - start;
  
  // Handle overnight blocks mapping across midnight boundaries
  if (diff < 0) diff += 24 * 60;
  
  return diff / 60; // Returns duration in hours
}

export function groupByDay(blocks: UnifiedBlock[]): Record<DayOfWeek, UnifiedBlock[]> {
  const result: Record<DayOfWeek, UnifiedBlock[]> = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  };
  
  blocks.forEach(block => {
    if (result[block.day]) {
      result[block.day].push(block);
    }
  });
  
  // Sort each day's blocks
  Object.keys(result).forEach(day => {
    result[day as DayOfWeek] = sortByTime(result[day as DayOfWeek]);
  });
  
  return result;
}

export function sortByTime(blocks: UnifiedBlock[]): UnifiedBlock[] {
  return [...blocks].sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
}

