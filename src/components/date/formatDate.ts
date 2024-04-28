import { fromStringToDate } from "../../services/engine/rrule";

const formatter = new Intl.DateTimeFormat("en-US");

export function formatDate(date: Date | string): string {
  return formatter.format(
    typeof date === "string" ? fromStringToDate(date) : date,
  );
}

const longFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });

export function longFormatDate(date: Date | string): string {
  return longFormatter.format(
    typeof date === "string" ? fromStringToDate(date) : date,
  );
}
