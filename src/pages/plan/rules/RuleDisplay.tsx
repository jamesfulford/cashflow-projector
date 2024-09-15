import ListGroupItem from "react-bootstrap/esm/ListGroupItem";
import {
  Currency,
  CurrencyColorless,
} from "../../../components/currency/Currency";
import {
  getRuleWarnings,
  getShortFrequencyDisplayString,
} from "./AddEditRule/extract-rule-details";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons/faEdit";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons/faTrashCan";
import { faCopy } from "@fortawesome/free-regular-svg-icons/faCopy";

import "./rule/Rule.css";
import { Info } from "../../../components/Info";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons/faCircleExclamation";
import {
  RuleType,
  createRule,
  isRecurringRule,
  rulesState,
  updateRule,
} from "../../../store/rules";
import { parametersState, startDateState } from "../../../store/parameters";
import { useEffect, useMemo, useRef, useState } from "react";
import FormControl from "react-bootstrap/esm/FormControl";
import { NumericFormat } from "react-number-format";
import { useSignalValue } from "../../../store/useSignalValue";
import { selectedRuleIDState } from "../../../store/selectedRule";
import Badge from "react-bootstrap/esm/Badge";
import { AppTooltip } from "../../../components/Tooltip";
import { DateDisplay } from "../../../components/date/DateDisplay";
import { formatDistance } from "date-fns/formatDistance";
import { EnhancedRule } from "./enhancedRules";
import { SensitivePercentage } from "./RulesDisplay";
import { SavingsGoalIcon } from "../../../components/SavingsGoalIcon";
import { LoanIcon } from "../../../components/LoanIcon";

interface RuleDisplayProps {
  rule: EnhancedRule;
  index: number;

  selectedRuleId: string | undefined;
  setSelectedRuleId: (id: string | undefined) => void;

