import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";
import { Info } from "../../components/Info";
import { Currency } from "../../components/currency/Currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { balanceWillZeroState, freeToSpendState } from "../../store/parameters";
import Card from "react-bootstrap/Card";
import { useSignalValue } from "../../store/useSignalValue";

export const Summary = () => {
  const freeToSpend = useSignalValue(freeToSpendState);
  const balanceWillZero = useSignalValue(balanceWillZeroState);

  return (
    <Card className="mb-2 p-1">
      <div className="text-center">
        Today, you have <Currency value={freeToSpend} /> free to spend.{" "}
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
