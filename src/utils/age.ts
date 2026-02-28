/**
 * Parse birthday string (e.g. MM/DD/YYYY) and return age in years, or null if invalid/missing.
 */
export function getAgeFromBirthday(birthday: string): number | null {
  const trimmed = birthday?.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/[/\-.]/).map((p) => parseInt(p, 10));
  if (parts.length < 3) return null;
  let month = parts[0];
  const day = parts[1];
  let year = parts[2];
  if (year < 100) year += year < 50 ? 2000 : 1900;
  if (month > 12) {
    [month, year] = [parts[1], parts[2]];
    if (year < 100) year += year < 50 ? 2000 : 1900;
  }
  const birth = new Date(year, month - 1, day);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 120 ? age : null;
}
