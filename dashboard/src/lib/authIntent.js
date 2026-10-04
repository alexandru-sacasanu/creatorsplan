// Which auth screen the visitor asked for on the landing page ("Log in" or
// "Start free"), carried across the switch to the app. One-shot: the app
// takes it once, so a reload does not reopen the modal. sessionStorage, so
// it never outlives the tab.
const KEY = 'cp_auth_intent';

export function setAuthIntent(mode) {
  try { sessionStorage.setItem(KEY, mode); } catch { /* storage blocked: the app just opens */ }
}

// Read without consuming: a component's state initializer runs twice under
// StrictMode, so it must not be the one to clear the key.
export function peekAuthIntent() {
  try {
    const mode = sessionStorage.getItem(KEY);
    return mode === 'login' || mode === 'signup' ? mode : null;
  } catch {
    return null;
  }
}

export function takeAuthIntent() {
  try {
    const mode = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return mode === 'login' || mode === 'signup' ? mode : null;
  } catch {
    return null;
  }
}
