export const hebrewMonthToDisplayNameMap = new Map<number, string>([
  [1, "Nisan"],
  [2, "Iyyar"],
  [3, "Sivan"],
  [4, "Tammuz"],
  [5, "Av"],
  [6, "Elul"],
  [7, "Tishrei"],
  [8, "Heshvan"],
  [9, "Kislev"],
  [10, "Tevet"],
  [11, "Shevat"],
  [12, "Adar"],
]);

export function convertHebrewMonthToDisplayName(
  month: number,
): string | undefined {
  return hebrewMonthToDisplayNameMap.get(month);
}

export function extractHebrew(
  rrulestring: string,
): { byhebrewmonth: number; byhebrewday: number } | undefined {
  // "X-YEARLY-HEBREW: 1, 16"
  // If is not yearly hebrew format, `undefined`
  // If is yearly hebrew format but invalid format, throws Error
  // Otherwise, returns month and day

  if (rrulestring.startsWith("X-YEARLY-HEBREW:")) {
    try {
      const [byhebrewmonth, byhebrewday] = rrulestring
        .replaceAll("X-YEARLY-HEBREW:", "")
        .split(",")
        .map(Number);

      return {
        byhebrewmonth,
        byhebrewday,
      };
    } catch {
      throw new Error(`Invalid Hebrew date format: ${rrulestring}`);
    }
  }
}
