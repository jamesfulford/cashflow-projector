import { Signal } from "@preact/signals-core";
import { useSyncExternalStore } from "react";

export function useSignalValue<T>(signal: Signal<T>): T {
  return useSyncExternalStore(
    signal.subscribe.bind(signal),
    signal.peek.bind(signal),
  );
}
