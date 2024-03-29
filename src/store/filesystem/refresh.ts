import { effect } from "@preact/signals-core";
import { loadProfile, profileState } from "./profileState";

const PROFILE_KEY = "profile";

const rawPersistedProfile = sessionStorage.getItem(PROFILE_KEY);
if (rawPersistedProfile) {
  console.info("Found profile in sessionStorage.");
  loadProfile(JSON.parse(rawPersistedProfile), true);
}
effect(() => {
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profileState.value));
});
