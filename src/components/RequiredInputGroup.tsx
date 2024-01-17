import InputGroup from "react-bootstrap/InputGroup";
import { Info, InfoProps } from "./Info";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";

export const RequiredInputGroup = ({
  why,
}: {
  why?: InfoProps["infobody"];
}) => {
  return (
    <Info trigger={["click", "focus"]} infobody={why || "Required"}>
      <InputGroup.Text style={{ color: "var(--red)" }}>
        <FontAwesomeIcon icon={faAsterisk} />
      </InputGroup.Text>
    </Info>
  );
};
