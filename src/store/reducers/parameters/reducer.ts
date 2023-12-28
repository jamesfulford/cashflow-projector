import {
  IParameters,
  RequestStatus,
  ParametersAction,
  ParametersType,
} from "./actions";

export interface RuleState {
  parameters: IParameters;
  status: RequestStatus;
}

// const currentDate = new Date();
const initialState = {
  // These parameters should
  // parameters: {
  //     currentBalance: 0,
  //     setAside: 0,
  //     startDate: currentDate.toISOString().split("T")[0],
  //     // 90 days later
  //     endDate: new Date(currentDate.getTime() + (1000 * 60 * 60 * 24 * 90)).toISOString().split("T")[0],
  // },
  parameters: {} as IParameters,
  status: RequestStatus.LOADING,
};

const reducer = (
  state: RuleState = initialState,
  action: ParametersAction,
): RuleState => {
  switch (action.type) {
    case ParametersType.SET:
      return {
        ...state,
        parameters: {
          ...state.parameters,
          ...action.parameters,
        } as IParameters,
      };
    case ParametersType.SET_STATUS:
      return { ...state, status: action.status };
    default:
      return state;
  }
};

export default reducer;
