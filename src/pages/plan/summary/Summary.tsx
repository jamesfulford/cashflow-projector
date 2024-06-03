import Card from "react-bootstrap/esm/Card";
import { useSignalValue } from "../../../store/useSignalValue";
import { isDownwardState } from "../../../store/mode";
import { UpwardSummary } from "./UpwardSummary";
import { DownwardSummary } from "./DownwardSummary";
import { DurationSelector } from "../parameters/DurationSelector";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";

export const Summary = () => {
  const isDownward = useSignalValue(isDownwardState);
  return (
    <Row className="">
      <Col>
        <Card style={{ backgroundColor: "var(--light-gray-background)" }}>
          <Card.Body className="p-1 d-flex justify-content-around align-items-center">
            {isDownward ? <DownwardSummary /> : <UpwardSummary />}
          </Card.Body>
        </Card>
      </Col>
      <Col lg={3}>
        <DurationSelector />
      </Col>
    </Row>
  );
};
