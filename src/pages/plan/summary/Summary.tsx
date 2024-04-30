import Card from "react-bootstrap/esm/Card";
import { useSignalValue } from "../../../store/useSignalValue";
import { isDownwardState } from "../../../store/mode";
import { UpwardSummary } from "./UpwardSummary";
import { DownwardSummary } from "./DownwardSummary";

export const Summary = () => {
  const isDownward = useSignalValue(isDownwardState);
  return (
    <Card
      className="mb-2"
      style={{ backgroundColor: "var(--light-gray-background)" }}
    >
      <Card.Body className="p-1 d-flex justify-content-around">
        {isDownward ? <DownwardSummary /> : <UpwardSummary />}
      </Card.Body>
    </Card>
  );
};
