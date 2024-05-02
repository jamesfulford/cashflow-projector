import posthog from "posthog-js";
import { isDownwardState, isIncomelessState } from "../store/mode";
import { rulesState } from "../store/rules";
import { isBelowSafetyNetState } from "../store/daybydays";

export function registerSupportFor(thing: string) {
  const key = `has-voted-for-${thing}`;
  if (localStorage.getItem(key)) return; // already voted; ignore
  localStorage.setItem(key, "☑️"); // set to truthy so next vote ignored

  posthog.capture("support_registered", {
    thing,
    isIncomeless: isIncomelessState.peek(),
    isDownward: isDownwardState.peek(),
    isBelowSafetyNet: isBelowSafetyNetState.peek(),
    rulesCount: rulesState.peek(),
  });
}
