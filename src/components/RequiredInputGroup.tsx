import InputGroup from "react-bootstrap/esm/InputGroup";
import { Info, InfoProps } from "./Info";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import { WarningInputGroup } from "./WarningInputGroup";

export const RequiredInputGroup = ({
  why,
}: {
  why?: InfoProps["infobody"];
}) => {
  return (
    <>
      {why && <WarningInputGroup why={why} />}
      <InputGroup.Text style={{ color: "var(--red)" }}>
        <Info infobody={"Required"}>
          <FontAwesomeIcon icon={faAsterisk} tabIndex={-1} role="tooltip" />
        </Info>
      </InputGroup.Text>
    </>
  );
};
