import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import { useState } from "react";
import { TransactionsContainer } from "../transactions/TransactionsContainer";
import { DurationSelector } from "../parameters/DurationSelector";

enum TableTabs {
  TRANSACTIONS = "Transactions",
}
export const TableContainer = () => {
  const [tab, setTab] = useState<TableTabs>(TableTabs.TRANSACTIONS);
  return (
    <>
      <div className="d-flex justify-content-between pt-2">
        <Tabs
          variant="underline"
          activeKey={tab || TableTabs.TRANSACTIONS}
          onSelect={(key) => setTab((key as TableTabs) ?? undefined)}
        >
          <Tab
            eventKey={TableTabs.TRANSACTIONS}
            title={"Transactions"}
            style={{ padding: 0, margin: 0 }}
          />
        </Tabs>
        <div>
          <DurationSelector />
          {/* TODO: put downloader here */}
        </div>
      </div>
      {tab === TableTabs.TRANSACTIONS && <TransactionsContainer />}
    </>
  );
};
