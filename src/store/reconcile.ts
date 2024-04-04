import { computed, signal } from "@preact/signals-core";
import { daybydaysState } from "./daybydays";
import { startDateState } from "./parameters";
import { transactionsState } from "./transactions";

function currentDateLocalTimezone() {
  const nowDate = new Date();
  return `${nowDate.getFullYear()}-${(nowDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${nowDate.getDate().toString().padStart(2, "0")}`;
}
// actual date, not parameters startDate
export const todayState = signal<string>(currentDateLocalTimezone());
// update actual date intermittently
const intervalID = setInterval(
  () => {
    todayState.value = currentDateLocalTimezone();
  },
  5 * 60 * 1000,
);
if (import.meta.hot) {
  import.meta.hot.dispose(() => clearInterval(intervalID));
}

export const reconciliationRequiredState = computed(
  () => todayState.value !== startDateState.value,
);

export const reconciliationExpectedBalanceState = computed(() => {
  const todayDate = todayState.value;
  return daybydaysState.value.find((d) => d.date >= todayDate)?.balance
    .open as number;
});

export const reconciliationTransactionsState = computed(() => {
  const todayDate = todayState.value;
  const startDate = startDateState.value;
  return transactionsState.value.filter(
    (t) => t.day >= startDate && t.day < todayDate,
  );
});
