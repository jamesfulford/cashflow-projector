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
    <Row className="mb-2">
      <Col>
        <Card style={{ backgroundColor: "var(--light-gray-background)" }}>
          <Card.Body
            className="d-flex justify-content-evenly align-items-center"
            style={{ padding: 6 }}
          >
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
