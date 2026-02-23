const BE_OFFSET = 543;

export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

/** Convert CE year to BE year */
export function toBEYear(ceYear: number): number {
  return ceYear + BE_OFFSET;
}

/** Convert BE year to CE year */
export function toCEYear(beYear: number): number {
  return beYear - BE_OFFSET;
}

/** Format ISO date string (YYYY-MM-DD) to Thai string (e.g. 15 มีนาคม 2567) */
export function formatThaiDate(isoDate: string | null | undefined, short = false): string {
  if (!isoDate) return "-";
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDate();
  const month = short ? THAI_MONTHS_SHORT[d.getMonth()] : THAI_MONTHS[d.getMonth()];
  const year = toBEYear(d.getFullYear());
  return `${day} ${month} ${year}`;
}

/** Format ISO date string to short Thai (e.g. 15/03/2567) */
export function formatThaiDateSlash(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";
  const d = new Date(isoDate + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = toBEYear(d.getFullYear());
  return `${day}/${month}/${year}`;
}

/** Convert BE date string (DD/MM/YYYY_BE) to ISO CE (YYYY-MM-DD) */
export function thaiSlashToISO(thaiDate: string): string | null {
  const parts = thaiDate.trim().split(/[\/\-\.]/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const beYear = parseInt(parts[2]);
  if (isNaN(day) || isNaN(month) || isNaN(beYear)) return null;
  const ceYear = toCEYear(beYear);
  return `${ceYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Get current Thai academic year (BE) — Thai academic year starts May */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const ce = now.getFullYear();
  const month = now.getMonth() + 1;
  return String(toBEYear(month >= 5 ? ce : ce - 1));
}

/** Get list of academic years for select (last 5 years + 3 years forward) */
export function getAcademicYearOptions(): string[] {
  const current = parseInt(getCurrentAcademicYear());
  const years: string[] = [];
  for (let y = current - 4; y <= current + 3; y++) {
    years.push(String(y));
  }
  return years.reverse();
}
