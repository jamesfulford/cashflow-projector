import { computed } from "@preact/signals-core";
import { transactionsState } from "./transactions";
import { rulesState } from "./rules";

export const rawImpactState = computed(() => {
  const transactions = transactionsState.value;

  const impacts = new Map(rulesState.value.map((r) => [r.id, 0]));

  transactions.forEach((t) => {
    const score = impacts.get(t.rule_id) ?? 0;
    impacts.set(t.rule_id, score + Math.abs(t.value));
  });

  return impacts;
});

export const impactScoresState = computed(() => {
  const maxScore = Math.max(...rawImpactState.value.values());
  return new Map(
    Array.from(rawImpactState.value.entries()).map(
      ([id, score]: [string, number]) => [id, (100 * score) / maxScore],
    ),
  );
});
