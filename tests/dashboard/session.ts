import { user } from "./fixtures";
export const SESSION_EXPIRED_EVENT = "inventra:validation-session-expired";
export function getSession() { return { token: "VALIDATION_ONLY", user, expiresAt: Number.MAX_SAFE_INTEGER }; }
export function clearSession() {}
