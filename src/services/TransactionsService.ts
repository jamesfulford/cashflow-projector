import { IParameters } from "../store/reducers/parameters";
import { RulesService } from "./RulesService";
import { getGlobal } from "./pyodide";

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
  public async fetchTransactions(
    params: IParameters,
  ): Promise<IApiTransaction[]> {
    const rules = await RulesService.fetchRules();
    const handle = getGlobal("get_transactions");
    const response = handle(rules, params).toJs({
      dict_converter: Object.fromEntries,
    });

    return response.transactions as IApiTransaction[];
  }

  public exportTransactionsUrl(params: IParameters): string {
    // TODO: reimplement
    console.warn("unimplemented: exportTransactionsUrl", params);
    return "";
  }
}

export const TransactionsService = new TransactionsApiService();
