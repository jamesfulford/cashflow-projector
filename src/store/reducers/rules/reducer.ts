import { IApiRule } from "../../../services/RulesService";
import { RequestStatus, RuleAction, RuleType } from "./actions";

export interface RuleState {
  rulemap: {
    [id: string]: Omit<IApiRule, "id">;
  };
  status: RequestStatus;
}

const initialState = {
  rulemap: {},
  status: RequestStatus.LOADING,
};

const reducer = (
  state: RuleState = initialState,
  action: RuleAction,
): RuleState => {
  switch (action.type) {
    case RuleType.SET:
      let overrideRuleMap: RuleState["rulemap"] = {};
      action.rules.forEach((rule) => {
        let newrule = { ...rule } as any;
        delete newrule["id"];
        overrideRuleMap[rule.id] = newrule as Omit<IApiRule, "id">;
      });
      return {
        ...state,
        rulemap: {
          ...(!action.replace && state.rulemap),
          ...overrideRuleMap,
        },
      };
    case RuleType.REMOVE:
      let rulemap = { ...state.rulemap };
      delete rulemap[action.ruleid];
      return {
        ...state,
        rulemap,
      };
    case RuleType.SET_STATUS:
      return { ...state, status: action.status };
    default:
      return state;
  }
};

export default reducer;
