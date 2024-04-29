import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import { useState } from "react";
import { TransactionsContainer } from "../transactions/TransactionsContainer";
import { DurationSelector } from "../parameters/DurationSelector";
import { FreeToSpendContainer } from "./FreeToSpendContainer";

enum TableTabs {
  TRANSACTIONS = "Transactions",
  FREE_TO_SPEND = "Free to spend",
}
export const TableContainer = () => {
  const [tab, setTab] = useState<TableTabs>(TableTabs.TRANSACTIONS);
  return (
    <>
      <div className="d-flex justify-content-between pt-0">
        <Tabs
          variant="underline"
          activeKey={tab || TableTabs.TRANSACTIONS}
          onSelect={(key) => setTab((key as TableTabs) ?? undefined)}
        >
          <Tab eventKey={TableTabs.TRANSACTIONS} title={"Transactions"} />
          <Tab eventKey={TableTabs.FREE_TO_SPEND} title={"Free to spend"} />
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
