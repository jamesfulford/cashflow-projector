import { IApiRule, IApiRuleMutate } from "../../../../store/rules";

export type PartialAddEditRuleType = {
  id: undefined;
} & Partial<IApiRuleMutate>;
export type AddEditRuleType = IApiRule | PartialAddEditRuleType;
