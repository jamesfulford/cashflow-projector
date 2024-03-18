import {
  ProfileSaveNeededState,
  fileNameState,
  profileFileSynchronizationState,
  saveProfile,
} from "../store/filesystem";
import { useSignalValue } from "../store/useSignalValue";
import { isFilesystemSupported } from "../services/is-filesystem-supported";
import Button from "react-bootstrap/esm/Button";

export function SaveIndicator() {
  const fileSyncState = useSignalValue(profileFileSynchronizationState);
  const fileName = useSignalValue(fileNameState);
  if (isFilesystemSupported) return null; // autosaves immediately; no need to show saved status so prominently

  // TODO: find cleaner place to put this in the UI

  if (fileSyncState === ProfileSaveNeededState.NO_SYNC_AND_NO_CHANGES)
    return null;

  return (
    <Button
      variant="link"
      className="p-0 m-0 underline-on-hover"
      style={{
        color: "var(--tertiary)",
        textDecoration: "none",
      }}
      onClick={() => {
        saveProfile();
      }}
      title={
        fileName ? `Click to save changes to '${fileName}'` : "Click to save"
      }
    >
      {fileSyncState === ProfileSaveNeededState.NO_SYNC ||
      fileSyncState === ProfileSaveNeededState.OUT_OF_SYNC
        ? "Unsaved changes*"
        : // the only remaining case is ProfileSaveNeededState.IN_SYNC
          "Saved"}
    </Button>
  );
}
