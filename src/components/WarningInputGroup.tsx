import InputGroup from "react-bootstrap/esm/InputGroup";
import { Info, InfoProps } from "./Info";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const WarningInputGroup = ({ why }: { why: InfoProps["infobody"] }) => {
  return (
    <InputGroup.Text style={{ fontSize: 24 }}>
      <Info infobody={why}>
        <FontAwesomeIcon icon={faExclamation} role="tooltip" />
      </Info>
    </InputGroup.Text>
  );
};
