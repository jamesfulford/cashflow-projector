// Import Dexie
import Dexie from "dexie";
import { sessionID } from "../../services/sessionID";
import { fileHandleState, saveProfile } from "./fileHandle";
import { effect } from "@preact/signals-core";
import { profileHasChangedState } from "./profileState";
import { isLoadingFileHandleState } from "./syncState";

// Define a new Dexie database
const db = new Dexie("myDatabase");

// Define a table for storing FileSystemFileHandle objects
db.version(1).stores({
  fileHandles: "id, fileHandle, timestamp",
});

// Open the database
db.open().catch(function (error) {
  console.error("Error opening database: " + error);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fileHandles = (db as any).fileHandles;

// Store FileSystemFileHandle object
function storeFileHandle(fileHandle: FileSystemFileHandle) {
  return fileHandles.put({
    id: sessionID,
    fileHandle: fileHandle,
    timestamp: Date.now(),
  });
}
function deleteFileHandle() {
  return fileHandles.where("id").equals(sessionID).delete();
}

// Retrieve FileSystemFileHandle object
function getFileHandle(): Promise<FileSystemFileHandle> {
  return (
    fileHandles
      .get(sessionID)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((fileHandleData: any) => {
        if (fileHandleData) {
          return fileHandleData.fileHandle as FileSystemFileHandle;
        } else {
          console.warn("File handle not found");
          return null;
        }
      })
      .catch((error: Error) => {
        console.error("Error retrieving file handle: ", error);
        return null;
      })
  );
}

async function cleanupHandles() {
  const HOUR = 60 * 60 * 1000;
  const EXPIRATION_TIME = 1 * HOUR;
  const result = await fileHandles
    .where("timestamp")
    .below(Date.now() - EXPIRATION_TIME)
    .delete();

  console.log("Deleted expired IndexDB entries:", result);
}

// on page load, attempt to reload persisted file handle
getFileHandle()
  .then((handle) => {
    if (!handle) return;
    console.info("Found persisted file handle", handle);

    if (!profileHasChangedState.peek()) {
      // why bail out if no changes detected?
      // because this is likely the scenario where no profile was loaded (but a file handle was)
      // so we don't want to write the default profile to the perfectly fine filehandle
      console.info(
        "It appears as if a profile was not loaded. Ignoring persisted filehandle.",
      );
      return;
    }

    // save file handle in state
    fileHandleState.value = handle;

    // wait for flush to finish
    return saveProfile();
  })
  .finally(() => {
    // only start this effect after file handle has been restored (if done at all)
    effect(() => {
      if (!fileHandleState.value) {
        deleteFileHandle(); // if "New" is selected, stop persisting the file handle
      } else {
        storeFileHandle(fileHandleState.value).finally(() => {
          // cleanup expired handles after 'touching' the current (or persisted) one so we keep it alive
          cleanupHandles();
        });
      }
    });

    isLoadingFileHandleState.value = false; // mark as done so we can start showing the SaveIndicator
  });
