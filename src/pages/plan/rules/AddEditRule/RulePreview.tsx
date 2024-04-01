import { useMemo } from "react";
import { Currency } from "../../../../components/currency/Currency";
import { IApiRuleMutate } from "../../../../store/rules";
import { getPreviewDetails } from "./extract-rule-details";
import {
  fromDateToString,
  getDatesOfRRule,
} from "../../../../services/engine/rrule";
import { addDays } from "date-fns/addDays";

export function RulePreview({ rule }: { rule: IApiRuleMutate | undefined }) {
  // TODO: useTime
  const now = Date.now();

  const value = rule?.value;

  const {
    message = "...",
    isOnce,
    rrule,
  } = useMemo(() => getPreviewDetails(rule?.rrule), [rule]);
  const [next, oneAfter] = useMemo(() => {
    if (isOnce || !rrule || !rule?.rrule) {
      return [undefined, undefined];
    }

    // next 2 occurences in the future (cap off at 3 years)
    return getDatesOfRRule(
      rule?.rrule,
      fromDateToString(new Date(now)),
      fromDateToString(addDays(new Date(now), 3 * 365)),
    )
      .sort()
      .slice(0, 2);
  }, [isOnce, rrule, rule?.rrule, now]);

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
