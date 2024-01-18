import InputGroup from "react-bootstrap/InputGroup";
import { InfoProps } from "./Info";
import { Info } from "./Info";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";

export const HelpInputGroup = ({
  helptitle,
  helptext,
}: {
  helptitle?: InfoProps["infotitle"];
  helptext?: InfoProps["infobody"];
}) => (
  <Info trigger={["click", "focus"]} infobody={helptext} infotitle={helptitle}>
    <InputGroup.Text>
      <FontAwesomeIcon icon={faCircleQuestion} />
    </InputGroup.Text>
  </Info>
);
