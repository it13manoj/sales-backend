export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isPast(date: Date): boolean {
  return new Date().getTime() > new Date(date).getTime();
}

export function formatISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

