import InputGroup from "react-bootstrap/InputGroup";
import { Info } from "./Info";

export const RequiredInputGroup = () => {
  return (
    <InputGroup.Text style={{ fontSize: 24 }}>
      <Info infobody="Required">
        <span>*</span>
      </Info>
    </InputGroup.Text>
  );
};
