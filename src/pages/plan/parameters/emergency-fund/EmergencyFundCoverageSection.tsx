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
            label: <>1 month</>,
            date: emergencyFundAmountNeeded1Month?.[0],
            amount: emergencyFundAmountNeeded1Month?.[1],
          },
          {
            label: <>3 months</>,
            date: emergencyFundAmountNeeded3Months?.[0],
            amount: emergencyFundAmountNeeded3Months?.[1],
          },
          {
            label: <>6 months</>,
            date: emergencyFundAmountNeeded6Months?.[0],
            amount: emergencyFundAmountNeeded6Months?.[1],
          },
          {
            label: <>1 year</>,
            date: emergencyFundAmountNeeded1Year?.[0],
            amount: emergencyFundAmountNeeded1Year?.[1],
          },
          {
            label: (
              <>
                <strong>Current</strong>
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
      <h5>Scenario dates</h5>
      {fundDepletedDate ? (
        <>
          <Table bordered>
            <tbody>
              {rows.map((row) => {
                return (
                  <tr>
                    <td>
                      {row.label}{" "}
                      <AppTooltip
                        content={
                          <>
                            Up to{" "}
                            <DateDisplay simple date={row.date as string} />
                          </>
                        }
                      >
                        <span>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            style={{ color: "var(--gray-text)" }}
                          />
                        </span>
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
            It appears that you would not deplete your <EmergencyFundIcon />{" "}
            Emergency fund within the next year in your configured Emergency
            scenario.
          </p>
        </>
      )}
    </>
  );
}