  targetForDeleteRuleId: string | undefined;
  setTargetForDeleteRuleId: (id: string | undefined) => void;
}
export const RuleDisplay = ({
  rule,
  index,

  selectedRuleId,
  setSelectedRuleId,

  targetForDeleteRuleId,
  setTargetForDeleteRuleId,
}: RuleDisplayProps) => {
  //
  // on click in table: show rule responsible for transaction
  //
  const startDate = useSignalValue(startDateState);

  const [isClickReferenced, setIsClickReferenced] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    return selectedRuleIDState.subscribe((id) => {
      if (!id) return;
      if (id !== rule.id) return;
      ref.current?.scrollIntoView();
      setIsClickReferenced(true);
    });
  }, [rule.id]);
  useEffect(() => {
    if (isClickReferenced) {
      const timeoutID = setTimeout(() => setIsClickReferenced(false), 2000);
      return () => clearTimeout(timeoutID);
    }
  }, [isClickReferenced]);

  const frequencyDisplay = useMemo(
    () => getShortFrequencyDisplayString(rule),
    [rule],
  );
  const isSelected =
    [selectedRuleId, targetForDeleteRuleId].includes(rule.id) ||
    isClickReferenced;
  const parameters = useSignalValue(parametersState);
  const { warnings, errors } = getRuleWarnings(rule, parameters);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(rule.name);

  const [isEditingValue, setIsEditingValue] = useState(false);
  const ruleValue = isRecurringRule(rule) ? rule.value : 0;
  const [_editedValue, setEditedValue] = useState(Math.abs(ruleValue)); // just the value
  const editedValue = (Math.abs(ruleValue) / ruleValue) * _editedValue;

  // when changes to this rule are made, update the quickedit `useState`s
  useEffect(() => {
    return rulesState.subscribe((rs) => {
      const thisRule = rs.find((r) => r.id === rule.id);
      if (!thisRule) return; // should never happen

      setEditedTitle(thisRule.name);
      if (isRecurringRule(thisRule)) setEditedValue(Math.abs(thisRule.value));
    });
  }, [rule.id]);

  return (
    <ListGroupItem
      key={rule.id}
      active={isSelected}
      ref={ref}
      data-index={`${index}`}
    >
      <div
        className="btn-toolbar justify-content-between"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group mr-2" role="group" aria-label="First group">
          <div className="rulename">
            <AppTooltip content={<>(double-click to edit name)</>}>
              <h5
                className="m-0"
                onClick={(e) => {
                  if (e.detail === 2) {
                    setIsEditingTitle(true);
                  }
                }}
              >
                {isEditingTitle ? (
                  <>
                    <FormControl
                      autoFocus
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={(e) => {
                        switch (e.key) {
                          case "Enter":
                            updateRule({
                              ...rule,
                              name: editedTitle,
                            });
                            setIsEditingTitle(false);
                            break;
                          case "Escape":
                            setIsEditingTitle(false);
                            setEditedTitle(rule.name); // reset
                            break;

                          default:
                            break;
                        }
                      }}
                      onBlur={() => {
                        updateRule({
                          ...rule,
                          name: editedTitle,
                        });
                        setIsEditingTitle(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    {rule.name}

                    {rule.type === RuleType.SAVINGS_GOAL && (
                      <>
                        <AppTooltip
                          content={
                            rule.lastPaymentDayResult === undefined ? (
                              <>
                                {rule.progress === rule.goal ? (
                                  <>This goal has been achieved! 🎉</>
                                ) : (
                                  <>
                                    Error occurred while computing final payment
                                    details
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {rule.lastPaymentDayResult.result ===
                                "complete" ? (
                                  <>
                                    Final payment is{" "}
                                    <DateDisplay
                                      date={rule.lastPaymentDayResult.day}
                                    />
                                    ,<br />
                                    which is in{" "}
                                    {formatDistance(
                                      rule.lastPaymentDayResult.day,
                                      startDate,
                                    )}
                                  </>
                                ) : (
                                  <>
                                    Final payment is in at least{" "}
                                    {formatDistance(
                                      rule.lastPaymentDayResult
                                        .searchedUpToDate,
                                      startDate,
                                    )}
                                  </>
                                )}
                              </>
                            )
                          }
                        >
                          <span
                            style={{
                              paddingLeft: 8,
                              fontSize: "1rem",
                              verticalAlign: "text-bottom",
                            }}
                          >
                            <Badge
                              className={
                                rule.progress === rule.goal
                                  ? "bg-success"
                                  : "bg-secondary"
                              }
                            >
                              <SavingsGoalIcon /> Goal
                            </Badge>
                          </span>
                        </AppTooltip>
                      </>
                    )}

                    {rule.type === RuleType.LOAN && (
                      <>
                        <AppTooltip
                          content={
                            rule.lastPaymentDayResult === undefined ? (
                              <>
                                {rule.balance === 0 ? (
                                  <>This loan has been paid off! 🎉</>
                                ) : (
                                  <>
                                    Error occurred while computing final payment
                                    details
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {rule.lastPaymentDayResult.result ===
                                "complete" ? (
                                  <>
                                    Final payment is{" "}
                                    <DateDisplay
                                      date={rule.lastPaymentDayResult.day}
                                    />
                                    ,<br />
                                    which is in{" "}
                                    {formatDistance(
                                      rule.lastPaymentDayResult.day,
                                      startDate,
                                    )}
                                  </>
                                ) : (
                                  <>
                                    Final payment is in at least{" "}
                                    {formatDistance(
                                      rule.lastPaymentDayResult
                                        .searchedUpToDate,
                                      startDate,
                                    )}
                                  </>
                                )}
                              </>
                            )
                          }
                        >
                          <span
                            style={{
                              paddingLeft: 8,
                              fontSize: "1rem",
                              verticalAlign: "text-bottom",
                            }}
                          >
                            <Badge
                              className={
                                rule.balance === 0
                                  ? "bg-success"
                                  : "bg-secondary"
                              }
                            >
                              <LoanIcon /> Loan
                            </Badge>
                          </span>
                        </AppTooltip>
                      </>
                    )}
                  </>
                )}
                {errors.length ? (
                  <>
                    {" "}
                    <Info
                      infobody={
                        <>
                          {errors.length}&nbsp;error
                          {errors.length > 1 ? "s" : null}&nbsp;found.
                          {errors.map((e) => {
                            return (
                              <>
                                <br />- {e.message}
                              </>
                            );
                          })}
                        </>
                      }
                    >
                      <FontAwesomeIcon
                        style={{ color: "var(--red)" }}
                        icon={faCircleExclamation}
                      />
                    </Info>
                  </>
                ) : null}
                {warnings.length ? (
                  <>
                    {" "}
                    <Info
                      infobody={
                        <>
                          {warnings.length}&nbsp;warning
                          {warnings.length > 1 ? "s" : null}&nbsp;found.
                          {warnings.map((w) => {
                            return (
                              <>
                                <br />- {w.message}
                              </>
                            );
                          })}
                        </>
                      }
                    >
                      <FontAwesomeIcon
                        style={{ color: "var(--yellow)" }}
                        icon={faCircleExclamation}
                      />
                    </Info>
                  </>
                ) : null}
              </h5>
            </AppTooltip>
          </div>
        </div>

        <div
          className="btn-group mr-2 mb-1"
          role="group"
          aria-label="Second group"
        >
          {Number.isFinite(rule.shareOfIncome) ? (
            <AppTooltip
              content={
                rule.isIncome ? (
                  <>
                    Total:{" "}
                    <strong>
                      <CurrencyColorless value={rule.impact} />
                    </strong>
                    <br />
                    <strong>
                      <SensitivePercentage value={rule.shareOfIncome} />
                    </strong>{" "}
                    of income
                  </>
                ) : (
                  <>
                    Total:{" "}
                    <strong>
                      <CurrencyColorless value={-rule.impact} />
                    </strong>
                    <br />
                    <strong>
                      <SensitivePercentage value={rule.shareOfIncome} />
                    </strong>{" "}
                    of total income
                    <br />(
                    <strong>
                      <SensitivePercentage value={rule.shareOfExpenses} />
                    </strong>{" "}
                    of spending)
                  </>
                )
              }
            >
              <Badge>
                <SensitivePercentage value={rule.shareOfIncome} />
              </Badge>
            </AppTooltip>
          ) : rule.isExpense ? (
            <AppTooltip
              content={
                <>
                  Total:{" "}
                  <strong>
                    <CurrencyColorless value={-rule.impact} />
                  </strong>
                  <br />
                  <strong>
                    <SensitivePercentage value={rule.shareOfExpenses} />
                  </strong>{" "}
                  of spending
                </>
              }
            >
              <Badge>
                <SensitivePercentage value={rule.shareOfExpenses} />
              </Badge>
            </AppTooltip>
          ) : null}
        </div>
      </div>

      <div
        className="btn-toolbar justify-content-between"
        role="toolbar"
        aria-label="Toolbar with button groups"
      >
        <div className="btn-group mr-2" role="group" aria-label="First group">
          <div>
            {isRecurringRule(rule) ? (
              isEditingValue ? (
                <>
                  <NumericFormat
                    style={{
                      textAlign: "right",
                      width: 100,
                      color: rule.value > 0 ? "var(--green)" : "var(--red)",
                    }}
                    className="mask"
                    value={_editedValue}
                    onValueChange={(values) => {
                      if (values.floatValue !== undefined) {
                        setEditedValue(values.floatValue);
                      }
                    }}
                    valueIsNumericString
                    onBlur={() => {
                      updateRule({ ...rule, value: editedValue });
                      setIsEditingValue(false);
                    }}
                    onKeyDown={(e) => {
                      switch (e.key) {
                        case "Enter":
                          updateRule({ ...rule, value: editedValue });
                          setIsEditingValue(false);
                          break;
                        case "Escape":
                          setIsEditingValue(false);
                          setEditedValue(rule.value); // reset
                          break;

                        default:
                          break;
                      }
                    }}
                    autoFocus
                    decimalScale={2}
                    fixedDecimalScale
                    thousandsGroupStyle="thousand"
                    thousandSeparator=","
                    maxLength={15}
                  />{" "}
                </>
              ) : (
                <AppTooltip content={<>(double-click to edit value)</>}>
                  <span
                    onClick={(e) => {
                      if (e.detail === 2) {
                        setIsEditingValue(true);
                      }
                    }}
                  >
                    <Currency value={rule.value} />{" "}
                  </span>
                </AppTooltip>
              )
            ) : null}
            <span className="m-0">{frequencyDisplay}</span>
          </div>
        </div>

        <div
          className="btn-group mr-2"
          role="group"
          aria-label="Second group"
          data-testid="buttons"
        >
          <AppTooltip content={<>Edit</>}>
            <FontAwesomeIcon
              style={{ cursor: "pointer" }}
              icon={faEdit}
              title="Edit"
              data-buttonid="edit"
              onClick={() => {
                setSelectedRuleId(rule.id);
              }}
            />
          </AppTooltip>
          <AppTooltip content={<>Duplicate</>}>
            <FontAwesomeIcon
              style={{ marginLeft: 10, cursor: "pointer" }}
              icon={faCopy}
              title="Duplicate"
              data-buttonid="duplicate"
              onClick={() => {
                const newRule = {
                  ...rule,
                  id: undefined,
                  name: rule.name + " copy",
                };
                void createRule(newRule);
              }}
            />
          </AppTooltip>
          <AppTooltip content={<>Delete</>}>
            <FontAwesomeIcon
              style={{ marginLeft: 10, cursor: "pointer" }}
              icon={faTrashCan}
              title="Delete"
              data-buttonid="delete"
              onClick={() => {
                setTargetForDeleteRuleId(rule.id);
              }}
            />
          </AppTooltip>
        </div>
      </div>
    </ListGroupItem>
  );
};
