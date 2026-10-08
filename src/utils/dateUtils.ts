/**
 * Local Date & Time formatting utilities for Pakistan timezone (PKT / UTC+5)
 * Prevents UTC off-by-one errors where toISOString().split('T')[0] displays yesterday's date.
 */

export const getLocalDateString = (dateInput?: Date | string | null): string => {
  if (!dateInput) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (dateInput?: Date | string | null): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const dateStr = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr} • ${timeStr}`;
};

export const formatTimeOnly = (dateInput?: Date | string | null): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const isSameDay = (d1Input?: Date | string | null, d2Input?: Date | string | null): boolean => {
  if (!d1Input || !d2Input) return false;
  return getLocalDateString(d1Input) === getLocalDateString(d2Input);
};

export const isToday = (dateInput?: Date | string | null): boolean => {
  if (!dateInput) return false;
  return getLocalDateString(dateInput) === getLocalDateString(new Date());
};
