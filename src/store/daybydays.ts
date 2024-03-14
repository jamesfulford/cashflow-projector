import { computed } from "@preact/signals-core";
import { getGlobal } from "../services/pyodide";
import { IParameters, parametersState } from "./parameters";
import { IApiRule, rulesState } from "./rules";
import { computedEndDate, displayEndDate } from "./executionContextParameters";

interface IApiParameters extends IParameters {
  endDate: string;
}

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

function computeDayByDays(
  rules: IApiRule[],
  parameters: IApiParameters,
): IApiDayByDay {
  const handle = getGlobal("process_daybydays");
  const response = handle(rules, {
    ...parameters,
    // if highLowEnabled, do highLow: true; else omit.
  }).toJs({
    dict_converter: Object.fromEntries,
  });
  return response;
}

const computedDayByDays = computed(() =>
  computeDayByDays(rulesState.value, {
    ...parametersState.value,
    endDate: computedEndDate.value,
  }),
);
export const daybydays = computed(() => {
  const displayEndDateValue = displayEndDate.value;
  return {
    ...computedDayByDays.value,
    daybydays: computedDayByDays.value.daybydays.filter(
      (d) => d.date <= displayEndDateValue,
    ),
  };
});
