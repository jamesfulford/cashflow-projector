import { useSignalValue } from "../../../../store/useSignalValue";
import {
  emergencyFundAmountNeeded1MonthState,
  emergencyFundAmountNeeded1YearState,
  emergencyFundAmountNeeded3MonthsState,
  emergencyFundAmountNeeded6MonthsState,
  fundDepletedDateState,
} from "./emergencyFundState";

import Table from "react-bootstrap/esm/Table";
import { AppTooltip } from "../../../../components/Tooltip";
import { DateDisplay } from "../../../../components/date/DateDisplay";
import { CurrencyColorless } from "../../../../components/currency/Currency";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";
import { useMemo } from "react";
import sortBy from "lodash/sortBy";
import { emergencyFundRuleState } from "../../../../store/rules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";

export function EmergencyFundCoverageSection() {
  const emergencyFundAmountNeeded1Month = useSignalValue(
    emergencyFundAmountNeeded1MonthState,
  );
  const emergencyFundAmountNeeded3Months = useSignalValue(
    emergencyFundAmountNeeded3MonthsState,
  );
  const emergencyFundAmountNeeded6Months = useSignalValue(
    emergencyFundAmountNeeded6MonthsState,
  );
  const emergencyFundAmountNeeded1Year = useSignalValue(
    emergencyFundAmountNeeded1YearState,
  );

  const fundDepletedDate = useSignalValue(fundDepletedDateState);

  const emergencyFundRule = useSignalValue(emergencyFundRuleState);

  const rows = useMemo(
    () =>
      sortBy(
        [
          {
            label: <>1 month of expenses</>,
            date: emergencyFundAmountNeeded1Month?.[0],
            amount: emergencyFundAmountNeeded1Month?.[1],
          },
          {
            label: <>3 months of expenses</>,
            date: emergencyFundAmountNeeded3Months?.[0],
            amount: emergencyFundAmountNeeded3Months?.[1],
          },
          {
            label: <>6 months of expenses</>,
            date: emergencyFundAmountNeeded6Months?.[0],
            amount: emergencyFundAmountNeeded6Months?.[1],
          },
          {
            label: <>1 year of expenses</>,
            date: emergencyFundAmountNeeded1Year?.[0],
            amount: emergencyFundAmountNeeded1Year?.[1],
          },
          {
            label: (
              <>
                Current <EmergencyFundIcon /> Emergency Fund
              </>
            ),
            date: fundDepletedDate,
            amount: emergencyFundRule?.progress,
          },
        ].filter(({ date }) => !!date),
        ["date"],
      ),
    [
      emergencyFundAmountNeeded1Month,
      emergencyFundAmountNeeded1Year,
      emergencyFundAmountNeeded3Months,
      emergencyFundAmountNeeded6Months,
      emergencyFundRule?.progress,
      fundDepletedDate,
    ],
  );

  return (
    <>
      {fundDepletedDate ? (
        <>
          <Table bordered>
            <thead>
              <tr>
                <th>Coverage</th>
                <th>Money</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                return (
                  <tr>
                    <td>
                      <AppTooltip
                        content={
                          <>
                            Covers from now to{" "}
                            <DateDisplay simple date={row.date as string} />
                          </>
                        }
                      >
                        <span>{row.label}</span>
                      </AppTooltip>
                    </td>
                    <td>
                      <CurrencyColorless value={row.amount as number} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      ) : (
        <>
          <p>
            You would not deplete your <EmergencyFundIcon /> Emergency Fund
            within the next year.
          </p>
        </>
      )}
    </>
  );
}
