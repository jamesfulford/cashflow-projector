import { cleanRawRRuleString } from "../pages/plan/rules/AddEditRule/translation";
import { IParameters } from "./ParameterService";
import { RulesService } from "./RulesService";
import { getGlobal } from "./pyodide";

export interface IApiParameters extends IParameters {
  endDate: string;
}

export interface IApiTransaction {
  rule_id: string;
  id: string;
  name: string;
  value: number;
  day: string;
  calculations: {
    balance: number;
    working_capital: number;
  };
}

export class TransactionsApiService {
  public fetchTransactions(params: IApiParameters): IApiTransaction[] {
    const rules = RulesService.fetchRules().map((r) => {
      return {
        ...r,
        rrule: cleanRawRRuleString(r.rrule),
      };
    });
    const handle = getGlobal("get_transactions");
    const response = handle(rules, params).toJs({
      dict_converter: Object.fromEntries,
    });

    return response.transactions as IApiTransaction[];
  }
}

export const TransactionsService = new TransactionsApiService();
