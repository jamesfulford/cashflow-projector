import { FlagService, IFlags } from "../../../services/FlagService";

export enum FlagsType {
  SET = "flags/set",
  SET_STATUS = "flags/status",
}

interface SetFlagAction {
  type: FlagsType.SET;
  flags: IFlags;
}
export function setFlags(flags: IFlags): SetFlagAction {
  return {
    type: FlagsType.SET,
    flags,
  };
}

export enum RequestStatus {
  STABLE = "STABLE",
  LOADING = "LOADING",
  ERROR = "ERROR",
}
interface SetFlagStatusAction {
  type: FlagsType.SET_STATUS;
  status: RequestStatus;
}
export function setFlagStatus(status: RequestStatus): SetFlagStatusAction {
  return {
    type: FlagsType.SET_STATUS,
    status,
  };
}

// Aggregate
export type FlagsAction = SetFlagAction | SetFlagStatusAction;

export function fetchFlags() {
  return (dispatch: any) => {
    dispatch(setFlagStatus(RequestStatus.LOADING));
    FlagService.fetchDayByDays()
      .then((flags) => {
        dispatch(setFlags(flags));
        dispatch(setFlagStatus(RequestStatus.STABLE));
      })
      .catch(() => {
        dispatch(setFlagStatus(RequestStatus.ERROR));
      });
  };
}
