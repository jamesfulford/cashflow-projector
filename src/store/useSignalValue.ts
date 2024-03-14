import { Signal } from "@preact/signals-core";
import { useEffect, useState } from "react";

export function useSignalValue<T>(signal: Signal<T>): T {
  const [value, setValue] = useState(signal.peek());
  useEffect(() => signal.subscribe((v) => setValue(v)), [signal]);
  return value;
}
