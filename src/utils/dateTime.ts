export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
}

export const getISTDateTime = (mode: 'formatted' | 'iso' = 'formatted') => {
  const now = new Date();
  if (mode === 'formatted') {
    const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-GB', options);
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
    return { date: dateStr, time: timeStr, iso: '' };
  }
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return { date: '', time: '', iso: istNow.toISOString().split('.')[0] };
};