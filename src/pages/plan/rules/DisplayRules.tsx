import ListGroup from "react-bootstrap/esm/ListGroup";
import sortBy from "lodash/sortBy";
import { EnhancedRule } from "./enhancedRules";
import { RulesDisplayProps } from "./RulesDisplay";
import { RuleDisplay } from "./RuleDisplay";

interface DisplayRulesProps extends RulesDisplayProps {
  rules: EnhancedRule[];
}
export function DisplayRules(props: DisplayRulesProps) {
  return (
    <div
      style={{
        overflowY: "scroll",
        height: "60vh",
        // TODO: make the entire left side scroll, with some stickiness; don't do scrolling here because 60vh is hacky
      }}
    >
      <ListGroup>
        {sortBy(props.rules, (r) => Math.abs(r.impact))
          .reverse()
          .map((rule, index) => {
            return (
              <RuleDisplay key={rule.id} rule={rule} index={index} {...props} />
            );
          })}
      </ListGroup>
    </div>
  );
}
