import { RRule } from "rrule/dist/esm/rrule";
import { RRuleSet } from "rrule/dist/esm/rruleset";
import { rrulestr } from "rrule/dist/esm/rrulestr";
import { fromDateToString } from "../../../services/engine/rrule";
import { IApiRule, RuleType } from "../../../store/rules";

// Migration notes
//
// in the beginning, ONCE dates ("one time transactions", predecessor to exceptionalTransactions)
// were captured using an rrule with freq=YEARLY, count=1.
//
// This migration removes the rrule
// and puts the dtstart as an entry in exceptionalTransactions.
//

interface RuleOriginal {
  id: string;
  name: string;
  value: number;
  rrule: string;

  labels?: Record<string, string>; // doesn't matter type; we don't want it
}

function _extractLegacyOnceRuleDate(rrulestring: string): string | undefined {
  const rruleset = rrulestr(rrulestring, { forceset: true }) as RRuleSet;
  const rrules = rruleset.rrules();
  if (rrules.length !== 1) return;
  const rrule = rrules[0];
  // legacy "ONCE" rules are Yearly and had a count of 1
  if (!(rrule.options.freq === RRule.YEARLY && rrule.options.count === 1))
    return;
  return fromDateToString(rrule.options.dtstart);
}
export function migrateLegacyOnceRules(_rule: IApiRule): IApiRule {
  // trying to guard to only apply to old rules

  if (_rule.version) return _rule; // don't apply to recent rules.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(_rule as any).rrule) return _rule; // v0 list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((_rule as any).type) return _rule; // v0 but with types (income/expense)

  // OK, maybe we have an old rule now

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rule = _rule as any as RuleOriginal;

  // handle legacy "ONCE" rules
  const legacyOnceDate = _extractLegacyOnceRuleDate(rule.rrule);
  if (!legacyOnceDate) return rule as IApiRule; // next migration will resolve anything wrong

  // convert to a "list" rule
  return {
    id: rule.id,
    name: rule.name,
    version: 1,

    type: RuleType.TRANSACTIONS_LIST,
    exceptionalTransactions: [
      {
        id: `${Date.now()}`,
        day: legacyOnceDate,
        value: rule.value,
        name: rule.name,
      },
    ],
  };
}
