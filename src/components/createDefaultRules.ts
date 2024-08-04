import { RRule } from "rrule";
import {
  IApiRule,
  IApiRuleMutate,
  RecurringRuleMutate,
  RuleType,
  currentVersion,
} from "../store/rules";
import { todayState } from "../store/reconcile";
import { fromStringToDate } from "../services/engine/rrule";
import { computeDefaultEmergencyScenarioApplicability } from "../pages/plan/migration/addEmergencyFundApplicability";

function buildStart() {
  return fromStringToDate(todayState.peek());
}

function buildRule(
  rule: Omit<
    RecurringRuleMutate,
    | "type"
    | "exceptionalTransactions"
    | "version"
    | "emergencyScenarioApplicability"
  >,
): IApiRuleMutate {
  const type = rule.value > 0 ? RuleType.INCOME : RuleType.EXPENSE;
  return {
    type,
    exceptionalTransactions: [],
    version: currentVersion,
    emergencyScenarioApplicability:
      computeDefaultEmergencyScenarioApplicability({ type } as IApiRule),
    ...rule,
  };
}

export function createDefaultRules(): IApiRuleMutate[] {
  const defaultRules: IApiRuleMutate[] = [];

  defaultRules.push(
    buildRule({
      name: "Paycheck",
      value: 2000,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 2,
        byweekday: RRule.TH,
        dtstart: buildStart(),
      }).toString(),
    }),
  );

  defaultRules.push(
    buildRule({
      name: "Rent",
      value: -1200,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: 1,
      }).toString(),
    }),
  );

  defaultRules.push(
    buildRule({
      name: "Utilities",
      value: -100,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: 25,
      }).toString(),
    }),
  );

  defaultRules.push(
    buildRule({
      name: "Cell",
      value: -40,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: 1,
      }).toString(),
    }),
  );

  defaultRules.push(
    buildRule({
      name: "Gas",
      value: -30,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: RRule.FR,
      }).toString(),
    }),
  );

  defaultRules.push(
    buildRule({
      name: "Food",
      value: -50,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: RRule.FR,
      }).toString(),
    }),
  );

  defaultRules.push({
    name: "Car Payment",
    type: RuleType.LOAN,
    value: -250,
    rrule: new RRule({
      freq: RRule.MONTHLY,
      interval: 1,
      bymonthday: 25,
    }).toString(),

    balance: 4000,
    apr: 0.08,
    compoundingsYearly: 12,

    version: currentVersion,
    exceptionalTransactions: [],
    emergencyScenarioApplicability: true,
  });

  defaultRules.push(
    buildRule({
      name: "Car Insurance",
      value: -250,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 6,
        bymonthday: 25,
        dtstart: buildStart(),
      }).toString(),
    }),
  );

  defaultRules.push(
    buildRule({
      name: "YouTube Premium",
      value: -140,
      rrule: new RRule({
        freq: RRule.YEARLY,
        interval: 1,
        dtstart: buildStart(),
      }).toString(),
    }),
  );

  return defaultRules;
}
