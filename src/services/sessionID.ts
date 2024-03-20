import { v4 } from "uuid";

const SESSION_ID_KEY = "sessionID";
const rawSessionID = sessionStorage.getItem(SESSION_ID_KEY);
export const sessionID = rawSessionID || v4();

if (!rawSessionID) sessionStorage.setItem(SESSION_ID_KEY, sessionID);
