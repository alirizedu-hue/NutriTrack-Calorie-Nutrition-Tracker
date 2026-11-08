/**
 * Date utility helpers for NutriTrack
 */

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoStr: string): Date {
  const [year, month, day] = isoStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(isoStr: string): string {
  const date = parseISODate(isoStr);
  const today = formatDateToISO(new Date());

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateToISO(yesterdayDate);

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDateToISO(tomorrowDate);

  if (isoStr === today) return 'Today, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (isoStr === yesterday) return 'Yesterday, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (isoStr === tomorrow) return 'Tomorrow, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRelativeDayOffset(isoStr: string, offsetDays: number): string {
  const date = parseISODate(isoStr);
  date.setDate(date.getDate() + offsetDays);
  return formatDateToISO(date);
}

export function getPastNDays(n: number, fromDateStr?: string): string[] {
  const baseDate = fromDateStr ? parseISODate(fromDateStr) : new Date();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    dates.push(formatDateToISO(d));
  }
  return dates;
}
