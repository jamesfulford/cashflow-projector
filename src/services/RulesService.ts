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
  userid: string;
}

export class RulesApiService {
  private async saveRules(rules: IApiRule[]) {
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
  private async getRules(): Promise<IApiRule[]> {
    return JSON.parse(localStorage.getItem("rules") || "[]") as IApiRule[];
  }

  public async fetchRules(): Promise<IApiRule[]> {
    return this.getRules();
  }

  public async createRule(rule: IApiRuleMutate): Promise<IApiRule> {
    const currentRules = await this.fetchRules();
    const newRule = { ...rule, id: String(Date.now()), userid: "local" };
    await this.saveRules([...currentRules, newRule]);
    return newRule;
  }

  public async updateRule(
    ruleid: string,
    rule: IApiRuleMutate,
  ): Promise<IApiRule> {
    const currentRules = await this.getRules();

    const foundRule = currentRules.find((r) => r.id === ruleid);
    if (!foundRule) throw new Error(`could not find rule with id ${ruleid}`);

    const updatedRule = {
      ...foundRule,
      ...rule,
    };

    const updatedRules = currentRules.map((r) => {
      if (r.id !== ruleid) return r;
      return updatedRule;
    });
    await this.saveRules(updatedRules);
    return updatedRule;
  }

  public async deleteRule(ruleid: string): Promise<void> {
    const currentRules = await this.getRules();
    const newRules = currentRules.filter((r) => r.id !== ruleid);
    await this.saveRules(newRules);
  }
}

export const RulesService = new RulesApiService();
