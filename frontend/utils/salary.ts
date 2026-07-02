/**
 * Formats a numeric value into abbreviated dollar text (e.g. 120000 -> $120k).
 */
export function formatAbbreviatedSalary(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num === 0) return null;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1000) return `$${Math.round(num / 1000)}k`;
  return `$${num}`;
}

/**
 * Formats a salary range cleanly.
 */
export function formatSalaryRange(min: number | string | null, max: number | string | null): string {
  const minText = formatAbbreviatedSalary(min);
  const maxText = formatAbbreviatedSalary(max);

  if (minText && maxText) {
    if (minText === maxText) return minText;
    return `${minText} - ${maxText}`;
  }
  return minText || maxText || "Salary Open";
}

/**
 * Strips formatting symbols from currency string input and returns a raw number.
 */
export function parseSalaryInput(input: string): number {
  const cleanStr = input.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleanStr);
  return isNaN(val) ? 0 : val;
}
