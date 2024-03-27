import Container from "react-bootstrap/esm/Container";
import { RulesContainer } from "./rules/RulesContainer";
import { TransactionsContainer } from "./transactions/TransactionsContainer";

import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import { DayByDayContainer } from "./daybyday/DayByDayContainer";
import { ParametersContainer } from "./parameters/ParametersContainer";

import { batchCreateRules, rulesState } from "../../store/rules";
import { Reconciler } from "./parameters/Reconciler";
import { Summary } from "./Summary";

import "./Plan.css";
import Button from "react-bootstrap/esm/Button";
import { createDefaultRules } from "../../components/createDefaultRules";
import { useSignalValue } from "../../store/useSignalValue";
import { computed } from "@preact/signals-core";

const hasRules_ = computed(() => !!rulesState.value.length);

export const PlanLayout = () => {
  const hasRules = useSignalValue(hasRules_);
  return (
    <div className="plancontainer" style={{ height: "90vh" }}>
      <Row>
        <Col lg={3}>
          <Summary />
          <Reconciler />
          <ParametersContainer />
          <RulesContainer />
        </Col>
        <Col lg={9}>
          {hasRules ? (
            <>
              <DayByDayContainer height="45vh" />
              <TransactionsContainer />
            </>
          ) : (
            <Container className="justify-content-middle text-center mt-5 mb-5">
              <h3>
                Welcome! Start by adding your expected income and expenses.
              </h3>
              <Button
                variant="outline-primary"
                onClick={() => {
                  batchCreateRules(createDefaultRules());
                }}
              >
                Quickstart: add sample income/expenses
              </Button>
            </Container>
          )}
        </Col>
      </Row>
    </div>
  );
};
