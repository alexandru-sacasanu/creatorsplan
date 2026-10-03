import { StrictMode, useEffect, useState, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './Landing.jsx'
import { setAuthIntent } from './lib/authIntent'

const App = lazy(() => import('./App.jsx'))

// Someone who has launched the app once goes straight to it on their next
// visit; #landing (the logo) always brings the marketing page back. Same key
// as before the rebrand, so returning users keep skipping it.
const SKIP_LANDING_KEY = 'openshorts_skip_landing'
const LANDING_HASHES = ['#landing', '#how', '#tools', '#keys']

function skipsLanding() {
  try { return localStorage.getItem(SKIP_LANDING_KEY) === '1' } catch { return false }
}

// The landing page owns only the bare URL and its own anchors. Every other
// hash (#app, #/auth/…, #/account, #/pricing…) is the app's, exactly as before.
function resolveView() {
  const hash = window.location.hash || ''
  if (LANDING_HASHES.includes(hash)) return 'landing'
  if (hash === '' || hash === '#') return skipsLanding() ? 'app' : 'landing'
  return 'app'
}

function Root() {
  const [view, setView] = useState(resolveView)

  useEffect(() => {
    const onHash = () => setView(resolveView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Reaching the app by any route (a sign-in link, a bookmark of #app) counts
  // as having launched it: code inside the app that clears the hash must not
  // drop a working user back on the marketing page.
  useEffect(() => {
    if (view !== 'app') return
    try { localStorage.setItem(SKIP_LANDING_KEY, '1') } catch { /* ignore */ }
  }, [view])

  // `intent` ('login' | 'signup') opens that auth screen once the app is up.
  const launchApp = (intent) => {
    if (intent) setAuthIntent(intent)
    window.location.hash = '#app'
    setView('app')
  }

  if (view === 'landing') return <Landing onLaunchApp={launchApp} />
  return (
    <Suspense fallback={<div className="min-h-screen bg-cp-canvas" />}>
      <App />
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
