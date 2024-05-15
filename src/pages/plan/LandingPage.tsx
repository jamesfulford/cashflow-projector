import Container from "react-bootstrap/esm/Container";

import { batchCreateRules } from "../../store/rules";

import Button from "react-bootstrap/esm/Button";
import { createDefaultRules } from "../../components/createDefaultRules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons/faFolderOpen";
import { faRocket } from "@fortawesome/free-solid-svg-icons/faRocket";
import { openProfile } from "../../store/filesystem";
import { AppTooltip } from "../../components/Tooltip";

export const LandingPage = () => {
  return (
    <Container style={{ fontSize: 20, maxWidth: 1000 }} className="pt-5">
      <h2>Find Financial Peace, Start Planning Today</h2>
      <ul>
        <li>Avoid overdraft fees.</li>
        <li>Build a safety net.</li>
        <li>Grow your savings.</li>
        <li>See months and years ahead.</li>
      </ul>
      <h3>Why us?</h3>
      <ul>
        <li>
          We take a forecasting, future-focused approach to planning your
          budget.{" "}
          <AppTooltip
            content={
              <>
                Other tools (like Rocket Money, EveryDollar, and You Need A
                Budget) help you review where your money went. These tools are
                focused on your past transactions, or (at best) your next
                transaction. We focus on visualizing your future months and
                years in advance, and give you the power to decide where you
                want to be using intentional decision-making.
              </>
            }
          >
            <FontAwesomeIcon
              icon={faCircleInfo}
              style={{ color: "var(--gray-text)" }}
            />
          </AppTooltip>
        </li>
        <li>We believe financial peace should be free for everyone.</li>
        <li>
          We believe your finances are private to you by default.{" "}
          <AppTooltip
            content={
              <>
                Your data is saved on your computer, and it never leaves your
                computer. We do collect product analytics to help improve this
                tool, but your financial data is not collected.
              </>
            }
          >
            <FontAwesomeIcon
              icon={faCircleInfo}
              style={{ color: "var(--gray-text)" }}
            />
          </AppTooltip>
        </li>
      </ul>
      <h3>Getting started</h3>
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
