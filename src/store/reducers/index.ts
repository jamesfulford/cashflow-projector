import { combineReducers } from "redux";

import rules from "./rules";
import transactions from "./transactions";
import daybydays from "./daybydays";
import parameters from "./parameters";
import flags from "./flags";

const rootReducer = combineReducers({
  rules,
  transactions,
  daybydays,
  parameters,
  flags,
});

export default rootReducer;
export type AppState = ReturnType<typeof rootReducer>;
