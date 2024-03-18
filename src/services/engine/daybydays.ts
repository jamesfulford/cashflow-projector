import { IParameters } from "../../store/parameters";
import { IApiTransaction } from "../../store/transactions";
import { eachDayOfInterval, format } from "date-fns";

interface ComputationalParameters extends IParameters {
  endDate: string;
}

interface Candle {
  open: number;
  low: number;
  high: number;
  close: number;
}

export interface DayByDay {
  date: string;
  volume: number;
  balance: Candle;
  working_capital: Candle;
}

function buildCandle(values: number[]): Candle {
  const open = Math.round(100 * values[0]) / 100;
  const low = Math.round(100 * Math.min(...values)) / 100;
  const high = Math.round(100 * Math.max(...values)) / 100;
  const close = Math.round(100 * values[values.length - 1]) / 100;
  return { open, low, high, close };
}

export function computeDayByDays(
  _transactions: IApiTransaction[],
  parameters: ComputationalParameters,
): DayByDay[] {
  if (_transactions.length === 0) return [];

  let i = 0; // for traversing transactions

  // So our initial balance and working_capital calculations are accurate,
  // inserting a dummy first transaction on the start day
  const firstTransaction: IApiTransaction = {
    id: "starting-transaction-1",
    rule_id: "fake-starting-transaction",
    value: 0,
    day: parameters.startDate,
    name: "",
    calculations: {
      balance: parameters.currentBalance,
      // initial working_capital is before the first transaction
      // it will be the working_capital of the first transaction or the current working capital (current - set_aside), whichever is lower.
      // (current will be used in case of first transaction triggering working_capital growth,
      // so users don't assume they have money that they'll get when their first transaction comes in)
      working_capital: Math.min(
        _transactions[0].calculations.working_capital,
        parameters.currentBalance - parameters.setAside,
      ),
    },
  };

  const transactions = [firstTransaction, ..._transactions];

  let currentBalance = transactions[0].calculations.balance;
  let currentWorkingCapital = transactions[0].calculations.working_capital;

  const days = eachDayOfInterval({
    // date-fns applies a timezone offset if you include a Z here
    start: parameters.startDate + "T00:00:00",
    end: parameters.endDate + "T00:00:00",
  });

  return days
    .map((d) => format(d, "yyyy-MM-dd"))
    .map((currentDay) => {
      // Get all transactions for this day
      const todaysTransactions = [];
      while (i < transactions.length && transactions[i].day == currentDay) {
        todaysTransactions.push(transactions[i]);
        i += 1;
      }

      let volume = todaysTransactions.length;
      if (currentDay == parameters.startDate) {
        // we add a dummy transaction on day 1; should not count toward volume
        volume -= 1;
      }

      const balances = [
        currentBalance,
        ...todaysTransactions.map((t) => t.calculations.balance),
      ];
      const workingCapitals = [
        currentWorkingCapital,
        ...todaysTransactions.map((t) => t.calculations.working_capital),
      ];
      const todaysCandle: DayByDay = {
        date: currentDay,
        volume,
        balance: buildCandle(balances),
        working_capital: buildCandle(workingCapitals),
      };

      currentBalance = todaysCandle.balance.close;
      currentWorkingCapital = todaysCandle.working_capital.close;

      return todaysCandle;
    });
}
