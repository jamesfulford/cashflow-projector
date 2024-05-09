import { RRule } from "rrule";
import { IApiRuleMutate, RuleType } from "../store/rules";
import { todayState } from "../store/reconcile";
import { fromStringToDate } from "../services/engine/rrule";

function buildStart() {
  return fromStringToDate(todayState.peek());
}

export function createDefaultRules(): IApiRuleMutate[] {
  return [
    {
      name: "Paycheck",
      value: 2000,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 2,
        byweekday: RRule.TH,
        dtstart: buildStart(),
      }).toString(),
    },

    {
      name: "Rent",
      value: -1200,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: 1,
      }).toString(),
    },
    {
      name: "Utilities",
      value: -100,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: 25,
      }).toString(),
    },
    {
      name: "Cell",
      value: -40,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: 1,
      }).toString(),
    },
    {
      name: "Gas",
      value: -30,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: RRule.FR,
      }).toString(),
    },
    {
      name: "Food",
      value: -50,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: RRule.FR,
      }).toString(),
    },
    {
      name: "Coffee",
      value: -5,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: [RRule.MO, RRule.WE, RRule.FR],
      }).toString(),
    },
    {
      name: "Car Payment",
      value: -250,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: 25,
      }).toString(),
    },
    {
      name: "Car Insurance",
      value: -250,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 6,
        bymonthday: 25,
        dtstart: buildStart(),
      }).toString(),
    },
    {
      name: "YouTube Premium",
      value: -140,
      rrule: new RRule({
        freq: RRule.YEARLY,
        interval: 1,
        dtstart: buildStart(),
      }).toString(),
    },
  ].map((r) => {
    return {
      type: r.value > 0 ? RuleType.INCOME : RuleType.EXPENSE,
      exceptionalTransactions: [],
      ...r,
    };
  });
}
