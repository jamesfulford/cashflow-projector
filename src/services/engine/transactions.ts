import { IParameters } from "../../store/parameters";
import { IApiRule, isTransactionsListRule } from "../../store/rules";
import { IApiTransaction } from "../../store/transactions";
import reverse from "lodash/reverse";
import sortBy from "lodash/sortBy";
import { getDatesOfRRule } from "./rrule";

interface ComputationalParameters extends IParameters {
  endDate: string;
}

interface Entry {
  rule_id: string;
  id: string;
  name: string;
  value: number;
  day: string;
  exceptionalTransactionID?: string;
}
function computeEntries(
  rules: IApiRule[],
  parameters: ComputationalParameters,
): Entry[] {
  const entries = rules
    .map((rule): Entry[] => {
      if (isTransactionsListRule(rule)) {
        return rule.exceptionalTransactions.map((t) => ({
          rule_id: rule.id,
          id: `${rule.id}::${t.day}::${t.id}`,
          name: t.name,
          value: t.value,
          day: t.day,
          exceptionalTransactionID: t.id,
        }));
      }

      // is recurring rule
      const exceptionalTransactions: Entry[] = rule.exceptionalTransactions.map(
        (t) => ({
          rule_id: rule.id,
          id: `${rule.id}::${t.day}::${t.id}`,
          name: t.name ?? rule.name,
          value: t.value ?? rule.value,
          day: t.day,
          exceptionalTransactionID: t.id,
        }),
      );

      const dates = rule.rrule
        ? getDatesOfRRule(rule.rrule, parameters.startDate, parameters.endDate)
        : [];
      const rruleTransactions: Entry[] = dates.map((dString) => {
        const entry: Entry = {
          rule_id: rule.id,
          id: `${rule.id}::${dString}`,
          name: rule.name,
          value: rule.value,
          day: dString,
        };
        return entry;
      });

      return [...exceptionalTransactions, ...rruleTransactions];
    })
    .flat();

  // transactions should go from least to greatest
  // for the sake of working_capital calculations
  return sortBy(entries, ["day", "value"]);
}

function setBalances(transactions: IApiTransaction[], parameters: IParameters) {
  let balance = parameters.currentBalance;
  transactions.forEach((transaction) => {
    balance = transaction.value + balance;
    transaction.calculations.balance = balance;
  });
}

function setWorkingCapitals(
  transactions: IApiTransaction[],
  parameters: IParameters,
) {
  // STEP 1
  // group all transactions into runs of expenses
  // and calculate the lowest balance in each run

  // expense_segments is an array of arrays of transactions
  // where each array starts with an income transaction
  // and the rest are expenses.
  type ExpenseSegment = IApiTransaction[];
  const expense_segments: ExpenseSegment[] = [];

  function add_es(es: ExpenseSegment) {
    if (es.length) {
      const lowestBalanceInSegment = Math.min(
        ...es.map((t) => t.calculations.balance),
      );
      es.forEach((t) => {
        t.calculations.working_capital =
          lowestBalanceInSegment - parameters.setAside;
      });
      expense_segments.push(es);
    }
  }

  // this is a temp variable for building an expense_segment
  let current_expense_segment: ExpenseSegment = [];
  transactions.forEach((transaction) => {
    if (transaction.value > 0) {
      add_es(current_expense_segment);
      current_expense_segment = [];
    }
    current_expense_segment.push(transaction);
  });
  if (current_expense_segment.length) add_es(current_expense_segment);

  // STEP 2
  // make sure the working_capital of transactions inside each expense segment
  // is always increasing over time
  // (a.k.a. decreasing as you go backwards)
  if (expense_segments.length) {
    let lowest =
      expense_segments[expense_segments.length - 1][0].calculations
        .working_capital; // initial value
    reverse(expense_segments).forEach((segment) => {
      lowest = Math.min(lowest, segment[0].calculations.working_capital);
      segment.forEach((transaction) => {
        transaction.calculations.working_capital = lowest;
      });
    });
  }
}

export function computeTransactions(
  rules: IApiRule[],
  parameters: ComputationalParameters,
): IApiTransaction[] {
  const entries = computeEntries(rules, parameters);

  const transactions = entries.map((e) => {
    const transaction: IApiTransaction = {
      ...e,
      calculations: {
        balance: 0,
        working_capital: 0,
      },
    };
    return transaction;
  });

  setBalances(transactions, parameters);
  setWorkingCapitals(transactions, parameters);

  return transactions;
}
