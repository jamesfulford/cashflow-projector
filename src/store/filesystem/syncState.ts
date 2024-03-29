import { computed } from "@preact/signals-core";
import { fileHandleState } from "./fileHandle";
import {
  defaultProfile,
  lastSeenFileProfileState,
  profileHasChangedState,
  profileState,
} from "./profileState";
import isEqual from "lodash/isEqual";

export enum ProfileSaveNeededState {
  OUT_OF_SYNC = "OUT_OF_SYNC", // we have to flush changes to file
  IN_SYNC = "IN_SYNC", // we have already flushed changes to file; everything is fine

  NO_SYNC = "NO_SYNC", // there is no file to send changes to
  NO_SYNC_AND_NO_CHANGES = "NO_SYNC_AND_NO_CHANGES", // there is no file, but there are also no changes
}

export const profileFileSynchronizationState = computed(() => {
  if (!fileHandleState.value || !lastSeenFileProfileState.value) {
    // data is ephemeral and needs to be saved
    // (unless it's defaults; no changes have been made so nothing needs changing)
    return isEqual(profileState.value, defaultProfile)
      ? ProfileSaveNeededState.NO_SYNC_AND_NO_CHANGES
      : ProfileSaveNeededState.NO_SYNC;
  }
  // there is a file handle and a previously observed profile state

  return profileHasChangedState.value
    ? ProfileSaveNeededState.OUT_OF_SYNC
    : ProfileSaveNeededState.IN_SYNC;
});
