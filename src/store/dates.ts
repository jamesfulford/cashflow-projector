import { signal } from "@preact/signals-react";

// stores the date, in "2024-02-01" format, that was recently clicked on in the graph
// (used more like an emitter than a piece of state)
export const chartSelectedDateState = signal<string | undefined>(undefined);

// stores the date that the last deferral was done with
export const lastDeferredToDateState = signal<string | undefined>(undefined);
