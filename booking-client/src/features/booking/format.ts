const MANILA_OFFSET = '+08:00';
const MANILA_TIME_ZONE = 'Asia/Manila';

/**
 * Builds a Date from either a Manila wall-clock string ("2026-11-25T09:00:00")
 * or an ISO instant that already carries an offset ("...Z", "...+08:00").
 * Appending another offset to a string that already has one yields Invalid Date.
 */
export function toManilaDate(localIso: string): Date {
  const hasOffset = /(?:[Zz]|[+-]\d{2}:?\d{2})$/.test(localIso);
  return new Date(hasOffset ? localIso : `${localIso}${MANILA_OFFSET}`);
}

export function formatDateManila(localIso: string): string {
  return toManilaDate(localIso).toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: MANILA_TIME_ZONE,
  });
}

export function formatTimeManila(localIso: string): string {
  return toManilaDate(localIso).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: MANILA_TIME_ZONE,
  });
}

export function formatDateTimeManila(localIso: string): string {
  return toManilaDate(localIso).toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: MANILA_TIME_ZONE,
  });
}

export function formatPhp(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
}
