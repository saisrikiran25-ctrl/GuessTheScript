// ─── Date / Time Formatting ───────────────────────────────────

export function formatKickoffDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatKickoffTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const target = new Date(isoString).getTime();
  const diff = target - now;

  if (diff < 0) return 'Kicked off';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function isBeforeKickoff(kickoffISO: string): boolean {
  return Date.now() < new Date(kickoffISO).getTime();
}

export function getCountdownParts(isoString: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = Math.max(0, new Date(isoString).getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, total };
}

// ─── Score Formatting ─────────────────────────────────────────

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Generate player ID ───────────────────────────────────────

export function generatePlayerId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// ─── Initials from name ───────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatJoinedDate(isoString?: string): string {
  if (!isoString) return 'Joined July 2026';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Joined July 2026';
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `Joined on ${day} ${month} ${year}`;
}
