import { AppState } from "..";
import { IParameters, RequestStatus } from "./actions";

export function getParameters(state: AppState): IParameters {
  return state.parameters.parameters;
}

export function getParametersStatuses(state: AppState): {
  loading: boolean;
  error: boolean;
} {
  return {
    loading: state.parameters.status === RequestStatus.LOADING,
    error: state.parameters.status === RequestStatus.ERROR,
  };
}
