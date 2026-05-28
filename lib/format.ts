// Pure utility functions — bisa di-test tanpa setup React/RN runtime.

export function formatIDR(amount: number): string {
  if (!isFinite(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function calcStreak(days: boolean[]): number {
  let max = 0;
  let curr = 0;
  for (const d of days) {
    if (d) {
      curr++;
      if (curr > max) max = curr;
    } else {
      curr = 0;
    }
  }
  return max;
}

export function formatRelativeDate(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID');
}
