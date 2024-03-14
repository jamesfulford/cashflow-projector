import { signal } from "@preact/signals-core";

export interface IFlags {
  highLowEnabled: boolean;
}

export const flagsState = signal({ highLowEnabled: false });
