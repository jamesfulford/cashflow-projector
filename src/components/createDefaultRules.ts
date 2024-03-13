import { RRule } from "rrule";
import { IApiRuleMutate } from "../services/RulesService";

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
    },

    {
      name: "Rent",
      value: -1200,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 1,
      }).toString(),
    },
    {
      name: "Utilities",
      value: -100,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 25,
      }).toString(),
    },
    {
      name: "Cell",
      value: -40,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 1,
      }).toString(),
    },
    {
      name: "Gas",
      value: -30,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.FR,
      }).toString(),
    },
    {
      name: "Food",
      value: -50,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.FR,
      }).toString(),
    },
    {
      name: "Coffee",
      value: -5,
      rrule: new RRule({
        freq: RRule.WEEKLY,
        byweekday: [RRule.MO, RRule.WE, RRule.FR],
      }).toString(),
    },
    {
      name: "Car Payment",
      value: -250,
      rrule: new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 25,
      }).toString(),
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
    },
    {
      name: "YouTube Premium",
      value: -140,
      rrule: new RRule({
        freq: RRule.YEARLY,
        dtstart: new Date(),
      }).toString(),
    },
  ];
}
