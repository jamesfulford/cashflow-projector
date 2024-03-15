import { computed, effect, signal } from "@preact/signals-core";
import {
  IParameters,
  defaultParameters,
  parametersState,
  setParameters,
} from "../store/parameters";
import { IApiRule, loadRules, rulesState } from "../store/rules";
import { fileOpen, fileSave } from "browser-fs-access";
import isEqual from "lodash/isEqual";
import { isFilesystemSupported } from "../services/is-filesystem-supported";

interface Profile {
  rules: IApiRule[];
  parameters: IParameters;
}
const profileState = computed<Profile>(() => ({
  rules: rulesState.value,
  parameters: parametersState.value,
}));

const defaultProfile: Profile = {
  rules: [],
  parameters: defaultParameters,
};

const lastSeenFileProfileState = signal<Profile | undefined>(undefined);

function loadProfile(profile: Profile) {
  setParameters(profile.parameters);
  loadRules(profile.rules); // do after setting parameters, because relies on startDate while migrating

  lastSeenFileProfileState.value = profile;
}
export const profileHasChangedState = computed(() => {
  const beforeProfile = lastSeenFileProfileState.value ?? defaultProfile;
  const afterProfile = profileState.value;
  return !isEqual(beforeProfile, afterProfile);
});
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

const fileHandleState = signal<FileSystemFileHandle | undefined>(undefined);

async function profileFromBlob(blob: Blob): Promise<Profile> {
  const { rules, parameters } = JSON.parse(await blob.text());

  if (!rules || !parameters) throw new Error("Invalid .json file provided.");

  return { rules, parameters };
}

function profileToBlob(profile: Profile): Blob {
  return new Blob([JSON.stringify(profile, null, 4)], {
    type: "application/json",
  });
}

const id = "jamesfulford-cashflow-v1";
const mimeTypes = ["application/json"];
const extension = ".json";
const extensions = [extension];

export async function openProfile() {
  const blob = await fileOpen({
    id,
    mimeTypes,
    extensions,
  });

  const profile = await profileFromBlob(blob);
  loadProfile(profile);

  fileHandleState.value = blob.handle;
}

function applyLocalstorageCleanup() {
  // because we were doing localstorage but now we want to use session storage
  // but we don't want to clean up localstorage until we're sure we've moved the data
  // to more permanent persistence; namely, a file.
  localStorage.removeItem("parameters");
  localStorage.removeItem("rules");
}
export async function saveProfile(): Promise<string | undefined> {
  const profile = profileState.peek();
  const blob = profileToBlob(profile);

  const fileHandle =
    (await fileSave(
      blob,
      {
        fileName: `My Plan${extension}`,
        extensions,
        id,
      },
      fileHandleState.value,
    )) ?? undefined;

  lastSeenFileProfileState.value = profile;
  fileHandleState.value = fileHandle;

  applyLocalstorageCleanup(); // only apply if no errors thrown

  return fileHandle?.name;
}

export async function saveProfileAs(): Promise<string | undefined> {
  const profile = profileState.peek();
  const blob = profileToBlob(profile);

  const fileHandle =
    (await fileSave(
      blob,
      {
        fileName: `My Plan${extension}`,
        extensions,
        id,
      }, // omit filesystem handle passed in to achieve "save as" behavior
    )) ?? undefined;

  lastSeenFileProfileState.value = profile;
  fileHandleState.value = fileHandle;

  applyLocalstorageCleanup(); // only apply if no errors thrown

  return fileHandle?.name;
}

export async function newProfile() {
  if (profileHasChangedState.peek()) {
    const wantsToContinue = confirm(
      "Your unsaved changes will be lost. Do you want to continue?",
    );
    if (!wantsToContinue) return;
  }
  fileHandleState.value = undefined; // deleting filehandle before so autosave doesn't write to file during loadProfile
  loadProfile(defaultProfile);
}

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
  const title =
    (!isFilesystemSupported &&
    [
      ProfileSaveNeededState.NO_SYNC,
      ProfileSaveNeededState.OUT_OF_SYNC,
    ].includes(profileFileSynchronizationState.value)
      ? "* "
      : "") + (fileNameState.value ?? "Cashflow Projector");

  document.title = title;
});

// shortcuts
function fileShortcutHandler(e: KeyboardEvent) {
  if (!e.ctrlKey) return;

  if (e.key === "s") {
    // ctrl+s: Save
    if (isAutosaveActiveState.peek()) {
      console.info(
        "Cowardly refusing to respond to ctrl+s shortcut since autosave is enabled.",
      );
      return;
    }
    saveProfile();
  } else if (e.key === "S") {
    // ctrl+shift+s: Save As
    saveProfileAs();
  } else if (e.key === "n") {
    // ctrl+n: New
    newProfile();
  } else if (e.key === "o") {
    // ctrl+o: Open
    openProfile();
  } else if (e.key === "D") {
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
