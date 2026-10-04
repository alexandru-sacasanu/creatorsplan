import { StrictMode, useEffect, useState, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Loader2 } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginModal from './components/LoginModal'
import ShortFrameLogo from './components/ShortFrameLogo'
import Landing from './Landing.jsx'
import { setAuthIntent, peekAuthIntent, takeAuthIntent } from './lib/authIntent'

const App = lazy(() => import('./App.jsx'))

// The bare URL (/) and #landing are the same page: the marketing site. The app
// is everything else (#app, #/account, #/pricing, #/auth/...), and it is behind
// an account: AppGate shows the sign-in screen to anyone who is not signed in.
const LANDING_HASHES = ['', '#', '#landing', '#how', '#tools', '#keys']

function resolveView() {
  return LANDING_HASHES.includes(window.location.hash || '') ? 'landing' : 'app'
}

function GateShell({ children }) {
  return <div className="flex min-h-screen items-center justify-center bg-cp-canvas px-4">{children}</div>
}

// Nothing of the app renders (or fetches) until there is a signed-in user.
function AppGate() {
  const { loading, signingIn, isSignedIn, billingEnabled } = useAuth()
  const [intent] = useState(() => peekAuthIntent() || 'login')
  useEffect(() => { takeAuthIntent() }, [])

  if (loading || signingIn) return <GateShell><Loader2 className="animate-spin text-cp-ink-3" size={28} aria-label="Loading" /></GateShell>

  if (!billingEnabled) {
    return (
      <GateShell>
        <div className="max-w-sm text-center">
          <ShortFrameLogo width={22} height={36} />
          <h1 className="m-0 mt-5 text-[26px] font-semibold tracking-[-0.03em] text-cp-ink">Can’t reach creatorsplan</h1>
          <p className="m-0 mt-2 text-[15px] leading-[1.5] text-cp-ink-2">The server did not answer. Check that it is running, then try again.</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-6 min-h-[48px] px-6">Try again</button>
        </div>
      </GateShell>
    )
  }

  if (!isSignedIn) {
    return (
      <GateShell>
        <LoginModal mode={intent} onClose={() => { window.location.hash = '#landing' }} />
      </GateShell>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-cp-canvas" />}>
      <App />
    </Suspense>
  )
}

function Root() {
  const [view, setView] = useState(resolveView)

  useEffect(() => {
    const onHash = () => setView(resolveView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // `intent` ('login' | 'signup') picks which sign-in screen the gate opens on.
  const launchApp = (intent) => {
    if (intent) setAuthIntent(intent)
    window.location.hash = '#app'
    setView('app')
  }

  return view === 'landing' ? <Landing onLaunchApp={launchApp} /> : <AppGate />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
