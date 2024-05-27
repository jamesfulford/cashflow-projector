import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";

import { RulesContainer } from "./rules/RulesContainer";
import { DayByDayContainer } from "./daybyday/DayByDayContainer";
import { ParametersContainer } from "./parameters/ParametersContainer";
import { Summary } from "./summary/Summary";
import { TableContainer } from "./tables/TableContainer";
import "./Plan.css";
import { GuidedTutorial } from "./GuidedTutorial";

export const PlanLayout = () => {
  return (
    <>
      <GuidedTutorial />
      <div className="plancontainer" style={{ height: "90vh" }}>
        <Row>
          <Col lg={3} style={{ height: "100%" }}>
            <ParametersContainer />
            <RulesContainer />
          </Col>
          <Col lg={9} style={{ height: "100% " }}>
            <Summary />
            <DayByDayContainer height="50vh" />
            <TableContainer />
          </Col>
        </Row>
      </div>
    </>
  );
};
