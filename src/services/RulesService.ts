import { cleanRawRRuleString } from "../pages/plan/rules/AddEditRule/translation";

// When creating and updating rules
export interface IApiRuleMutate {
  name: string;
  rrule: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels?: { [label: string]: any };
}

// Extra server-assigned fields which
export interface IApiRule extends IApiRuleMutate {
  id: string;
}

export class RulesApiService {
  private saveRules(rules: IApiRule[]) {
    localStorage.setItem(
      "rules",
      JSON.stringify(
        rules.map((r) => ({
          labels: {},
          ...r,
        })),
      ),
    );
  }
  private getRules(): IApiRule[] {
    return JSON.parse(localStorage.getItem("rules") || "[]") as IApiRule[];
  }

  public fetchRules(): IApiRule[] {
    return this.getRules().map((r) => {
      return {
        ...r,
        rrule: cleanRawRRuleString(r.rrule),
      };
    });
  }

  public createRule(rule: IApiRuleMutate): IApiRule {
    const currentRules = this.fetchRules();
    const newRule = { ...rule, id: String(Date.now()) };
    this.saveRules([...currentRules, newRule]);
    return newRule;
  }

  public batchCreateRules(rules: IApiRuleMutate[]): IApiRule[] {
    const currentRules = this.fetchRules();
    const now = Date.now();
    const newRules = rules.map((rule, i) => ({
      ...rule,
      id: String(now) + "-" + i,
    }));
    this.saveRules([...currentRules, ...newRules]);
    return newRules;
  }

  public updateRule(ruleid: string, rule: IApiRuleMutate): IApiRule {
    const currentRules = this.getRules();

    const foundRule = currentRules.find((r) => r.id === ruleid);
    if (!foundRule) throw new Error(`could not find rule with id ${ruleid}`);

    const updatedRule = {
      ...foundRule,
      ...rule,
    };
    updatedRule.rrule = cleanRawRRuleString(updatedRule.rrule);

    const updatedRules = currentRules.map((r) => {
      if (r.id !== ruleid) return r;
      return updatedRule;
    });
    this.saveRules(updatedRules);
    return updatedRule;
  }

  public deleteRule(ruleid: string): void {
    const currentRules = this.getRules();
    const newRules = currentRules.filter((r) => r.id !== ruleid);
    this.saveRules(newRules);
  }
}

export const RulesService = new RulesApiService();
