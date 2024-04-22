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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderOpen,
  faInfoCircle,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import { openProfile } from "../../store/filesystem";

const hasRules_ = computed(() => !!rulesState.value.length);

export const PlanLayout = () => {
  const hasRules = useSignalValue(hasRules_);

  if (hasRules) {
    return (
      <div className="plancontainer" style={{ height: "90vh" }}>
        <Row>
          <Col lg={3}>
            <Reconciler />
            <ParametersContainer />
            <RulesContainer />
          </Col>
          <Col lg={9}>
            <Summary />
            <DayByDayContainer height="40vh" />
            <TransactionsContainer />
          </Col>
        </Row>
      </div>
    );
  }
  return (
    <Container style={{ fontSize: 20, maxWidth: 500 }}>
      <h2>Find financial peace</h2>
      <p>Start planning today.</p>
      <ul>
        <li>escape downward slopes</li>
        <li>avoid overdraft fees</li>
        <li>build a safety net</li>
        <li>see months/years ahead</li>
        <li>
          <strong>find financial peace through planning</strong>
        </li>
      </ul>
      <h3>Why us?</h3>
      <ul>
        <li>
          We <strong>focus on your future, not your past</strong>.{" "}
          <Tippy
            content={
              <>
                Unlike other tools that do a great job at showing you where your
                past transactions went, we help you see your future. We'll help
                you be intentional with your habits and decisions, so you can
                look ahead to reaching your goals sooner.
              </>
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Tippy>
        </li>
        <li>
          Our core functionality is <strong>free forever</strong>.
        </li>
        <li>
          We provide <strong>total privacy</strong>.{" "}
          <Tippy
            content={
              <>
                Your data is saved on your computer, and it never leaves your
                computer. We do collect telemetry to help improve this product,
                but all your numbers are masked.
              </>
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Tippy>
        </li>
      </ul>
      <h3>Getting started</h3>
      <p>Start by adding your income and expenses, or choose:</p>
      <div className="d-flex justify-content-start align-items-center">
        <Button
          variant="outline-primary"
          className="p-5 d-flex flex-column align-items-center"
          onClick={() => {
            batchCreateRules(createDefaultRules());
          }}
        >
          <span style={{ fontSize: 60 }}>
            <FontAwesomeIcon icon={faRocket} />
          </span>
          Quickstart
        </Button>
        <p className="m-5">or</p>

        <Button
          variant="outline-secondary"
          className="p-5 d-flex flex-column align-items-center"
          onClick={() => {
            openProfile();
          }}
        >
          <span style={{ fontSize: 60 }}>
            <FontAwesomeIcon icon={faFolderOpen} />
          </span>
          Open profile
        </Button>
      </div>
    </Container>
  );
};
