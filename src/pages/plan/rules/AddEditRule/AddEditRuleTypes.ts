import { IApiRule, IApiRuleMutate } from "../../../../services/RulesService";

export type PartialAddEditRuleType = {
  id: undefined;
} & Partial<IApiRuleMutate>;
export type AddEditRuleType = IApiRule | PartialAddEditRuleType;
