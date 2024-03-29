import { isAutosaveActiveState } from "./autosave";
import {
  newProfile,
  openProfile,
  saveProfile,
  saveProfileAs,
} from "./fileHandle";

// shortcuts
function fileShortcutHandler(e: KeyboardEvent) {
  if (!e.ctrlKey) return;

  if (e.key === "s") {
    // ctrl+s: Save
    //   TODO: remove this check in case filehandle is missing
    if (isAutosaveActiveState.peek()) {
      console.info(
        "Cowardly refusing to respond to ctrl+s shortcut since autosave is enabled.",
      );
      return;
    }
    e.preventDefault();
    saveProfile();
  } else if (e.key === "S") {
    // ctrl+shift+s: Save As
    e.preventDefault();
    saveProfileAs();
  } else if (e.key === "n") {
    // ctrl+n: New
    e.preventDefault();
    newProfile();
  } else if (e.key === "o") {
    // ctrl+o: Open
    e.preventDefault();
    openProfile();
  } else if (e.key === "D") {
    e.preventDefault();
    // eslint-disable-next-line no-debugger
    debugger;
  }
}

document.addEventListener("keyup", fileShortcutHandler, false);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    document.removeEventListener("keyup", fileShortcutHandler);
  });
}
