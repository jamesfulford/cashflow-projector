import Tabs from "react-bootstrap/esm/Tabs";
import Tab from "react-bootstrap/esm/Tab";
import { useCallback } from "react";
import { TransactionsContainer } from "../transactions/TransactionsContainer";
import { FreeToSpendContainer } from "./FreeToSpendContainer";
import { useSignalValue } from "../../../store/useSignalValue";
import { isDownwardState } from "../../../store/mode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";
import {
  Tabs as TabsEnum,
  tableTabSelectionState,
} from "./tableTabSelectionState";
import { AppTooltip } from "../../../components/Tooltip";
import { hasGoalsState } from "../../../store/goals";
import { SavingsGoalsTable } from "./SavingsGoalsTable";
import { EmergencyFundContainer } from "./EmergencyFundContainer";

export const TableContainer = () => {
  const tab = useSignalValue(tableTabSelectionState);
  const setTab = useCallback((tab: TabsEnum) => {
    tableTabSelectionState.value = tab;
  }, []);

  const isDownward = useSignalValue(isDownwardState);
  const hasGoals = useSignalValue(hasGoalsState);

  return (
    <>
      <Tabs
        variant="tabs"
        activeKey={tab || TabsEnum.TRANSACTIONS}
        onSelect={(key) => {
          if (isDownward && key === TabsEnum.FREE_TO_SPEND) return;
          setTab((key as TabsEnum) ?? undefined);
        }}
      >
        <Tab eventKey={TabsEnum.TRANSACTIONS} title={"Activity"} />
        <Tab
          eventKey={TabsEnum.FREE_TO_SPEND}
          title={
            isDownward ? (
              <AppTooltip
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
                  <FontAwesomeIcon icon={faLock} /> Growth
                </span>
              </AppTooltip>
            ) : (
              <>Growth</>
            )
          }

          // disabled={isDownward}
          // unfortunately, not able to disable a button and still have the tooltip work
        />
        <Tab eventKey={TabsEnum.EMERGENCY_FUND} title={<>Emergency Fund</>} />
        <Tab
          eventKey={TabsEnum.GOAL_PROGRESS}
          title={
            !hasGoals ? (
              <AppTooltip content={<>Unlock by adding a Goal.</>}>
                <span
                  style={{
                    cursor: "not-allowed",
                    color: "var(--gray-text)",
                    opacity: 0.8,
                  }}
                >
                  <FontAwesomeIcon icon={faLock} /> Goal Progress
                </span>
              </AppTooltip>
            ) : (
              <>Goal Progress</>
            )
          }
        />
      </Tabs>
      <div id="table-tab-content">
        {tab === TabsEnum.TRANSACTIONS && <TransactionsContainer />}
        {tab === TabsEnum.EMERGENCY_FUND && <EmergencyFundContainer />}
        {tab === TabsEnum.FREE_TO_SPEND && <FreeToSpendContainer />}
        {tab === TabsEnum.GOAL_PROGRESS && <SavingsGoalsTable />}
      </div>
    </>
  );
};
