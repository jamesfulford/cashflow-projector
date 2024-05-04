import {
  ProfileSaveNeededState,
  fileNameState,
  profileFileSynchronizationState,
  saveProfile,
} from "../store/filesystem";
import { useSignalValue } from "../store/useSignalValue";
import { isFilesystemSupported } from "../services/is-filesystem-supported";
import Button from "react-bootstrap/esm/Button";

function PureSaveIndicator({ message }: { message: string }) {
  const fileName = useSignalValue(fileNameState);

  return (
    <Button
      variant="link"
      className="p-0 m-0 underline-on-hover"
      style={{
        color: "var(--gray-text)",
        textDecoration: "none",
      }}
      onClick={() => {
        saveProfile();
      }}
      title={
        fileName ? `Click to save changes to '${fileName}'` : "Click to save"
      }
    >
      {message}
    </Button>
  );
}

export function SaveIndicator() {
  const fileSyncState = useSignalValue(profileFileSynchronizationState);

  if (fileSyncState === ProfileSaveNeededState.LOADING) return null; // Still loading persisted values, don't show anything yet

  if (fileSyncState === ProfileSaveNeededState.NO_SYNC_AND_NO_CHANGES)
    return null; // "New" case; don't show in UI yet

  // No file handle; request save

  if (isFilesystemSupported) {
    if (fileSyncState === ProfileSaveNeededState.NO_SYNC)
      return <PureSaveIndicator message="Select save file*" />;

    // autosaves immediately; no need to flash Saved/Unsaved message
    if (isFilesystemSupported) return <PureSaveIndicator message="Autosaved" />;
  }

  // File handle exists and changes saved
  if (fileSyncState === ProfileSaveNeededState.IN_SYNC)
    return <PureSaveIndicator message="Saved" />;

  // File handle exists but changes not saved (no autosave enabled)
  if (
    fileSyncState === ProfileSaveNeededState.OUT_OF_SYNC ||
    fileSyncState === ProfileSaveNeededState.NO_SYNC
  )
    return <PureSaveIndicator message="Unsaved changes*" />;

  // should never happen
  return null;
}
