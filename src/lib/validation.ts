// Shared, plain-JS field validation for the many small useState-backed forms across the app
// (candidate profile, employer profile, job posting, CV builder, ...) — these don't warrant
// pulling in zod like the auth forms do (see features/auth/validation.ts for that pattern),
// but every text field still deserves input appropriate to what it actually holds instead of
// accepting anything.
//
// Two kinds of rule, applied differently:
// - Character-set rules (phone, integer years, names) are enforced live via a `sanitize*`
//   function wired to onChange — invalid characters simply never appear as typed or pasted,
//   which is both the clearest UX and impossible to bypass client-side.
// - Structural rules (URL well-formedness, date ordering) can't be enforced keystroke-by-
//   keystroke without fighting the user mid-type (e.g. "https://gi" isn't yet a valid URL),
//   so these are `isValid*` predicates meant to run on blur/submit and surface as inline
//   FieldError text instead.

export const PHONE_DIGITS = 10;

export function sanitizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, PHONE_DIGITS);
}

export function isValidPhone(value: string): boolean {
  return value.length === 0 || value.length === PHONE_DIGITS;
}

// Letters (incl. common accented Latin characters), spaces, hyphens, apostrophes, and periods
// — covers real names ("O'Brien", "Mary-Jane", "José", "St. John") without admitting digits
// or symbols. Only for fields that are genuinely *person or language* names — never company
// names, job titles, or other labels that can legitimately contain digits/ampersands/etc.
const NAME_DISALLOWED = /[^A-Za-zÀ-ſ\s'.-]/g;

export function sanitizeName(raw: string): string {
  return raw.replace(NAME_DISALLOWED, "");
}

export function isValidName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === 0 || /^[A-Za-zÀ-ſ][A-Za-zÀ-ſ\s'.-]*$/.test(trimmed);
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true; // presence is a separate, per-field concern
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Digits only, capped at maxDigits — for whole-number counts (years of experience, a
// 4-digit calendar year, ...). Never silently coerces bad input to 0 the way `Number(x) || 0`
// does — invalid characters just never make it into the field at all.
export function sanitizeInteger(raw: string, maxDigits = 4): string {
  return raw.replace(/\D/g, "").slice(0, maxDigits);
}

// Digits with at most one decimal point — for fractional counts like "2.5 years experience".
export function sanitizeDecimal(raw: string, maxDigits = 3): string {
  const digitsAndDot = raw.replace(/[^\d.]/g, "");
  const firstDot = digitsAndDot.indexOf(".");
  const cleaned = firstDot === -1
    ? digitsAndDot
    : digitsAndDot.slice(0, firstDot + 1) + digitsAndDot.slice(firstDot + 1).replace(/\./g, "");
  return cleaned.slice(0, maxDigits + 2); // + room for "." and one fraction digit
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
