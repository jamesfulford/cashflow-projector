import { AppState } from "..";
import { IApiTransaction } from "../../../services/TransactionsService";
import { RequestStatus } from "./actions";

export function getTransactions(state: AppState): {
  data: IApiTransaction[];
  loading: boolean;
  error: boolean;
} {
  return {
    loading: state.transactions.status === RequestStatus.LOADING,
    error: state.transactions.status === RequestStatus.ERROR,
    data: state.transactions.transactions,
  };
}

export function getCurrentDisposableIncome(state: AppState): number {
  return getTransactions(state).data[0].calculations.working_capital;
}
