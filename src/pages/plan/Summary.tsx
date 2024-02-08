import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";
import { Info } from "../../components/Info";
import { Currency } from "../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IApiDayByDay } from "../../services/DayByDayService";
import { IParameters } from "../../services/ParameterService";
import Card from "react-bootstrap/Card";

export const Summary = ({
  daybyday,
  parameters: { setAside, currentBalance, startDate },
}: {
  daybyday: IApiDayByDay;
  parameters: IParameters;
}) => {
  const freeToSpend = daybyday.daybydays.length
    ? daybyday.daybydays[0].working_capital.low
    : currentBalance;
  const balanceWillZero = freeToSpend + setAside < 0;

  return (
    <Card className="mb-2 p-1">
      <div className="text-center">
        <Info infobody={`Today is ${startDate}`}>
          <span>Today</span>
        </Info>
        , you have <Currency value={freeToSpend} /> free to spend.{" "}
        <Info
          infobody={
            <>
              Based on your expected income and expenses, your{" "}
              <strong>savings</strong> (lowest future balance) is{" "}
              {freeToSpend > 0 ? "above" : "below"} your Safety net by{" "}
              <Currency value={freeToSpend} />.
              {freeToSpend < 0 ? (
                <>
                  <br />
                  <br />
                  Consider transferring money from savings, cutting costs, or
                  delaying expenses to avoid{" "}
                  {balanceWillZero ? (
                    <>running out of money.</>
                  ) : (
                    <>dipping into your Safety net.</>
                  )}
                </>
              ) : null}
            </>
          }
        >
          <FontAwesomeIcon icon={faCircleQuestion} />
        </Info>
      </div>
    </Card>
  );
};
