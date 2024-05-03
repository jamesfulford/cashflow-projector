import { supported } from "browser-fs-access";
import { urlParams } from "./url-params";

// if ?nofs is in queryparams, then act as if we don't have filesystem support
export const isFilesystemSupported = supported && !urlParams.has("nofs");
