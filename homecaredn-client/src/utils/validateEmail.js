export function isSafeEmail(email) {
  if (typeof email !== 'string') return false;

  // RFC limit: max 254 chars
  if (email.length === 0 || email.length > 254) return false;

  // Local part max 64 chars
  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex > 64) return false;

  // Deterministic regex, anchored
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
