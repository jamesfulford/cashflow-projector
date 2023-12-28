import { AppState } from "..";
import { IApiRule } from "../../../services/RulesService";
import { RequestStatus } from "./actions";

export function getRules(state: AppState): {
  data: IApiRule[];
  loading: boolean;
  error: boolean;
} {
  return {
    loading: state.rules.status === RequestStatus.LOADING,
    error: state.rules.status === RequestStatus.ERROR,
    data: Object.entries(state.rules.rulemap).map(
      ([id, rule]) => ({ ...rule, id }) as IApiRule,
    ),
  };
}
