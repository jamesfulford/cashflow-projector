import { effect } from "@preact/signals-core";
import { fileHandleState } from "./fileHandle";

effect(() => {
  const filehandle = fileHandleState.value;
  if (!filehandle) return;
  console.info("File name:", filehandle.name);
});
