import { IApiRule, rulesState } from "../../../store/rules";
import {
  expenseSharesState,
  impactScoresState,
  rawImpactState,
} from "../../../store/ratios";
import { ReadonlySignal, computed } from "@preact/signals-core";
import { lastPaymentDayResultByRuleIDState } from "../../../store/computationDates";
import { computeLastPaymentDay } from "../../../services/engine/computeLastPaymentDate";

export type EnhancedRule = IApiRule & {
  impact: number;
  shareOfIncome: number;
  lastPaymentDayResult?: ReturnType<typeof computeLastPaymentDay>;
} & (
    | { isIncome: true; isExpense: false }
    | { isIncome: false; isExpense: true; shareOfExpenses: number }
  );
export const enhancedRulesState: ReadonlySignal<EnhancedRule[]> = computed(
  () => {
    const rules = rulesState.value;
    const sharesOfIncome = impactScoresState.value;
    const impacts = rawImpactState.value;
    const sharesOfExpenses = expenseSharesState.value;
    const lastPaymentDayResultByRuleID =
      lastPaymentDayResultByRuleIDState.value;

    return rules.map((r) => {
      const impact = impacts.get(r.id) ?? 0;
      const shareOfIncome = sharesOfIncome.get(r.id) ?? 0;
      const lastPaymentDayResult = lastPaymentDayResultByRuleID.get(r.id);

      const isExpense = impact <= 0;
      if (isExpense) {
        const shareOfExpenses = sharesOfExpenses.get(r.id) ?? 0;
        return {
          ...r,
          impact,
          shareOfIncome,
          isExpense: true,
          isIncome: false,
          shareOfExpenses,
          lastPaymentDayResult,
        };
      }
      return {
        ...r,
        impact,
        shareOfIncome,
        isExpense: false,
        isIncome: true,
        lastPaymentDayResult,
      };
    });
  },
);
