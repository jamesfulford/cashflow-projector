import InputGroup from "react-bootstrap/esm/InputGroup";
import { Info, InfoProps } from "./Info";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";

export const RequiredInputGroup = ({
  why,
}: {
  why?: InfoProps["infobody"];
}) => {
  return (
    <InputGroup.Text style={{ color: "var(--red)" }}>
      <Info infobody={why || "Required"}>
        <FontAwesomeIcon icon={faAsterisk} tabIndex={-1} role="tooltip" />
      </Info>
    </InputGroup.Text>
  );
};
