import { IApiTransaction } from "../../../services/TransactionsService";
import { RequestStatus, TransactionAction, TransactionsType } from "./actions";

export interface TransactionsState {
  transactions: IApiTransaction[];
  status: RequestStatus;
}

const initialState = {
  transactions: [],
  status: RequestStatus.STABLE,
};

const reducer = (
  state: TransactionsState = initialState,
  action: TransactionAction,
): TransactionsState => {
  switch (action.type) {
    case TransactionsType.SET:
      return { ...state, transactions: action.transactions };
    case TransactionsType.SET_STATUS:
      return { ...state, status: action.status };
    default:
      return state;
  }
};

export default reducer;
