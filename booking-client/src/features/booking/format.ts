const MANILA_OFFSET = '+08:00';

export function toManilaDate(localIso: string): Date {
  return new Date(`${localIso}${MANILA_OFFSET}`);
}

export function formatDateManila(localIso: string): string {
  return toManilaDate(localIso).toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeManila(localIso: string): string {
  return toManilaDate(localIso).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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
  });
}

export function formatPhp(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
}
