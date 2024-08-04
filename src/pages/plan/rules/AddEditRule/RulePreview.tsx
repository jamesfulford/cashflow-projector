import { useMemo } from "react";
import { Currency } from "../../../../components/currency/Currency";
import { IApiRuleMutate, isRecurringRule } from "../../../../store/rules";
import {
  fromDateToString,
  fromStringToDate,
} from "../../../../services/engine/rrule";
import { useCurrentRule } from "./useCurrentRule";
import { getLongFrequencyDisplayString } from "./extract-rule-details";
import { useSignalValue } from "../../../../store/useSignalValue";
import { parametersState } from "../../../../store/parameters";
import { DateDisplay } from "../../../../components/date/DateDisplay";
import { computeTransactions } from "../../../../services/engine/transactions";
import { endDateState } from "../../../../store/computationDates";
import { addYears } from "date-fns/addYears";

function RawRulePreview({ rule }: { rule: IApiRuleMutate }) {
  const message = useMemo(() => {
    return getLongFrequencyDisplayString(rule);
  }, [rule]);

  const endDate = useSignalValue(endDateState);
  const parameters = useSignalValue(parametersState);

  const transactions = useMemo(() => {
    const minimumComputation = fromDateToString(
      addYears(fromStringToDate(parameters.startDate), 10),
    );
    const previewEndDate =
      endDate > minimumComputation ? endDate : minimumComputation;

    return computeTransactions(
      [
        {
          id: "preview",
          ...rule,
        },
      ],
      {
        ...parameters,
        endDate: previewEndDate,
      },
    );
  }, [endDate, parameters, rule]);

  const [next, oneAfter] = useMemo(() => {
    if (!isRecurringRule(rule)) {
      return [undefined, undefined];
    }
    return [transactions.at(0)?.day, transactions.at(1)?.day];
  }, [rule, transactions]);

  const lastPaymentDate = useMemo(() => {
    if (!isRecurringRule(rule)) return;

    const finalTransaction = transactions.at(-1);

    if (!finalTransaction) return;
    if (!finalTransaction.isLastPayment) return;
    return finalTransaction.day;
  }, [rule, transactions]);

  return (
    <div>
      <p className="m-0">
        {isRecurringRule(rule) ? <Currency value={rule.value} /> : "Occurs"}{" "}
        {message}
      </p>

      {next && (
        <p className="m-0">
          Next is <DateDisplay date={next} />
          {oneAfter && (
            <>
              , then <DateDisplay date={oneAfter} />
            </>
          )}
        </p>
      )}
      {lastPaymentDate && (
        <p className="m-0">
          Final payment will be <DateDisplay date={lastPaymentDate} />
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
