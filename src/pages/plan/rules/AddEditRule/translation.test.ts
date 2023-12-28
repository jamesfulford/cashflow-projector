import { RRule } from "rrule";
import {
  convertWorkingStateToApiRuleMutate,
  ruleToWorkingState,
} from "./translation";

const rules = [
  {
    name: "Twice Weekly Gas",
    value: -30,
    rrule: new RRule({
      freq: RRule.WEEKLY,
      // multiple days are preserved
      byweekday: [RRule.MO, RRule.TH],
    }).toString(),
    labels: {},
  },
  {
    name: "Weekly Groceries",
    value: -120,
    rrule: new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.SU],
      interval: 1,
    }).toString(),
    labels: {},
  },
  {
    name: "Biweekly Paycheck",
    value: 2000,
    rrule: new RRule({
      freq: RRule.WEEKLY,
      interval: 2,
      byweekday: [RRule.TH],
      dtstart: new Date("2020-11-03"),
      until: new Date("2021-05-22"),
    }).toString(),
    labels: {},
  },
  {
    name: "Monthly Rent",
    value: -1000,
    rrule: new RRule({
      freq: RRule.MONTHLY,
      bymonthday: 1,
      dtstart: new Date("2020-11-03"),
    }).toString(),
    labels: {},
  },
  {
    name: "Yearly Birthday",
    value: -100,
    rrule: new RRule({
      freq: RRule.YEARLY,
      dtstart: new Date("2020-10-01"),
    }).toString(),
    labels: {},
  },
  {
    name: "Once Tuition",
    value: -100,
    rrule: new RRule({
      freq: RRule.YEARLY,
      dtstart: new Date("2020-01-25"),
      count: 1,
    }).toString(),
    labels: {
      // assorted labels are preserved
      category: "school",
    },
  },
  {
    name: "Hebrew Firstfruits",
    value: -2600,
    rrule: "X-YEARLY-HEBREW: 1, 16",
    labels: {},
  },
];

const rulesWithUncertainty = [
  {
    ...rules[0],
    labels: {
      uncertainty: true,
      lowUncertainty: rules[0].value - 10,
      highUncertainty: rules[0].value + 20,
    },
  },
];

const invalidRules = [
  {
    ...rules[0],
    rrule: "asdfwqerqw",
  },
  ...[RRule.DAILY, RRule.HOURLY, RRule.MINUTELY, RRule.SECONDLY].map(
    (freq) => ({
      ...rules[0],
      rrule: new RRule({
        freq,
      }).toString(),
    }),
  ),
];

describe("editing translation", () => {
  rules.forEach((rule) => {
    it(`should have no impact if editless ${rule.name}`, () => {
      const workingState = ruleToWorkingState(rule);
      const outputRule = convertWorkingStateToApiRuleMutate(workingState, {
        highLowEnabled: false,
      });

      expect(outputRule).toEqual(rule);
    });
  });

  describe("with isHighLowEnabled", () => {
    rules.forEach((rule) => {
      it(`editing should add uncertainty if editless ${rule.name}`, () => {
        const workingState = ruleToWorkingState(rule);
        const outputRule = convertWorkingStateToApiRuleMutate(workingState, {
          highLowEnabled: true,
        });

        expect(outputRule).toEqual({
          ...rule,
          labels: {
            ...rule.labels,
            uncertainty: false,
          },
        });
      });
    });

    rulesWithUncertainty.forEach((rule) => {
      describe(rule.name, () => {
        it(`should keep uncertainty labels if editless`, () => {
          const workingState = ruleToWorkingState(rule);
          const outputRule = convertWorkingStateToApiRuleMutate(workingState, {
            highLowEnabled: true,
          });

          expect(outputRule).toEqual(rule);
        });
      });
    });
  });

  describe("canonicalization", () => {
    it(`should canonicalize byhour byminute bysecond byweekno byeaster wkst count!=1`, () => {
      const rule = {
        ...rules[0],
        rrule: new RRule({
          freq: RRule.WEEKLY,
          byhour: 2,
          byminute: 4,
          bysecond: 21,
          byweekno: 1,
          byeaster: 1,
          wkst: RRule.WE,
          count: 4,
        }).toString(),
      };
      const workingState = ruleToWorkingState(rule);
      const outputRule = convertWorkingStateToApiRuleMutate(workingState, {});

      expect(outputRule).toEqual({
        ...rule,
        rrule: new RRule({
          freq: RRule.WEEKLY,
        }).toString(),
      });
    });

    it("should normalize byweekday to an array of numbers for sanity", () => {
      const workingState = ruleToWorkingState(
        rules.find((r) => r.name.includes("Weekly")),
      );
      expect(workingState.rrule.byweekday).toBeTruthy();
      workingState.rrule.byweekday?.forEach((w) => {
        expect(typeof w).toBe("number");
      });
    });
  });

  describe("unsupported rules", () => {
    invalidRules.forEach((rule) => {
      it(`should throw error for ${rule.rrule}`, () => {
        expect(() => ruleToWorkingState(rule)).toThrowError();
      });
    });
  });
});
