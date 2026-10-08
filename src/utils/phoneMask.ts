/**
 * Anti-Theft Client Phone Number Masking Utility
 * - Owner role: Full unmasked phone number (e.g. 0300 1234567)
 * - Non-owner roles (Manager, Staff/Worker, Cashier): Exactly 5 digits starred with '*'
 *   like anti-theft protection to prevent client database poaching.
 */
export function maskClientPhone(phone: string | undefined | null, role: string): string {
  if (!phone) return '-';
  if (role === 'owner') return phone;

  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');

  // If Pakistani 11-digit mobile (03XXXXXXXXX), mask 5 digits in the middle/end: e.g. 0300*****67
  if (digitsOnly.length === 11) {
    const prefix = digitsOnly.slice(0, 4); // '0300'
    const suffix = digitsOnly.slice(9, 11); // last 2 digits
    return `${prefix}*****${suffix}`;
  }

  // Fallback generic masking of 5 characters
  if (trimmed.length <= 5) {
    return '*****';
  }
  const start = trimmed.slice(0, Math.max(2, trimmed.length - 7));
  const end = trimmed.slice(trimmed.length - 2);
  return `${start}*****${end}`;
}
