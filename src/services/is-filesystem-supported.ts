import { supported } from "browser-fs-access";

const params = new URLSearchParams(
  window.location.href.split("?").slice(1).join("?"),
);

// if ?nofs is in queryparams, then act as if we don't have filesystem support
export const isFilesystemSupported = supported && !params.has("nofs");
