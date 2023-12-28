import { AppState } from "..";
import { IFlags } from "../../../services/FlagService";

// Use feature flags to enable a feature separate of a deployment
// however, the `if` is async, so we might have a moment without the flags loaded
// during that time, will use the values below.
// If FF is enabled for everyone, but not ready to remove checks from around the app, just change to `true` below.
const defaultFlagValues: IFlags = {
  highLowEnabled: false,
};

function buildFlagSelector(flag: keyof IFlags) {
  return (state: AppState): boolean => {
    return (state.flags.flags || defaultFlagValues)[flag];
  };
}

export const getIsHighLowEnabled = buildFlagSelector("highLowEnabled");

export function getFlags(state: AppState): IFlags | undefined {
  // will return undefined if not loaded
  return state.flags.flags;
}
