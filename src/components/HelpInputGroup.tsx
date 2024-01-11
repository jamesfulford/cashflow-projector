import InputGroup from "react-bootstrap/InputGroup";
import { InfoProps } from "./Info";
import { Help } from "./Help";

export const HelpInputGroup = ({
  helptitle,
  helptext,
}: {
  helptitle?: InfoProps["infotitle"];
  helptext?: InfoProps["infobody"];
}) => (
  <InputGroup.Text>
    <Help helptext={helptext} helptitle={helptitle} />
  </InputGroup.Text>
);
