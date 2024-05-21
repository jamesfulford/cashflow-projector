import { test, expect } from "vitest";
import { computeTransactions } from "./transactions";
import { RuleType } from "../../store/rules";
import { RRule, RRuleSet } from "rrule";
import { fromStringToDate } from "./rrule";

test("should compute weekly rule transactions", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2024-06-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toMatchSnapshot();
});

test("should compute monthly rule transactions", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.MONTHLY,
          bymonthday: 1,
        }).toString(),
        exceptionalTransactions: [],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2024-09-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toMatchSnapshot();
});

test("should compute yearly rule transactions", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.YEARLY,
          dtstart: fromStringToDate("2024-06-01"),
        }).toString(),
        exceptionalTransactions: [],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2029-09-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toMatchSnapshot();
});

test("should honor count end type", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
          count: 2,
        }).toString(),
        exceptionalTransactions: [],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2024-06-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toHaveLength(2);
  expect(transactions).toMatchSnapshot();
});

test("should honor until end type", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
          until: fromStringToDate("2024-05-30"),
        }).toString(),
        exceptionalTransactions: [],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2024-06-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions[transactions.length - 1].day).not.toContain("2024-06");
  expect(transactions).toMatchSnapshot();
});

test("should honor exdates", () => {
  const rruleset = new RRuleSet();
  rruleset.rrule(
    new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO],
      until: fromStringToDate("2024-05-30"),
    }),
  );
  //   this is like skipping a transaction
  rruleset.exdate(fromStringToDate("2024-05-27"));

  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: rruleset.toString(),
        exceptionalTransactions: [],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2024-05-30",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions[transactions.length - 1].day).not.toBe("2024-05-27");
  expect(transactions).toMatchSnapshot();
});

test("should honor exdates except for exceptionalTransactions", () => {
  const rruleset = new RRuleSet();
  rruleset.rrule(
    new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO],
      until: fromStringToDate("2024-05-30"),
    }),
  );
  rruleset.exdate(fromStringToDate("2024-05-27"));

  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: rruleset.toString(),
        // having the exdate is similar to renaming/revaluing a transaction
        exceptionalTransactions: [
          {
            day: "2024-05-27",
            value: -20,
            name: "rule 1 exception",
            id: "exceptionalTransaction1",
          },
        ],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2024-05-30",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions[transactions.length - 1].day).toBe("2024-05-27");
  expect(transactions[transactions.length - 1].value).toBe(-20);
  expect(transactions[transactions.length - 1].name).toBe("rule 1 exception");
  expect(transactions[transactions.length - 1].exceptionalTransactionID).toBe(
    "exceptionalTransaction1",
  );
  expect(transactions).toMatchSnapshot();
});

test("should compute working_capital properly", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.EXPENSE,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [],
      },
      {
        id: "rule2",
        name: "rule 2",
        type: RuleType.INCOME,
        version: 1,

        value: 200,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          interval: 2,
          dtstart: fromStringToDate("2024-05-01"),
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [],
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2024-08-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toMatchSnapshot();
});

test("should compute savings goal transactions", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.SAVINGS_GOAL,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [],

        progress: 902,
        goal: 1000,
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2025-05-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toHaveLength(10);
  expect(transactions[transactions.length - 1].value).toBe(-8); // only what's needed to finish the goal
  expect(transactions).toMatchSnapshot();
});

test("should compute savings goal transactions even when goal is hit exactly", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.SAVINGS_GOAL,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [],

        progress: 980,
        goal: 1000,
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2025-05-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toHaveLength(2);
  expect(transactions[transactions.length - 1].value).toBe(-10);
  expect(transactions[transactions.length - 1].isLastPayment).toBe(true);
  expect(transactions).toMatchSnapshot();
});

test("should compute savings goal transactions with exceptional transactions", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.SAVINGS_GOAL,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [
          { id: "exceptionalTransaction1", day: "2024-06-01", value: -50 },
        ],

        progress: 902,
        goal: 1000,
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2025-05-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toHaveLength(6);
  expect(transactions).toMatchSnapshot();
});

test("should exclude exceptional transactions from savings goal if not needed", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.SAVINGS_GOAL,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [
          { id: "exceptionalTransaction1", day: "2024-08-01", value: -50 },
        ],

        progress: 902,
        goal: 1000,
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2025-05-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toHaveLength(10);
  expect(transactions.map((t) => t.day)).not.toContain("2024-08-01");
  expect(transactions).toMatchSnapshot();
});

test("should include no transactions from savings goal if already met", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.SAVINGS_GOAL,
        version: 1,

        value: -10,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [],

        progress: 1000,
        goal: 1000,
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2025-05-19",
      currentBalance: 1000,
      setAside: 1000,
    },
  );
  expect(transactions).toHaveLength(0);
});

test("should compute loan transactions", () => {
  const transactions = computeTransactions(
    [
      {
        id: "rule1",
        name: "rule 1",
        type: RuleType.LOAN,
        version: 1,

        value: -400,
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byweekday: [RRule.MO],
        }).toString(),
        exceptionalTransactions: [],

        balance: 1000,
        interestRate: 0.08,
        minimumPayment: 0,
      },
    ],
    {
      startDate: "2024-05-19",
      endDate: "2034-05-19",
      currentBalance: 20000,
      setAside: 1000,
    },
  );
  expect(transactions).toHaveLength(3);
  expect(transactions[transactions.length - 1].value.toFixed(2)).toBe(
    "-201.39",
  ); // only what's needed to finish the goal; not -400
  expect(transactions).toMatchSnapshot();
});
