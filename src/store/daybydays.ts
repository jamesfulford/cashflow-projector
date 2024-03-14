import { computed } from "@preact/signals-core";
import { getGlobal } from "../services/pyodide";
import { IParameters, parametersState } from "./parameters";
import { IApiRule, rulesState } from "./rules";
import { computedEndDate, displayEndDate } from "./executionContextParameters";
import { highLowEnabledFlag } from "./flags";

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
  const response = handle(
    rules.map((r) => ({
      ...r,
      labels: r.labels ?? {},
    })),
    {
      ...parameters,
      ...(highLowEnabledFlag.peek() && { highLow: true }),
    },
  ).toJs({
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
export const daybydaysState = computed(() => {
  const displayEndDateValue = displayEndDate.value;
  return {
    ...computedDayByDays.value,
    daybydays: computedDayByDays.value.daybydays.filter(
      (d) => d.date <= displayEndDateValue,
    ),
  };
});

export const lowestSavingsState = computed(
  () => daybydaysState.value.daybydays.at(0)?.working_capital.low,
);
export const isBelowSafetyNetState = computed(
  () => lowestSavingsState.value && lowestSavingsState.value < 0,
);
