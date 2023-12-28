import { useMemo } from "react";
import { RRule } from "rrule";
import { Currency } from "../../../../components/currency/Currency";
import { IApiRuleMutate } from "../../../../services/RulesService";
import { convertHebrewMonthToDisplayName, extractHebrew } from "./hebrew";

export const getPreviewDetails = (
  rrulestring: string | undefined,
): {
  message?: string;
  rrule?: RRule;
  isOnce?: boolean;
} => {
  if (!rrulestring) {
    return {};
  }

  const hebrewExtraction = extractHebrew(rrulestring);
  if (hebrewExtraction) {
    return {
      message: `every ${convertHebrewMonthToDisplayName(
        hebrewExtraction.byhebrewmonth,
      )} ${hebrewExtraction.byhebrewday}`,
    };
  }

  let rrule: RRule | undefined;
  try {
    rrule = RRule.fromString(rrulestring);
  } catch {
    console.warn("Unable to parse rrule from string ", rrulestring);
  }

  if (!rrule) {
    return {};
  }

  const isOnce = rrule.origOptions.count === 1;
  if (isOnce) {
    return {
      message: `once on ${rrule.all()[0].toISOString().split("T")[0]}`,
      isOnce,
      rrule,
    };
  } else {
    return {
      message: rrule.toText(),
      isOnce,
      rrule,
    };
  }
};

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
