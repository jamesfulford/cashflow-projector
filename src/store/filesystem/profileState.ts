import { computed, signal } from "@preact/signals-core";
import {
  IParameters,
  defaultParameters,
  parametersState,
  setParameters,
} from "../../store/parameters";
import { IApiRule, loadRules, rulesState } from "../../store/rules";
import isEqual from "lodash/isEqual";

export interface Profile {
  rules: IApiRule[];
  parameters: IParameters;
}

export const profileState = computed<Profile>(() => ({
  rules: rulesState.value,
  parameters: parametersState.value,
}));

export const defaultProfile: Profile = {
  rules: [],
  parameters: defaultParameters,
};

export const lastSeenFileProfileState = signal<Profile | undefined>(undefined);

export function loadProfile(profile: Profile, skipLastSeen: boolean = false) {
  setParameters(profile.parameters);
  loadRules(profile.rules); // do after setting parameters, because relies on startDate while migrating

  if (skipLastSeen) return;
  lastSeenFileProfileState.value = profile;
}

export const profileHasChangedState = computed(() => {
  const beforeProfile = lastSeenFileProfileState.value ?? defaultProfile;
  const afterProfile = profileState.value;
  return !isEqual(beforeProfile, afterProfile);
});
