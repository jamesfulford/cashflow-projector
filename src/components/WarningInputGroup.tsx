import InputGroup from "react-bootstrap/InputGroup";
import { Info, InfoProps } from "./Info";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const WarningInputGroup = ({ why }: { why: InfoProps["infobody"] }) => {
  return (
    <Info trigger={["click", "focus"]} infobody={why}>
      <InputGroup.Text style={{ fontSize: 24 }}>
        <FontAwesomeIcon icon={faExclamation} />
      </InputGroup.Text>
    </Info>
  );
};
