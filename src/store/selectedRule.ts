import { signal } from "@preact/signals-core";

export const selectedRuleIDState = signal<string | undefined>(undefined);

const unsub = selectedRuleIDState.subscribe((id) => {
  if (!id) return;
  setTimeout(() => {
    selectedRuleIDState.value = undefined;
  }, 1000);
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    unsub();
  });
}
