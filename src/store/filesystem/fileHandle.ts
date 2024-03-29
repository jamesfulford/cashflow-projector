import { signal } from "@preact/signals-core";
import { fileOpen, fileSave } from "browser-fs-access";
import {
  Profile,
  defaultProfile,
  lastSeenFileProfileState,
  loadProfile,
  profileHasChangedState,
  profileState,
} from "./profileState";

export const fileHandleState = signal<FileSystemFileHandle | undefined>(
  undefined,
);

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
        fileName: `My Profile${extension}`,
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
        fileName: `My Profile${extension}`,
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
  loadProfile(defaultProfile, true);
  lastSeenFileProfileState.value = undefined; // set to undefined to properly trigger "New" case
}
