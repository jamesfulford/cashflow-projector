import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import { useEffect, useState } from "react";
import { TransactionsContainer } from "../transactions/TransactionsContainer";
import { DurationSelector } from "../parameters/DurationSelector";
import { FreeToSpendContainer } from "./FreeToSpendContainer";
import { useSignalValue } from "../../../store/useSignalValue";
import { isDownwardState } from "../../../store/mode";
import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";

enum TableTabs {
  TRANSACTIONS = "Transactions",
  FREE_TO_SPEND = "Free to spend",
}
export const TableContainer = () => {
  const [tab, setTab] = useState<TableTabs>(TableTabs.TRANSACTIONS);
  const isDownward = useSignalValue(isDownwardState);

  // switch away from Free to spend tab if we enter a downward trend
  useEffect(
    () =>
      isDownwardState.subscribe((newIsDownward) => {
        if (newIsDownward && tab === TableTabs.FREE_TO_SPEND)
          setTab(TableTabs.TRANSACTIONS);
      }),
    [tab],
  );

  return (
    <>
      <div className="d-flex justify-content-between pt-0">
        <Tabs
          variant="underline"
          activeKey={tab || TableTabs.TRANSACTIONS}
          onSelect={(key) => {
            if (isDownward && key === TableTabs.FREE_TO_SPEND) return;
            setTab((key as TableTabs) ?? undefined);
          }}
        >
          <Tab eventKey={TableTabs.TRANSACTIONS} title={"Transactions"} />
          <Tab
            eventKey={TableTabs.FREE_TO_SPEND}
            title={
              isDownward ? (
                <Tippy
                  content={
                    <>Unlock by having your income exceed your expenses.</>
                  }
                >
                  <span
                    style={{
                      cursor: "not-allowed",
                      color: "var(--gray-text)",
                      opacity: 0.8,
                    }}
                  >
                    <FontAwesomeIcon icon={faLock} /> Free to spend
                  </span>
                </Tippy>
              ) : (
                <>Free to spend</>
              )
            }
            // disabled={isDownward}
            // unfortunately, not able to disable a button and still have the tooltip work
          />
        </Tabs>
        <div>
          <DurationSelector />
          {/* TODO: put downloader here */}
        </div>
      </div>
      {tab === TableTabs.TRANSACTIONS && <TransactionsContainer />}
      {tab === TableTabs.FREE_TO_SPEND && <FreeToSpendContainer />}
    </>
  );
};
