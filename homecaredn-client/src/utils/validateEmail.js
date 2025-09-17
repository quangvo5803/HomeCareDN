export function isSafeEmail(email) {
  if (typeof email !== 'string') return false;

  // RFC limit: max 254 chars
  if (email.length === 0 || email.length > 254) return false;

  // Local part max 64 chars
  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex > 64) return false;

  // Deterministic regex: only character classes and simple + quantifiers, anchored
  // This regex is linear-time (no nested quantifiers or alternations that cause backtracking explosion).
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
