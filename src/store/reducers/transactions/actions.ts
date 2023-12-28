import {
  TransactionsService,
  IApiTransaction,
} from "../../../services/TransactionsService";
import { IParameters } from "../parameters";

export enum TransactionsType {
  SET = "transactions/set",
  SET_STATUS = "transactions/status",
}

interface SetTransactionsAction {
  type: TransactionsType.SET;
  transactions: IApiTransaction[];
}
export function setTransactions(
  transactions: IApiTransaction[],
): SetTransactionsAction {
  return {
    type: TransactionsType.SET,
    transactions,
  };
}

export enum RequestStatus {
  STABLE = "STABLE",
  LOADING = "LOADING",
  ERROR = "ERROR",
}
interface SetTransactionsStatusAction {
  type: TransactionsType.SET_STATUS;
  status: RequestStatus;
}
export function setTransactionsStatus(
  status: RequestStatus,
): SetTransactionsStatusAction {
  return {
    type: TransactionsType.SET_STATUS,
    status,
  };
}

// Aggregate
export type TransactionAction =
  | SetTransactionsAction
  | SetTransactionsStatusAction;

export function fetchTransactions(params: IParameters) {
  return (dispatch: any) => {
    dispatch(setTransactionsStatus(RequestStatus.LOADING));
    return TransactionsService.fetchTransactions(params)
      .then((transactions) => {
        dispatch(setTransactions(transactions));
        dispatch(setTransactionsStatus(RequestStatus.STABLE));
      })
      .catch((e) => {
        dispatch(setTransactionsStatus(RequestStatus.ERROR));
        throw e;
      });
  };
}
