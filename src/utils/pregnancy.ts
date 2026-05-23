/** تحويل أسبوع الحمل إلى شهر تقريبي (1–9) */
export function weekToPregnancyMonth(week?: number | null): number | undefined {
  if (week == null || week < 1) return undefined;
  return Math.min(9, Math.max(1, Math.ceil(week / 4)));
}

export function pregnancyMonthLabel(month?: number): string {
  if (!month) return '';
  return `الشهر ${month}`;
}

export function pregnancyMonthRangeLabel(
  min?: number | null,
  max?: number | null
): string {
  if (min == null && max == null) return 'كل أشهر الحمل';
  if (min != null && max != null && min === max) return `الشهر ${min}`;
  if (min != null && max != null) return `أشهر ${min}–${max}`;
  if (min != null) return `من الشهر ${min}`;
  if (max != null) return `حتى الشهر ${max}`;
  return '';
}
