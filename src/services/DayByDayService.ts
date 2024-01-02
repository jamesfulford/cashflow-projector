import { getGlobal } from "./pyodide";
import { RulesService } from "./RulesService";

import { IApiParameters } from "./TransactionsService";

export interface IApiDayByDay {
  daybydays: {
    date: string;
    balance: {
      open: number;
      low: number;
      high: number;
      close: number;
    };
    working_capital: {
      open: number;
      low: number;
      high: number;
      close: number;
    };
    high_prediction: {
      open: number;
      low: number;
      high: number;
      close: number;
    };
    low_prediction: {
      open: number;
      low: number;
      high: number;
      close: number;
    };
  }[];
  params: {
    minimumEndDate: string;
  };
}

export class DayByDayApiService {
  public async fetchDayByDays(
    params: IApiParameters,
    highLowEnabled: boolean,
  ): Promise<IApiDayByDay> {
    const rules = await RulesService.fetchRules();
    const handle = getGlobal("process_daybydays");
    const response = handle(rules, {
      ...params,
      ...(highLowEnabled && { highLow: true }),
    }).toJs({
      dict_converter: Object.fromEntries,
    });

    return response;
  }
}

export const DayByDayService = new DayByDayApiService();
