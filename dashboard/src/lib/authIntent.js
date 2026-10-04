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

// Why a Google sign-in bounced back (?error= on the callback hash), shown once
// on the log-in screen the gate opens next.
const ERROR_KEY = 'cp_auth_error';
const ERROR_TEXT = {
  unverified: 'Google says that email address is not verified. Use the email link instead.',
  noemail: 'Google did not share an email address. Use the email link instead.',
  oauth: 'Google sign-in did not complete. Try again, or use the email link.',
};

export function setAuthError(code) {
  try { sessionStorage.setItem(ERROR_KEY, ERROR_TEXT[code] || ERROR_TEXT.oauth); } catch { /* ignore */ }
}

export function peekAuthError() {
  try { return sessionStorage.getItem(ERROR_KEY) || ''; } catch { return ''; }
}

export function clearAuthError() {
  try { sessionStorage.removeItem(ERROR_KEY); } catch { /* ignore */ }
}
