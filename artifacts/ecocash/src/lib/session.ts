export function getSessionId(): string | null {
  return localStorage.getItem("ecocash_session_id");
}

export function setSessionId(sessionId: string) {
  localStorage.setItem("ecocash_session_id", sessionId);
}

export function clearSessionId() {
  localStorage.removeItem("ecocash_session_id");
}
