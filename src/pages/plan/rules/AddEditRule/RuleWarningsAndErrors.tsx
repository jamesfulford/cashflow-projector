import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { IParameters } from "../../../../store/parameters";
import { IApiRuleMutate } from "../../../../store/rules";
import { getRuleWarnings } from "./extract-rule-details";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function RuleWarningsAndErrors({
  rule,
  parameters,
}: {
  rule: IApiRuleMutate;
  parameters: IParameters;
}) {
  const { warnings, errors } = getRuleWarnings(rule, parameters);
  return (
    <>
      <ul>
        {errors.map((e) => (
          <li>
            <FontAwesomeIcon
              style={{ color: "var(--red)" }}
              icon={faCircleExclamation}
            />{" "}
            {e.message}
          </li>
        ))}
        {warnings.map((w) => (
          <li>
            <FontAwesomeIcon
              style={{ color: "orange" }}
              icon={faCircleExclamation}
            />{" "}
            {w.message}
          </li>
        ))}
      </ul>
    </>
  );
}
