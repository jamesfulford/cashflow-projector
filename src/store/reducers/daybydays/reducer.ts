import { IApiDayByDay } from "../../../services/DayByDayService";
import { RequestStatus, DayByDayAction, DayByDayType } from "./actions";

export interface DayByDaysState {
  response?: IApiDayByDay;
  status: RequestStatus;
}

const initialState = {
  response: undefined,
  status: RequestStatus.LOADING,
};

const reducer = (
  state: DayByDaysState = initialState,
  action: DayByDayAction,
): DayByDaysState => {
  switch (action.type) {
    case DayByDayType.SET:
      return { ...state, response: action.daybydays };
    case DayByDayType.SET_STATUS:
      return { ...state, status: action.status };
    default:
      return state;
  }
};
export default reducer;
