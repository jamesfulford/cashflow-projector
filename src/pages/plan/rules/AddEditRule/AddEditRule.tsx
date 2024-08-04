import { forwardRef, useCallback, useMemo, useState } from "react";
import "./AddEditRule.css";
import { Formik } from "formik";
import { WorkingState } from "./types";
import {
  convertWorkingStateToApiRuleMutate,
  ruleToWorkingState,
} from "./translation";
import {
  IApiRule,
  IApiRuleMutate,
  RuleType,
  addEmergencyFund,
  currentVersion,
  hasEmergencyFundState,
} from "../../../../store/rules";
import Container from "react-bootstrap/esm/Container";
import Dropdown from "react-bootstrap/esm/Dropdown";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { RecurringRuleModal } from "./RecurringRuleModal";
import { ListRuleModal } from "./ListRuleModal";
import { RRule } from "rrule";
import Button from "react-bootstrap/esm/Button";
import { addButtonToggleState } from "./addButtonToggleState";
import { useSignalValue } from "../../../../store/useSignalValue";
import { SavingsGoalIcon } from "../../../../components/SavingsGoalIcon";
import { LoanIcon } from "../../../../components/LoanIcon";
import { Info } from "../../../../components/Info";
import { setAsideState } from "../../../../store/parameters";
import { SafetyNetIcon } from "../../../../components/SafetyNetIcon";
import { showCheckingModalState } from "../../parameters/checking/checkingModalState";
import { EmergencyFundIcon } from "../../../../components/EmergencyFundIcon";
import { emergencyFundAmountNeeded1MonthState } from "../../parameters/emergency-fund/emergencyFundState";

export interface AddEditRuleFormProps {
  onCreate: (rule: IApiRuleMutate) => void;
  onUpdate: (rule: IApiRuleMutate) => void;
  onClose: () => void;
  rule?: IApiRuleMutate | IApiRule;
}

interface CreateToggleProps extends React.PropsWithChildren {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (e: any) => void;
}
const CreateToggle = forwardRef(
  ({ children, onClick }: CreateToggleProps, ref) => (
    <Button
      variant="success"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      onClick={onClick}
      id="add-button"
    >
      {children}
    </Button>
  ),
);

