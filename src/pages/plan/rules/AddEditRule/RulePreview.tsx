import { useMemo } from "react";
import { Currency } from "../../../../components/currency/Currency";
import { IApiRuleMutate } from "../../../../store/rules";
import { getPreviewDetails } from "./extract-rule-details";

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
    if (isOnce || !rrule) {
      return [undefined, undefined];
    }

    // next 2 occurences in the future (cap off at 3 years)
    return rrule
      .between(
        new Date(now),
        new Date(now + 1000 * 60 * 60 * 24 * 366 * 3),
        true,
        (_d, index) => index < 2,
      )
      .map((d) => d.toISOString().split("T")[0]);
  }, [isOnce, rrule, now]);

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
