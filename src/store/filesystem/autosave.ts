import { computed, effect } from "@preact/signals-core";
import { isFilesystemSupported } from "../../services/is-filesystem-supported";
import { profileState } from "./profileState";
import { fileHandleState, saveProfile } from "./fileHandle";

// immediate autosave
if (isFilesystemSupported) {
  effect(() => {
    if (profileState.value && fileHandleState.value) {
      saveProfile();
    }
  });
}
export const isAutosaveActiveState = computed(
  () => isFilesystemSupported && !!fileHandleState.value,
);
