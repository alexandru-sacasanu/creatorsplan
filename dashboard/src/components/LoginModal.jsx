import React, { useState } from 'react';
import { ArrowRight, Check, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './ui/Modal';
import ShortFrameLogo from './ShortFrameLogo';

const COPY = {
  login: {
    title: 'Welcome back',
    body: 'Log in to your creatorsplan account.',
    google: 'Log in with Google',
    email: 'Email me a log-in link',
    switchText: 'New to creatorsplan?',
    switchCta: 'Create an account',
  },
  signup: {
    title: 'Create your account',
    body: 'Free to start: your first video up to 60 minutes, then 20 minutes a month. No card needed.',
    google: 'Sign up with Google',
    email: 'Email me a sign-up link',
    switchText: 'Already have an account?',
    switchCta: 'Log in',
  },
};

// Log in / sign up modal: magic link (email) + Google OAuth. The backend has
// one flow (the first verified link creates the account), so the two modes
// differ only in copy, and a footer link switches between them.
// `queued` says the visitor pressed "get free clips" before signing in and the
// request is parked: the work resumes by itself once they are back, and saying
// so is the difference between a sign-in wall and a saved job.

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginModal({ onClose, queued = false, mode: initialMode = 'login' }) {
  const { requestMagicLink, loginWithGoogle, googleAuthEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : 'login');
  const copy = COPY[mode];

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError('');
    try {
      await requestMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <div className="flex flex-col items-center px-1 pb-1 pt-3 text-center sm:px-3 sm:pt-5">
        <ShortFrameLogo width={22} height={36} />

        {sent ? (
          <div className="mt-6 flex w-full flex-col items-center" role="status">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-cp-ink bg-cp-volt">
              <Mail size={24} className="text-cp-ink" />
            </span>
            <h2 className="m-0 mt-5 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] text-cp-ink">Check your inbox</h2>
            <p className="m-0 mt-2 max-w-[340px] text-[15px] leading-[1.5] text-cp-ink-2">
              We sent a {mode === 'signup' ? 'sign-up' : 'log-in'} link to
              <b className="block break-words font-semibold text-cp-ink">{email}</b>
              Open it on this device to continue.
            </p>
            <p className="m-0 mt-4 font-cp-mono text-xs font-medium tracking-[0.06em] text-cp-ink-3">LINK EXPIRES IN 15 MIN</p>
            <div className="mt-7 w-full border-t border-cp-line pt-5">
              <p className="cp-help m-0">Nothing yet? Check spam, or</p>
              <button type="button" onClick={() => { setSent(false); setError(''); }} className="btn-ghost mt-3 w-full">
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="m-0 mt-5 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-cp-ink">{copy.title}</h2>
            <p className="m-0 mt-2 max-w-[340px] text-[15px] leading-[1.5] text-cp-ink-2">{copy.body}</p>

            {queued && (
              <div className="mt-5 flex w-full items-start gap-2.5 rounded-input border-[1.5px] border-cp-ink bg-cp-volt-soft px-3.5 py-3 text-left">
                <Check size={16} className="mt-0.5 shrink-0 text-cp-ink" />
                <p className="m-0 text-sm leading-[1.45] text-cp-ink">
                  Your video is saved. Sign in and the clips start on their own, no need to paste it again.
                </p>
              </div>
            )}

            {googleAuthEnabled && (
              <>
                <button type="button" onClick={loginWithGoogle} className="btn-ghost mt-6 min-h-[52px] w-full border-[1.5px] border-cp-ink">
                  <GoogleGlyph />
                  {copy.google}
                </button>
                <div className="my-5 flex w-full items-center gap-3" aria-hidden="true">
                  <div className="flex-1 border-t border-cp-line" />
                  <span className="font-cp-mono text-xs font-medium tracking-[0.08em] text-cp-ink-3">OR</span>
                  <div className="flex-1 border-t border-cp-line" />
                </div>
              </>
            )}

            <form onSubmit={submit} className={`flex w-full flex-col gap-2 text-left ${googleAuthEnabled ? '' : 'mt-6'}`} noValidate>
              <label htmlFor="login-email" className="cp-label">Email</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cp-ink-3" />
                <input
                  id="login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input-field min-h-[52px] pl-11"
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? 'login-error' : undefined}
                  autoFocus
                />
              </div>
              {error && (
                <p id="login-error" role="alert" className="m-0 rounded-input bg-cp-stop-bg px-3 py-2 text-sm text-cp-stop">{error}</p>
              )}
              <button type="submit" disabled={busy || !email.trim()} className="btn-primary mt-2 min-h-[52px] w-full">
                {busy
                  ? <><Loader2 size={18} className="animate-spin" /> Sending link</>
                  : <>{copy.email} <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="m-0 mt-6 text-sm text-cp-ink-2">
              {copy.switchText}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="font-semibold text-cp-ink underline underline-offset-2 hover:text-cp-ink-2"
              >
                {copy.switchCta}
              </button>
            </p>

            {/* The account is created by this button, so the terms have to be
                reachable from it: a magic-link signup never passes the footer. */}
            <p className="m-0 mt-4 text-xs leading-relaxed text-cp-ink-3">
              By continuing you agree to our{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cp-ink-2 underline underline-offset-2 hover:text-cp-ink">Terms of service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-cp-ink-2 underline underline-offset-2 hover:text-cp-ink">Privacy policy</a>.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
