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
  if (!fileHandleState.value && !lastSeenFileProfileState.value) {
    // "New" case
    return isEqual(profileState.value, defaultProfile)
      ? ProfileSaveNeededState.NO_SYNC_AND_NO_CHANGES
      : ProfileSaveNeededState.NO_SYNC;
  }

  if (!fileHandleState.value) {
    // we don't have a file handle (but do have a last observed profile)
    // so we need to ask for a save so we can get one
    return ProfileSaveNeededState.NO_SYNC;
  }

  // we have a file handle

  // if we somehow don't have a last profile piece of data but do have a filehandle,
  // then ask for a save so we can be sure about files' last state
  if (!lastSeenFileProfileState.value) {
    return ProfileSaveNeededState.OUT_OF_SYNC;
  }

  // there is a file handle and a previously observed profile state

  return profileHasChangedState.value
    ? ProfileSaveNeededState.OUT_OF_SYNC
    : ProfileSaveNeededState.IN_SYNC;
});
