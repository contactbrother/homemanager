/** House style is DD Month YYYY throughout, per the build plan. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? parseDateOnly(value) : value;
  return DATE_FORMAT.format(date);
}

/** A date column comes back as YYYY-MM-DD. Parsing that with `new Date()` treats it
 *  as UTC midnight, which reads as the previous day west of Greenwich. Dubai is east
 *  of it, but the app is developed and tested elsewhere, so parse the parts directly
 *  and keep the date the database actually holds. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Today at local midnight, so a date comparison is not skewed by the time of day. */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysUntil(value: string): number {
  const target = parseDateOnly(value);
  const diff = target.getTime() - today().getTime();
  return Math.round(diff / 86_400_000);
}

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  minimumFractionDigits: 2,
});

export function formatAed(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "";
  return AED.format(amount);
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
