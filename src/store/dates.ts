import { signal } from "@preact/signals-react";

// stores the date, in "2024-02-01" format, that was recently clicked on in the graph
// (used more like an emitter than a piece of state)
export const chartSelectedDateState = signal<string | undefined>(undefined);
