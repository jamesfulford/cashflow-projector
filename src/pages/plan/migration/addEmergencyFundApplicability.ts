import { IApiRule, RuleType } from "../../../store/rules";

export type EmergencyScenarioApplicability = boolean;

export function computeDefaultEmergencyScenarioApplicability(
  rule: IApiRule,
): EmergencyScenarioApplicability {
  switch (rule.type) {
    case RuleType.EXPENSE:
      return true;
    case RuleType.INCOME:
      return false;
    case RuleType.SAVINGS_GOAL:
      return false;
    case RuleType.LOAN:
      return true;
    case RuleType.TRANSACTIONS_LIST:
      return false;
  }
}

export function addEmergencyFundApplicability(rule: IApiRule) {
  // Do not apply if already exists
  if (
    "emergencyScenarioApplicability" in
    (rule as unknown as Record<string, unknown>)
  ) {
    return rule;
  }
  const emergencyScenarioApplicability =
    computeDefaultEmergencyScenarioApplicability(rule);
  return {
    ...rule,
    emergencyScenarioApplicability,
  };
}
