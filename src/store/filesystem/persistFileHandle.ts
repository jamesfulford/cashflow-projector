// Import Dexie
import Dexie from "dexie";
import { sessionID } from "../../services/sessionID";
import { fileHandleState, saveProfile } from "./fileHandle";
import { effect } from "@preact/signals-core";

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

effect(() => {
  if (!fileHandleState.value) return;
  storeFileHandle(fileHandleState.value);
});

getFileHandle().then((handle) => {
  if (!handle) return;
  console.info("Found persisted file handle", handle);
  fileHandleState.value = handle;

  // touch the timestamp so won't get cleaned up
  // then clean up handles
  storeFileHandle(handle).then(() => {
    cleanupHandles();
  });
  saveProfile();
});
