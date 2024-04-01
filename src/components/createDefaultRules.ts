import { RRule } from "rrule";
import { IApiRuleMutate } from "../store/rules";

export function createDefaultRules(): IApiRuleMutate[] {
  return [
    {
      name: "Paycheck",
      value: 2000,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        interval: 2,
        byweekday: RRule.TH,
        dtstart: new Date(),
      }).toString(),
      exceptionalTransactions: [],
    },

    {
      name: "Rent",
      value: -1200,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 1,
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "Utilities",
      value: -100,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 25,
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "Cell",
      value: -40,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 1,
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "Gas",
      value: -30,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.FR,
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "Food",
      value: -50,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.FR,
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "Coffee",
      value: -5,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: [RRule.MO, RRule.WE, RRule.FR],
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "Car Payment",
      value: -250,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 25,
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "Car Insurance",
      value: -250,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        interval: 6,
        bymonthday: 25,
        dtstart: new Date(),
      }).toString(),
      exceptionalTransactions: [],
    },
    {
      name: "YouTube Premium",
      value: -140,
      rrule: new RRule({
        freq: RRule.YEARLY,
        dtstart: new Date(),
      }).toString(),
      exceptionalTransactions: [],
    },
  ];
}
