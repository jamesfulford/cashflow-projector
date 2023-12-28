import { IFlags } from "../../../services/FlagService";
import { RequestStatus, FlagsAction, FlagsType } from "./actions";

export interface RuleState {
  flags?: IFlags;
  status: RequestStatus;
}

const initialState = {
  flags: undefined,
  status: RequestStatus.STABLE,
};

const reducer = (
  state: RuleState = initialState,
  action: FlagsAction,
): RuleState => {
  switch (action.type) {
    case FlagsType.SET:
      return {
        ...state,
        flags: action.flags,
      };
    case FlagsType.SET_STATUS:
      return { ...state, status: action.status };
    default:
      return state;
  }
};

export default reducer;
