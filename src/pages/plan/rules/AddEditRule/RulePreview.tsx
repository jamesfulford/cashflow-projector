import { useMemo } from "react";
import { Currency } from "../../../../components/currency/Currency";
import { IApiRule, IApiRuleMutate } from "../../../../store/rules";
import { getPreviewDetails } from "./extract-rule-details";
import {
  fromDateToString,
  getDatesOfRRule,
  getDatesOfRule,
} from "../../../../services/engine/rrule";
import { addDays } from "date-fns/addDays";

export function RulePreview({ rule }: { rule: IApiRuleMutate | undefined }) {
  // TODO: useTime
  const now = Date.now();

  const value = rule?.value;

  const { message = "...", isOnce } = useMemo(
    () => getPreviewDetails(rule?.rrule),
    [rule],
  );
  const [next, oneAfter] = useMemo(() => {
    if (isOnce || rule?.rrule === undefined) {
      return [undefined, undefined];
    }

    // next 2 occurences in the future (cap off at 3 years)
    return getDatesOfRule(
      rule as IApiRule,
      fromDateToString(new Date(now)),
      fromDateToString(addDays(new Date(now), 3 * 365)),
    ).slice(0, 2);
  }, [isOnce, rule, now]);

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
