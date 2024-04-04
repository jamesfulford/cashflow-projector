import { useMemo } from "react";
import { Currency } from "../../../../components/currency/Currency";
import { IApiRule, IApiRuleMutate } from "../../../../store/rules";
import {
  fromDateToString,
  fromStringToDate,
  getDatesOfRule,
} from "../../../../services/engine/rrule";
import { addDays } from "date-fns/addDays";
import { useCurrentRule } from "./useCurrentRule";
import { getLongFrequencyDisplayString } from "./extract-rule-details";
import { useSignalValue } from "../../../../store/useSignalValue";
import { startDateState } from "../../../../store/parameters";

function RawRulePreview({ rule }: { rule: IApiRuleMutate }) {
  const startDate = useSignalValue(startDateState);

  const value = rule.value;

  const message = useMemo(() => {
    return getLongFrequencyDisplayString(rule);
  }, [rule]);

  const [next, oneAfter] = useMemo(() => {
    if (rule.rrule === undefined) {
      return [undefined, undefined];
    }

    // next 2 occurences in the future (cap off at 3 years)
    return getDatesOfRule(
      rule as IApiRule,
      startDate,
      fromDateToString(addDays(fromStringToDate(startDate), 3 * 365)),
    ).slice(0, 2);
  }, [rule, startDate]);

  return (
    <div>
      <p className="m-0">
        {value && Number.isFinite(value) ? (
          <Currency value={value} />
        ) : (
          "Occurs"
        )}{" "}
        {message}
      </p>

      {next && (
        <p className="m-0">
          Next is {next}
          {oneAfter && `, then ${oneAfter}`}
        </p>
      )}
    </div>
  );
}

export function RulePreview() {
  const rule = useCurrentRule();
  if (!rule) return;
  return <RawRulePreview rule={rule} />;
}
