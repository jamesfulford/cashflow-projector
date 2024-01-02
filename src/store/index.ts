import { signal } from "@preact/signals-react";

export const MINIMUM_DAYS = 365;
export const durationDaysState = signal(MINIMUM_DAYS);
