import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons/faCircleExclamation";
import { parametersState } from "../../../../store/parameters";
import { IApiRuleMutate } from "../../../../store/rules";
import { getRuleWarnings } from "./extract-rule-details";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSignalValue } from "../../../../store/useSignalValue";
import { useCurrentRule } from "./useCurrentRule";

function RawRuleWarningsAndErrors({ rule }: { rule: IApiRuleMutate }) {
  const parameters = useSignalValue(parametersState);
  const { warnings, errors } = getRuleWarnings(rule, parameters);
  return (
    <>
      <ul>
        {errors.map((e) => (
          <li key={e.message}>
            <FontAwesomeIcon
              style={{ color: "var(--red)" }}
              icon={faCircleExclamation}
            />{" "}
            {e.message}
          </li>
        ))}
        {warnings.map((w) => (
          <li key={w.message}>
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

export function RuleWarningsAndErrors() {
  const rule = useCurrentRule();
  if (!rule) return null;
  return <RawRuleWarningsAndErrors rule={rule} />;
}
