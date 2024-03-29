import { computed, effect } from "@preact/signals-core";
import { fileHandleState } from "./fileHandle";
import { isFilesystemSupported } from "../../services/is-filesystem-supported";
import {
  ProfileSaveNeededState,
  profileFileSynchronizationState,
} from "./syncState";

function removeFileExtension(filename: string | undefined): string | undefined {
  if (!filename) return;
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    // If a dot was found
    return filename.substring(0, lastDotIndex);
  } else {
    return filename; // No file extension found
  }
}

export const fileNameState = computed(() =>
  removeFileExtension(fileHandleState.value?.name),
);

effect(() => {
  const shouldShowSaveNeeded = isFilesystemSupported
    ? // if autosave doable, only indicate if we don't have a filehandle
      profileFileSynchronizationState.value === ProfileSaveNeededState.NO_SYNC
    : // if autosave not doable, indicate if no filehandle or there are unflushed changes
      [
        ProfileSaveNeededState.NO_SYNC,
        ProfileSaveNeededState.OUT_OF_SYNC,
      ].includes(profileFileSynchronizationState.value);

  const title =
    (shouldShowSaveNeeded ? "* " : "") +
    (fileNameState.value ?? "Cashflow Projector");

  document.title = title;
});
