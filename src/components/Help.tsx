import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Info, InfoProps } from "./Info";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons/faCircleQuestion";

export const Help = ({
  helptitle,
  helptext,
}: {
  helptitle?: InfoProps["infotitle"];
  helptext?: InfoProps["infobody"];
}) => {
  return (
    <Info infobody={helptext} infotitle={helptitle}>
      <FontAwesomeIcon icon={faCircleQuestion} />
    </Info>
  );
};