export const AddEditRule = (props: AddEditRuleFormProps) => {
  const [show, setShow] = useState(!!props.rule);

  const [rulePrefill, setRulePrefill] = useState<IApiRuleMutate | undefined>(
    undefined,
  );

  const rule = useMemo(
    () => props.rule ?? rulePrefill,
    [props.rule, rulePrefill],
  );

  const onCreate = props.onCreate;
  const onUpdate = props.onUpdate;
  const onClose = useCallback(() => {
    props.onClose();
    setShow(false);
  }, [props]);

  const showDropdown = useSignalValue(addButtonToggleState);
  const setShowDropdown = useCallback((newShow: boolean) => {
    addButtonToggleState.value = newShow;
  }, []);

  const hasSafetyNet = !!useSignalValue(setAsideState);
  const hasEmergencyFund = useSignalValue(hasEmergencyFundState);

  return (
    <Container className="justify-content-middle text-center mt-3 mb-3">
      <Dropdown
        show={showDropdown}
        onToggle={(nextShow: boolean) => setShowDropdown(nextShow)}
      >
        <Dropdown.Toggle as={CreateToggle}>
          Add{" "}
          <FontAwesomeIcon
            title="Create"
            icon={faPlus}
            style={{ cursor: "pointer" }}
          />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <DropdownItem
            style={{ color: "var(--green)", backgroundColor: "transparent" }}
            key="income"
            title="Add Income"
            onClick={() => {
              setRulePrefill({
                name: "Paycheck",
                version: currentVersion,

                type: RuleType.INCOME,
                value: 5,
                rrule: new RRule({
                  interval: 1,
                  freq: RRule.MONTHLY,

                  bymonthday: 1,
                }).toString(),
                exceptionalTransactions: [],

                emergencyScenarioApplicability: false,
              });
              setShow(true);
            }}
            as="button"
          >
            Income
          </DropdownItem>
          <DropdownItem
            style={{ color: "var(--red)", backgroundColor: "transparent" }}
            key="expense"
            title="Add Expense"
            onClick={() => {
              setRulePrefill({
                name: "Coffee",
                version: currentVersion,

                type: RuleType.EXPENSE,
                value: -5,
                rrule: new RRule({
                  interval: 1,
                  freq: RRule.MONTHLY,

                  bymonthday: 1,
                }).toString(),
                exceptionalTransactions: [],

                emergencyScenarioApplicability: true,
              });
              setShow(true);
            }}
            as="button"
          >
            Expense
          </DropdownItem>
          <DropdownItem
            style={{ backgroundColor: "transparent" }}
            key="savings_goal"
            title="Add Savings Goal"
            onClick={() => {
              setRulePrefill({
                name: "Car Down Payment",
                version: currentVersion,

                type: RuleType.SAVINGS_GOAL,
                value: -50,
                rrule: new RRule({
                  interval: 1,
                  freq: RRule.MONTHLY,

                  bymonthday: 1,
                }).toString(),
                exceptionalTransactions: [],

                progress: 0,
                goal: 4000,

                emergencyScenarioApplicability: false,
              });
              setShow(true);
            }}
            as="button"
          >
            <Info infobody={<>Use this to save for a big purchase</>}>
              <span>
                <SavingsGoalIcon /> Goal{" "}
              </span>
            </Info>
          </DropdownItem>
          <DropdownItem
            style={{ backgroundColor: "transparent" }}
            key="loan"
            title="Add Loan"
            onClick={() => {
              setRulePrefill({
                name: "Car Payment",
                version: currentVersion,

                type: RuleType.LOAN,
                value: -400,
                rrule: new RRule({
                  interval: 1,
                  freq: RRule.MONTHLY,

                  bymonthday: 1,
                }).toString(),
                exceptionalTransactions: [],

                apr: 0.06,
                balance: 10000,
                compoundingsYearly: 12,

                emergencyScenarioApplicability: true,
              });
              setShow(true);
            }}
            as="button"
          >
            <Info infobody={<>Use this to track loan payments and interest</>}>
              <span>
                <LoanIcon /> Loan
              </span>
            </Info>
          </DropdownItem>
          {!hasSafetyNet || !hasEmergencyFund ? (
            <>
              <Dropdown.Divider />
            </>
          ) : null}
          {!hasSafetyNet ? (
            <>
              <DropdownItem
                style={{ backgroundColor: "transparent" }}
                key="safety-net"
                title="Add Safety Net"
                onClick={() => {
                  showCheckingModalState.value = true;
                }}
                as="button"
              >
                <Info
                  infobody={
                    <>
                      Money in Checking set aside for unexpected smaller
                      expenses like a tow truck or a hotel.
                    </>
                  }
                >
                  <span>
                    <SafetyNetIcon /> Safety Net
                  </span>
                </Info>
              </DropdownItem>
            </>
          ) : null}
          {!hasEmergencyFund ? (
            <>
              <DropdownItem
                style={{ backgroundColor: "transparent" }}
                key="emergency-fund"
                title="Add Emergency Fund"
                onClick={() => {
                  const oneMonthExpenses =
                    emergencyFundAmountNeeded1MonthState.peek()?.[1] ?? 0;
                  addEmergencyFund(oneMonthExpenses);
                }}
                as="button"
              >
                <Info
                  infobody={
                    <>
                      Savings set aside for job loss, disability, or large
                      expenses
                    </>
                  }
                >
                  <span>
                    <EmergencyFundIcon /> Emergency Fund
                  </span>
                </Info>
              </DropdownItem>
            </>
          ) : null}
          <Dropdown.Divider />
          <DropdownItem
            style={{
              color: "var(--gray-text)",
              backgroundColor: "transparent",
            }}
            key="list"
            title="One-time transactions"
            onClick={() => {
              setRulePrefill({
                name: "One-time transactions",
                version: currentVersion,

                type: RuleType.TRANSACTIONS_LIST,
                exceptionalTransactions: [],

                emergencyScenarioApplicability: false,
              });
              setShow(true);
            }}
            as="button"
          >
            One-time transactions
          </DropdownItem>
        </Dropdown.Menu>
      </Dropdown>

      {show ? (
        <AddEditRuleForm
          onCreate={onCreate}
          onUpdate={onUpdate}
          onClose={onClose}
          rule={rule}
        />
      ) : null}
    </Container>
  );
};

function isExistingRule(rule: IApiRuleMutate | IApiRule): rule is IApiRule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Boolean((rule as any).id);
}

export const AddEditRuleForm = ({
  onCreate,
  onUpdate,
  onClose,
  rule,
}: AddEditRuleFormProps) => {
  const canUpdate = Boolean(rule && isExistingRule(rule));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function submit(fields: WorkingState, { setSubmitting }: any) {
    let final: IApiRuleMutate;
    try {
      final = convertWorkingStateToApiRuleMutate(fields);
    } catch (e) {
      console.error(e);
      return;
    }

    if (!canUpdate) {
      await onCreate(final);
    } else {
      await onUpdate(final);
    }

    setSubmitting(false);
    onClose();
  }

  const initialValues = ruleToWorkingState(rule);

  return (
    <Formik initialValues={initialValues} onSubmit={submit}>
      {(props) => {
        const ruleType = props.getFieldMeta("ruleType")
          .value as WorkingState["ruleType"];

        if (ruleType === "recurring") {
          return <RecurringRuleModal onClose={onClose} canUpdate={canUpdate} />;
        } else if (ruleType === "list") {
          return <ListRuleModal onClose={onClose} canUpdate={canUpdate} />;
        }
      }}
    </Formik>
  );
};
