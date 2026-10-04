import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Upload, Youtube, Instagram, ChevronDown, Check, Activity, LayoutDashboard, Settings, Plus, History, X, Terminal, Shield, LayoutGrid, Image, Globe, RotateCcw, AlertTriangle, KeyRound, Bot, Users, Smartphone, ExternalLink, Copy, CheckCircle2, Loader2, Download, Menu, Lock, Clapperboard, SquareUser, SlidersHorizontal, CreditCard } from 'lucide-react';
import KeyInput from './components/KeyInput';
import MediaInput from './components/MediaInput';
import McpConnectCard from './components/McpConnectCard';
import ResultCard from './components/ResultCard';
import ProcessingAnimation from './components/ProcessingAnimation';
// import Gallery from './components/Gallery';
import ThumbnailStudio from './components/ThumbnailStudio';
import SaaShortsTab from './components/SaaShortsTab';
import UGCGallery from './components/UGCGallery';
import ClipEditor from './components/ClipEditor';
import ReframeEditor from './components/ReframeEditor';
import PlanCard from './components/PlanCard';
import TopUpModal from './components/TopUpModal';
import WatermarkModal, { watermarkNoticeDismissed } from './components/WatermarkModal';
import { getApiUrl } from './config';
import PlanChoiceModal from './components/PlanChoiceModal';
import ClipTutorial from './components/ClipTutorial';
import OnboardingSurvey from './components/OnboardingSurvey';
import TrialUpgradeModal from './components/TrialUpgradeModal';
import LoginModal from './components/LoginModal';
import { takeAuthIntent } from './lib/authIntent';
import TrialGate from './components/TrialGate';
import AdvancedBanner from './components/AdvancedBanner';
import HistoryTab from './components/HistoryTab';
import ProfileMenu from './components/ProfileMenu';
import ShortFrameLogo from './components/ShortFrameLogo';
import Modal from './components/ui/Modal';
import { Screen, ScreenHeader, SettingsSection } from './components/ui/Screen';
import { useAuth } from './contexts/AuthContext';
import { apiFetch, apiJson, QuotaError } from './lib/api';
import { track } from './lib/analytics';

// Enhanced "Encryption" using XOR + Base64 with a Salt
// This is better than plain Base64 but still client-side.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "OpenShorts-Static-Salt-Change-Me";
const ENCRYPTION_PREFIX = "ENC:";

const encrypt = (text) => {
  if (!text) return '';
  try {
    const xor = text.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('');
    return ENCRYPTION_PREFIX + btoa(xor);
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
};

const decrypt = (text) => {
  if (!text) return '';
  if (text.startsWith(ENCRYPTION_PREFIX)) {
    try {
      const raw = text.slice(ENCRYPTION_PREFIX.length);
      // Check if it's plain base64 or our custom XOR (simple try)
      const xor = atob(raw);
      const result = xor.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
      ).join('');
      return result;
    } catch (e) {
      // Fallback if decryption fails (might be old plain text)
      return '';
    }
  }
  // Backward compatibility: If no prefix, assume old plain text (or return empty if you want to force re-login)
  // For migration: Return text as is, so it populates the field, and next save will encrypt it.
  return text;
};

// Simple TikTok icon sine Lucide might not have it or it varies
const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

/* The job a signed-out visitor started, parked until they come back signed in.
 *
 * Pressing "get free clips" without a session used to open the login modal and
 * drop the work on the floor: the magic link lands on a fresh document, so the
 * pasted URL was gone and the highest-intent step in the funnel ended in an
 * empty form. The same is true of the Google round trip.
 *
 * So the request is written down before the redirect and replayed after it.
 * localStorage rather than sessionStorage because the magic link usually opens
 * in a new tab, and a TTL because a request parked last week is not what the
 * user is doing now. File uploads cannot be serialised (a File is not JSON), so
 * those are only resumed within the same document, via the in-memory fallback. */
const PENDING_JOB_KEY = 'os_pending_job';
const PENDING_JOB_TTL_MS = 60 * 60 * 1000;
let pendingJobInMemory = null;

function stashPendingJob(data) {
  const stamp = Date.now();
  const entry = { stamp, data: { ...data, payload: typeof data?.payload === 'string' ? data.payload : null } };
  pendingJobInMemory = { stamp, data };
  try {
    localStorage.setItem(PENDING_JOB_KEY, JSON.stringify(entry));
  } catch (_) { /* private mode: the in-memory copy still covers same-document flows */ }
  return stamp;
}

function peekPendingJob() {
  try {
    const raw = localStorage.getItem(PENDING_JOB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data?.payload && Date.now() - (parsed.stamp || 0) < PENDING_JOB_TTL_MS) {
        return parsed;
      }
      localStorage.removeItem(PENDING_JOB_KEY);
    }
  } catch (_) { /* ignore */ }
  // A File cannot survive a reload; this covers a sign-in that did not reload.
  if (pendingJobInMemory && Date.now() - pendingJobInMemory.stamp < PENDING_JOB_TTL_MS) {
    return pendingJobInMemory;
  }
  return null;
}

function clearPendingJob() {
  pendingJobInMemory = null;
  try {
    localStorage.removeItem(PENDING_JOB_KEY);
  } catch (_) { /* ignore */ }
}

const formatRetention = (seconds) => {
  if (seconds >= 86400) return `${Math.round(seconds / 86400)} day${seconds >= 172800 ? 's' : ''}`;
  if (seconds >= 3600) return `${Math.round(seconds / 3600)} hour${seconds >= 7200 ? 's' : ''}`;
  return `${Math.max(1, Math.round(seconds / 60))} min`;
};

const SESSION_KEY = 'openshorts_session';

// The server's own explanation for a rejected/failed job, readable: FastAPI
// answers {"detail": "..."} or {"detail": {"message": ...}}. Showing the raw
// JSON (or a generic "failed") hid actionable reasons such as "this video is
// only 30s long", and new users in the tutorial saw only "That run failed".
const readableError = (raw) => {
  const text = String(raw || '').trim();
  try {
    const body = JSON.parse(text);
    const d = body?.detail ?? body;
    if (typeof d === 'string' && d) return d.slice(0, 300);
    if (d && typeof d.message === 'string') return d.message.slice(0, 300);
  } catch (_) { /* not JSON */ }
  return text.replace(/^Error:\s*/, '').slice(0, 300) || 'Something went wrong.';
};
// Matches the self-host JOB_RETENTION_SECONDS default. A restore whose job was
// already purged server-side fails gracefully and clears the saved session.
const SESSION_MAX_AGE = 86400000; // 24 hours

// Mock polling function
const pollJob = async (jobId) => {
  const res = await apiFetch(`/api/status/${jobId}`);
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
};

function App() {
  // Cloud auth/billing session (inert when billing is disabled).
  const { billingEnabled, isManaged, isSignedIn, me, plan, refreshMe, jobRetentionSeconds, localLlm, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login'); // 'login' | 'signup': same backend, different screen
  const openAuth = useCallback((mode = 'login') => { setLoginMode(mode); setShowLogin(true); }, []);
  // "Log in" / "Start free" on the landing page: open that screen once auth
  // has loaded. Ignored when signed in, and on self-host (no accounts there).
  useEffect(() => {
    if (authLoading) return;
    const intent = takeAuthIntent();
    if (intent && billingEnabled && !isSignedIn) openAuth(intent);
  }, [authLoading, billingEnabled, isSignedIn, openAuth]);
  const [showTopUp, setShowTopUp] = useState(false);
  // Free plan: "want the watermark off?" once per job, when the clips land.
  const [showWmNotice, setShowWmNotice] = useState(false);
  const wmNoticedJobRef = useRef(null);
  const [showPlanChoice, setShowPlanChoice] = useState(false);
  const [tutorialPhase, setTutorialPhase] = useState(null); // null | intro | coach | celebrate
  const [showTrialUpgrade, setShowTrialUpgrade] = useState(false);
  const [topUpInfo, setTopUpInfo] = useState({});
  // {processed_minutes, total_minutes} when the running/finished job clips
  // only the first part of the source (the quota wall's free offer).
  const [partialJob, setPartialJob] = useState(null);
  // The free plan's first video, clipped whole past the 20-minute balance.
  const [firstVideoJob, setFirstVideoJob] = useState(false);
  // {position, ahead, eta_seconds} while the job waits in line, else null.
  const [queueInfo, setQueueInfo] = useState(null);
  // Why the last job could not start or failed, in plain words (or '').
  const [jobError, setJobError] = useState('');
  // Durable R2 URLs (per clip index) for the current job — used as a fallback when
  // the ephemeral local /videos/ files have been cleaned up (e.g. after a reload).
  const [durableClips, setDurableClips] = useState({});

  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_key') || '');
  // ElevenLabs API State - Load encrypted
  const [elevenLabsKey, setElevenLabsKey] = useState(() => {
    const stored = localStorage.getItem('elevenLabsKey_v1');
    if (stored) return decrypt(stored);
    return '';
  });

  // fal.ai API State - Load encrypted
  const [falKey, setFalKey] = useState(() => {
    const stored = localStorage.getItem('falKey_v1');
    if (stored) return decrypt(stored);
    return '';
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, complete, error
  const [results, setResults] = useState(null);
  // Best clips first. The backend hands them back in transcript order, which
  // buries the strongest one wherever it happens to fall in the video — and
  // the first card is the one people actually watch and publish.
  //
  // The ORIGINAL array position travels with each clip and is what gets passed
  // down as `index`: it is the clip's identity everywhere else (clip_index on
  // /api/subtitle, /api/edit and publishing, the clip-N.mp4 download name, the
  // saved per-clip project state). Sorting the array itself would silently
  // repoint all of that at the wrong clip.
  const rankedClips = useMemo(() => {
    const clips = results?.clips;
    if (!Array.isArray(clips)) return [];
    return clips
      .map((clip, index) => ({ clip, index }))
      .sort((a, b) => {
        const sa = Number.isFinite(a.clip?.predicted_score) ? a.clip.predicted_score : -1;
        const sb = Number.isFinite(b.clip?.predicted_score) ? b.clip.predicted_score : -1;
        // Ties (and clips with no score at all) keep transcript order.
        return sb - sa || a.index - b.index;
      });
  }, [results]);
  // Bulk subtitles: apply one style to every clip of the job (triggered from
  // within a clip's subtitle modal via "apply to all").
  const [bulkSub, setBulkSub] = useState({ running: false, current: 0, total: 0, errors: 0 });
  const [downloadingAll, setDownloadingAll] = useState(false);
  // Pre-flight quality gate: { info: {max_height, min_height, cookies_invalid}, data }
  const [qualityGate, setQualityGate] = useState(null);
  const [logs, setLogs] = useState([]);
  // When each server log line arrived (epoch s, parallel to logs), from /api/status.
  const [logTimes, setLogTimes] = useState([]);
  // Collapsed on phones: the log tail is the least useful thing on a 360px
  // screen and it was pushing the actual clips a full scroll down.
  const [logsVisible, setLogsVisible] = useState(() => {
    try { return window.innerWidth >= 768; } catch { return true; }
  });
  const [processingMedia, setProcessingMedia] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, settings
  // Mobile only: the full nav lives in a drawer behind the header's menu button.
  const [navOpen, setNavOpen] = useState(false);
  // Reopened-project state (paid mode): per-clip {index, server_file, active_layers}
  // restored from the backend so ResultCards resume editing where they left off.
  const [projectState, setProjectState] = useState(null);
  // True when the current job was reopened from the library: its source video
  // was never persisted, so the session must not fall back to /api/source.
  const [noSource, setNoSource] = useState(false);

  const [sessionRecovered, setSessionRecovered] = useState(false);
  // Clip editor overlay: index of the clip being edited, or null.
  const [editingClip, setEditingClip] = useState(null);
  const [reframingClip, setReframingClip] = useState(null);

  // Silent-success "saved" states for the settings key inputs (design.md: no alert popups)
  const [elevenLabsSaved, setElevenLabsSaved] = useState(false);
  const [falSaved, setFalSaved] = useState(false);

  // Sync state for original video playback
  const [syncedTime, setSyncedTime] = useState(0);
  const [isSyncedPlaying, setIsSyncedPlaying] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);

  const handleClipPlay = (startTime) => {
    setSyncedTime(startTime);
    setIsSyncedPlaying(true);
    setSyncTrigger(prev => prev + 1);
  };

  const handleClipPause = () => {
    setIsSyncedPlaying(false);
  };

  // --- Project persistence (paid mode) ---
  // Debounced sync of each clip's browser-only edit state (Remotion layers +
  // current server file) to the backend, so a reopened project resumes intact.
  const clipStateSync = useRef({ jobId: null, pending: {}, files: {}, timer: null });
  // Read by in-flight async chases to notice that the user moved on to another job.
  const jobIdRef = useRef(jobId);
  useEffect(() => { jobIdRef.current = jobId; }, [jobId]);

  const flushClipState = () => {
    const s = clipStateSync.current;
    if (s.timer) { clearTimeout(s.timer); s.timer = null; }
    const entries = Object.entries(s.pending);
    if (!s.jobId || entries.length === 0) return;
    const clips = entries.map(([i, v]) => ({
      index: Number(i),
      active_layers: v.activeLayers,
      server_file: v.serverVideoFile,
    }));
    s.pending = {};
    apiFetch(`/api/projects/${s.jobId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clips }),
    }).catch(() => {});
  };

  // One /api/history read, reduced to this job's clips.
  const fetchDurableMap = async () => {
    const d = await apiJson('/api/history');
    const map = {};
    for (const v of (d.videos || [])) {
      if (v.job_id === jobId && v.clip_index != null) map[v.clip_index] = { url: v.view_url, filename: v.filename };
    }
    return map;
  };

  // A server-side edit rewrites the clip's file while the R2 re-archive behind it
  // is still in flight (_archive_clip_edit_bg is fire-and-forget), so the durable
  // map goes stale and the card falls back to streaming from the API. Re-read the
  // map on a backoff until the archived name matches the clip's new file, then it
  // can play from R2 again. Gives up quietly: staying on /videos is correct, just
  // slower, and is exactly what happens for self-hosted users all the time.
  const openUpsell = () => { setTopUpInfo({ context: 'upsell' }); setShowTopUp(true); };

  // The clips just landed on a free account: ask once, per job, whether they
  // want the mark off. A beat after the grid renders, so the first thing they
  // see is their clips and not a modal over them.
  useEffect(() => {
    if (status !== 'complete' || plan !== 'free' || !isManaged || !jobId) return;
    if (!(results?.clips?.length > 0)) return;
    if (wmNoticedJobRef.current === jobId || watermarkNoticeDismissed(jobId)) return;
    wmNoticedJobRef.current = jobId;
    const t = setTimeout(() => { if (jobIdRef.current === jobId) setShowWmNotice(true); }, 2500);
    return () => clearTimeout(t);
  }, [status, plan, isManaged, jobId, results?.clips?.length]);

  // Paying re-points the clips already on screen at their clean twins (the API
  // does it from the Stripe webhook, a few seconds after the plan flips). Chase
  // the job result until no served file carries the wm_ prefix, then refresh
  // the durable map so the players switch to the clean R2 copies too.
  useEffect(() => {
    if (!isManaged || !jobId || !plan || plan === 'free') return;
    const isMarked = (c) => /\/wm_[^/]*$/.test(c?.video_url || '');
    if (!(results?.clips || []).some(isMarked)) return;
    let cancelled = false;
    (async () => {
      for (const delay of [1500, 3000, 6000, 12000, 20000]) {
        await new Promise((r) => setTimeout(r, delay));
        if (cancelled || jobIdRef.current !== jobId) return;
        let data;
        try { data = await pollJob(jobId); } catch { continue; }
        if (cancelled || jobIdRef.current !== jobId) return;
        if (data?.result) setResults(data.result);
        if (!(data?.result?.clips || []).some(isMarked)) {
          fetchDurableMap().then((m) => { if (!cancelled) setDurableClips(m); }).catch(() => {});
          return;
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, isManaged, jobId]);

  const chaseDurableFile = async (index, expectedFile) => {
    const forJob = jobId;
    for (const delay of [2500, 6000, 15000, 30000]) {
      await new Promise((r) => setTimeout(r, delay));
      if (jobIdRef.current !== forJob) return;
      let map;
      try { map = await fetchDurableMap(); } catch { return; }
      // A new job started mid-chase: this map describes the old one, so dropping
      // it here keeps it from overwriting the new job's URLs.
      if (jobIdRef.current !== forJob) return;
      setDurableClips(map);
      if (map[index]?.filename === expectedFile) return;
    }
  };

  const handleClipStateChange = (index, state) => {
    if (!isManaged || !jobId) return;
    const s = clipStateSync.current;
    if (s.jobId !== jobId) { s.pending = {}; s.files = {}; s.jobId = jobId; }
    s.pending[index] = state;
    // Cards report on mount too, so only an actual change of server file means an
    // edit just landed. The first report per clip is the mount, never a chase.
    const files = s.files || (s.files = {});
    const file = state?.serverVideoFile;
    if (file && files[index] !== file) {
      const isMount = files[index] === undefined;
      files[index] = file;
      if (!isMount) chaseDurableFile(index, file);
    }
    if (s.timer) clearTimeout(s.timer);
    s.timer = setTimeout(flushClipState, 2000);
  };

  // A recut replaced the clip's server file with a fresh render (burned layers
  // reset), so update the results, the reopened-project state and the synced
  // per-clip edit state, and let the ResultCard remount from the new file.
  const handleClipRerendered = (index, data) => {
    const newFile = (data.new_video_url || '').split('/').pop();
    setResults((prev) => {
      if (!prev?.clips?.[index]) return prev;
      const clips = prev.clips.slice();
      clips[index] = {
        ...clips[index],
        video_url: data.new_video_url,
        start: data.start,
        end: data.end,
        recipe: data.recipe,
      };
      return { ...prev, clips };
    });
    setProjectState((prev) => {
      if (!prev?.clips) return prev;
      return {
        ...prev,
        clips: prev.clips.map((c) => (c.index === index
          ? { ...c, server_file: newFile, active_layers: null }
          : c)),
      };
    });
    // The old durable R2 object is deleted when the recut is archived, so the
    // stale URL would 404 as a fallback; drop it until the next refresh.
    setDurableClips((prev) => {
      if (!(index in prev)) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });
    handleClipStateChange(index, { activeLayers: null, serverVideoFile: newFile });
  };

  // Reopen an archived project from the History tab: the backend re-downloads
  // its files from R2 into the server's working dir and returns the full state.
  const restoreProject = async (projectJobId) => {
    const data = await apiJson(`/api/projects/${projectJobId}/restore`, { method: 'POST' });
    flushClipState();
    setProjectState(data.project_state || null);
    setNoSource(true);
    setJobId(data.job_id);
    setResults(data.result || null);
    setLogs(['♻️ Project restored from your library.']);
    setLogTimes([Date.now() / 1000]);
    setProcessingMedia(null);
    setQualityGate(null);
    setStatus('complete');
    setActiveTab('dashboard');
  };

  // Apply one subtitle style to every clip of the job, sequentially.
  const handleBulkSubtitles = async (options) => {
    const clips = results?.clips || [];
    const total = clips.length;
    if (!total) return;
    setBulkSub({ running: true, current: 0, total, errors: 0 });
    let errors = 0;
    for (let i = 0; i < total; i++) {
      setBulkSub({ running: true, current: i + 1, total, errors });
      try {
        const res = await apiFetch('/api/subtitle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_id: jobId,
            clip_index: i,
            position: options.position,
            font_size: options.fontSize,
            font_name: options.fontName,
            font_color: options.fontColor,
            border_color: options.borderColor,
            border_width: options.borderWidth,
            bg_color: options.bgColor,
            bg_opacity: options.bgOpacity,
            style: options.style || 'pill',
            highlight_color: options.highlightColor || '#FFD700',
            effect: options.effect || 'none',
            base_opacity: options.baseOpacity ?? 1.0,
            uppercase: options.uppercase || false,
            reveal: options.reveal || false,
            shadow: options.shadow || 0,
            max_chars: options.maxChars ?? null,
            max_duration: options.maxDuration ?? null,
            // Chain from the clip's current server file (its video_url basename).
            input_filename: (clips[i].video_url || '').split('/').pop(),
          }),
        });
        if (!res.ok) errors++;
      } catch {
        errors++;
      }
    }
    setBulkSub({ running: false, current: total, total, errors });
    refreshMe();
    // Refresh results so each ResultCard picks up its new subtitled video_url.
    try {
      const data = await pollJob(jobId);
      if (data.result) setResults(data.result);
    } catch { /* keep current results */ }
  };

  const handleDownloadAll = async () => {
    if (!jobId) return;
    setDownloadingAll(true);
    try {
      const res = await apiFetch(`/api/jobs/${jobId}/download-all`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creatorsplan_clips_${(jobId || '').slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloadingAll(false);
    }
  };

  // Session Recovery: Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) return;
      const session = JSON.parse(saved);
      if (Date.now() - session.timestamp > SESSION_MAX_AGE) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      if (session.jobId && session.status && session.status !== 'idle') {
        setJobId(session.jobId);
        setResults(session.results || null);
        // Restore the source preview. Older sessions (or uploads) saved no
        // media, so fall back to the backend-served source for this job —
        // except for reopened projects, whose source was never persisted.
        if (session.processingMedia) setProcessingMedia(session.processingMedia);
        else if (!session.noSource) setProcessingMedia({ type: 'server', payload: `/api/source/${session.jobId}` });
        if (session.noSource) setNoSource(true);
        if (session.projectState) setProjectState(session.projectState);
        if (session.activeTab) setActiveTab(session.activeTab);
        // If was processing, resume polling; if complete/error, just show results
        setStatus(session.status === 'processing' ? 'processing' : session.status);
        setSessionRecovered(true);
        setTimeout(() => setSessionRecovered(false), 5000);
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Session Recovery: Save state changes
  useEffect(() => {
    if (status === 'idle') {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    try {
      // URL (YouTube) media serializes as-is. Uploaded 'file' media is a blob
      // that can't be persisted, so point the recovered preview at the source
      // served by the backend instead of dropping it.
      let persistMedia = null;
      if (processingMedia?.type === 'url') persistMedia = processingMedia;
      else if (processingMedia && jobId) persistMedia = { type: 'server', payload: `/api/source/${jobId}` };
      const sessionData = {
        jobId,
        status,
        results,
        processingMedia: persistMedia,
        activeTab,
        noSource,
        projectState,
        timestamp: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {
      // localStorage full or serialization error - ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, status, results, activeTab, noSource, projectState]);

  useEffect(() => {
    // Encrypt Gemini Key too for consistency if desired, but user asked specifically about Social integration not saving well.
    // For now keeping gemini plain for compatibility unless requested.
    if (apiKey) localStorage.setItem('gemini_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (elevenLabsKey) {
      localStorage.setItem('elevenLabsKey_v1', encrypt(elevenLabsKey));
    }
  }, [elevenLabsKey]);

  useEffect(() => {
    if (falKey) {
      localStorage.setItem('falKey_v1', encrypt(falKey));
    }
  }, [falKey]);

  // For managed users, fetch the durable R2 URLs of the current job's clips. The
  // preview player prefers them (free egress, edge-served, and not competing with
  // the renders for the API process), and falls back to /videos when the local
  // file is newer than the archived one or the signed link fails.
  // Kept fresh by chaseDurableFile after each edit and by the completion chase
  // below; until either lands, the card just streams from /videos.
  useEffect(() => {
    if (!isManaged || !jobId || !(results?.clips?.length)) { setDurableClips({}); return; }
    let cancelled = false;
    fetchDurableMap()
      .then((map) => { if (!cancelled) setDurableClips(map); })
      .catch(() => {});
    return () => { cancelled = true; };
    // Keyed on the clip COUNT, not on results: the status poll hands back a new
    // results object every couple of seconds while the job runs, and this used to
    // re-read the history on every one of them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManaged, jobId, results?.clips?.length]);

  // A job is marked complete BEFORE _archive_managed_job has finished uploading
  // (app.py:878), so the read above can land while R2 still has nothing for it and
  // every card would stream from the API for the rest of the session. Chase until
  // all clips have a durable copy.
  useEffect(() => {
    const count = results?.clips?.length || 0;
    if (!isManaged || !jobId || status !== 'complete' || !count) return;
    let cancelled = false;
    (async () => {
      for (const delay of [0, 3000, 8000, 20000, 40000]) {
        if (delay) await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;
        let map;
        try { map = await fetchDurableMap(); } catch { return; }
        if (cancelled) return;
        setDurableClips(map);
        if (Object.keys(map).length >= count) return;
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManaged, jobId, status, results?.clips?.length]);

  useEffect(() => {
    let interval;
    if ((status === 'processing' || status === 'completed') && jobId) {
      interval = setInterval(async () => {
        try {
          const data = await pollJob(jobId);
          console.log("Job status:", data);

          // Update results if available (real-time)
          if (data.result) {
            setResults(data.result);
          }

          if (data.partial) setPartialJob(data.partial);
          setQueueInfo(data.status === 'queued' && data.queue ? data.queue : null);

          if (data.status === 'completed') {
            setQueueInfo(null);
            setStatus('complete');
            clearInterval(interval);
            refreshMe();
          } else if (data.status === 'failed') {
            setStatus('error');
            const errorMsg = data.error || (data.logs && data.logs.length > 0 ? data.logs[data.logs.length - 1] : "Process failed");
            setJobError(readableError(errorMsg));
            setLogs(prev => [...prev, "Error: " + errorMsg]);
            clearInterval(interval);
            refreshMe();
          } else {
            // Update logs if available
            if (data.logs) {
              setLogs(data.logs);
              setLogTimes(data.log_times || []);
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, jobId, refreshMe]);


  // Hosted is paid-only (no BYOK core). Self-host uses BYOK keys.
  // `keysMissing` now means "self-host BYOK keys missing" — it never fires on hosted.
  // A self-hosted server running the moment picker on a local LLM
  // (LLM_BASE_URL) does not need a Gemini key for the core pipeline.
  const geminiOk = !!apiKey || !!localLlm;
  const keysMissing = !billingEnabled && !geminiOk;
  const needsPlan = billingEnabled && !isManaged;   // hosted, signed-out or no active plan/trial

  // Fresh sign-up: Clip Generator tutorial (AuthContext set os_show_clip_tutorial
  // after the auth redirect). QA: #app?tutorial=1. Resume coach if they refreshed
  // mid-job. Runs once on mount so a later isSignedIn flip cannot reset intro→coach.
  useEffect(() => {
    let showTutorial = false;
    let resumeCoach = false;
    try {
      const q = new URLSearchParams((window.location.hash.split('?')[1] || ''));
      const qa = q.get('tutorial');
      if (qa === '1') showTutorial = true;
      if (qa === 'coach') resumeCoach = true;
      if (qa === 'celebrate') { setTutorialPhase('celebrate'); return; }
      if (localStorage.getItem('os_show_clip_tutorial') === '1') showTutorial = true;
      if (localStorage.getItem('os_clip_tutorial') === 'coach') resumeCoach = true;
      // A request parked before the sign-in redirect is about to resume on its
      // own: opening the intro ("paste a link and generate") on top of a job
      // that is already starting contradicts itself. Skip it for this signup.
      if (showTutorial && peekPendingJob()) {
        showTutorial = false;
        localStorage.removeItem('os_show_clip_tutorial');
      }
    } catch (_) { /* ignore */ }
    if (showTutorial) {
      setTutorialPhase('intro');
      setActiveTab('dashboard');
    } else if (resumeCoach) {
      setTutorialPhase('coach');
      setActiveTab('dashboard');
    }
  }, []);

  // Legacy: an older build may still have set os_show_plan_choice. Don't open it
  // on top of the tutorial.
  useEffect(() => {
    if (tutorialPhase) return;
    if (!(billingEnabled && isSignedIn)) return;
    let showPlans = false;
    try { showPlans = localStorage.getItem('os_show_plan_choice') === '1'; } catch (_) { /* ignore */ }
    if (showPlans) {
      setShowPlanChoice(true);
      try { localStorage.removeItem('os_show_plan_choice'); } catch (_) { /* ignore */ }
    }
  }, [billingEnabled, isSignedIn, tutorialPhase]);

  const tutorialLock = tutorialPhase === 'intro' || tutorialPhase === 'coach' || tutorialPhase === 'celebrate';

  // Sign-up survey (cloud/onboarding.py): before the tutorial intro, never on
  // top of a job that is already running (a parked request resuming, or the
  // coach phase) or of the celebration.
  const [surveyDone, setSurveyDone] = useState(false);
  const showSurvey = billingEnabled && !!me?.onboarding_survey_pending && !surveyDone
    && (tutorialPhase === null || tutorialPhase === 'intro') && status === 'idle';

  useEffect(() => {
    if (tutorialLock && activeTab !== 'dashboard') setActiveTab('dashboard');
  }, [tutorialLock, activeTab]);

  // Deep links into a tab: #app?tab=history (emails). Read once per hash
  // change, then the query is dropped so a reload does not keep forcing the tab.
  useEffect(() => {
    const DEEP_LINK_TABS = ['history', 'settings', 'thumbnails', 'dashboard'];
    const apply = () => {
      const hash = window.location.hash || '';
      if (!hash.startsWith('#app?')) return;
      const params = new URLSearchParams(hash.slice(5));
      const tab = params.get('tab');
      if (!tab || !DEEP_LINK_TABS.includes(tab)) return;  // e.g. #app?tutorial=1
      setActiveTab(tab);
      try { window.history.replaceState(null, '', '#app'); } catch (_) { /* ignore */ }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  useEffect(() => {
    if (tutorialPhase === 'coach' && status === 'complete' && (results?.clips?.length > 0)) {
      setTutorialPhase('celebrate');
      track('ClipTutorialCompleted', { props: { clips: results.clips.length } });
    }
  }, [tutorialPhase, status, results]);

  const finishTutorial = () => {
    try { localStorage.setItem('os_clip_tutorial', 'done'); } catch (_) { /* ignore */ }
    try { localStorage.removeItem('os_show_clip_tutorial'); } catch (_) { /* ignore */ }
    setTutorialPhase(null);
  };
  const startTutorial = () => {
    try { localStorage.setItem('os_clip_tutorial', 'coach'); } catch (_) { /* ignore */ }
    try { localStorage.removeItem('os_show_clip_tutorial'); } catch (_) { /* ignore */ }
    track('ClipTutorialStarted');
    setTutorialPhase('coach');
    setActiveTab('dashboard');
  };
  const skipTutorial = () => {
    track('ClipTutorialSkipped', { props: { phase: tutorialPhase } });
    finishTutorial();
  };
  // Included in the plan (fully managed, no keys): Clip Generator + YouTube Studio.
  // Advanced (bring your own fal.ai + ElevenLabs keys): AI Shorts + AI Agent.
  const INCLUDED_TOOL_TABS = ['dashboard', 'thumbnails'];
  const ADVANCED_TOOL_TABS = ['saasshorts', 'ai-agent'];
  const TOOL_NAMES = { dashboard: 'the Clip Generator', thumbnails: 'the YouTube Studio' };
  const gateThisTab = needsPlan && INCLUDED_TOOL_TABS.includes(activeTab);      // included tool, no plan yet
  const advancedThisTab = billingEnabled && ADVANCED_TOOL_TABS.includes(activeTab); // BYOK-notice tools

  const handleProcess = async (data, forceLowQuality = false) => {
    // Hosted: must be signed in AND on an active plan/trial. Self-host: BYOK keys.
    if (billingEnabled) {
      // The billing gate below is unchanged: signed in, then entitled, then the
      // processing path. The only new thing is the first branch remembering what
      // the visitor asked for before sending them to sign in, so the resume
      // effect can hand the exact same request back to this function and let it
      // fall through the same gates.
      if (!isSignedIn) { stashPendingJob(data); openAuth('signup'); return; }
      if (!isManaged) { window.location.hash = '#/pricing'; return; }
    } else if (keysMissing) {
      setShowKeyModal(true);
      return;
    }
    // Past every gate, so this request is really running: nothing left to resume.
    clearPendingJob();
    setStatus('processing');
    setJobError('');
    setLogs(["Starting process..."]);
    setLogTimes([Date.now() / 1000]);
    setResults(null);
    // Studio handovers have no local media object; the preview switches to the
    // backend-served source once the job id is known.
    setProcessingMedia(data.type === 'thumbnail_session' ? null : data);
    setQualityGate(null);
    setProjectState(null);
    setNoSource(false);
    setPartialJob(null);
    setFirstVideoJob(false);

    try {
      let body;
      // BYOK sends the Gemini header; managed users rely on the bearer token
      // that apiFetch attaches automatically.
      const headers = apiKey ? { 'X-Gemini-Key': apiKey } : {};

      // Advanced generation controls: only sent when the user set them, so the
      // default request stays byte-identical to the pre-feature one.
      const advanced = {
        target_clips: data.targetClips || null,
        clip_min_seconds: data.clipMinSeconds || null,
        clip_max_seconds: data.clipMaxSeconds || null,
        // Sent explicitly both ways: absent means off for raw API callers,
        // but the dashboard always states the user's choice.
        auto_hook: data.autoHook ? '1' : '0',
        auto_hook_style: data.autoHook ? (data.autoHookStyle || 'pill') : null,
        // 'auto' is the server default, so only a deliberate choice travels.
        layouts: data.layout && data.layout !== 'auto' ? data.layout : null,
        // Set when the user took the quota wall's "clip the first N minutes"
        // offer: the server reserves N minutes and cuts the source to them.
        max_minutes: data.maxMinutes || null,
      };

      if (data.type === 'url') {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          url: data.payload,
          acknowledged: !!data.acknowledged,
          output_format: data.outputFormat || 'auto',
          force_low_quality: forceLowQuality,
          ...Object.fromEntries(Object.entries(advanced).filter(([, v]) => v != null)),
        });
      } else if (data.type === 'thumbnail_session') {
        // Handover from Thumbnail Studio (issue #68): the video and transcript
        // already live server-side, keyed by the Studio session.
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          thumbnail_session_id: data.payload,
          acknowledged: !!data.acknowledged,
          output_format: data.outputFormat || 'auto',
          ...Object.fromEntries(Object.entries(advanced).filter(([, v]) => v != null)),
        });
      } else {
        const formData = new FormData();
        formData.append('file', data.payload);
        formData.append('acknowledged', data.acknowledged ? 'true' : 'false');
        formData.append('output_format', data.outputFormat || 'auto');
        for (const [k, v] of Object.entries(advanced)) {
          if (v != null) formData.append(k, v);
        }
        body = formData;
      }

      const res = await apiFetch('/api/process', { method: 'POST', headers, body });

      if (!res.ok) throw new Error(await res.text());
      const resData = await res.json();

      // Quality gate: the source is below the min resolution — ask before burning
      // 20 min on it. On confirm we resend with force_low_quality.
      if (resData.needs_confirmation) {
        setStatus('idle');
        setQualityGate({ info: resData.quality_check, data });
        return;
      }

      setJobId(resData.job_id);
      setPartialJob(resData.partial || null);
      setFirstVideoJob(!!resData.first_video);
      // The server clipped past the balance on its own (no wall): the first
      // video whole, or the first N minutes of a later one.
      if (resData.first_video) track('FirstVideoGrant');
      else if (resData.partial && data.maxMinutes == null) {
        track('AutoPartial', { props: { processed: resData.partial.processed_minutes, total: resData.partial.total_minutes } });
      }
      if (data.type === 'thumbnail_session') {
        setProcessingMedia({ type: 'server', payload: `/api/source/${resData.job_id}` });
      }
      // Minutes are reserved at job start, not at complete.
      refreshMe();

    } catch (e) {
      if (e instanceof QuotaError) {
        setStatus('idle');
        refreshMe();
        // Trial users hit the trial minute cap → prompt them to activate the plan
        // now (unlocks full minutes). Active users → offer a top-up.
        if (me?.status === 'trialing') {
          setShowTrialUpgrade(true);
        } else {
          // The wall can offer the first N minutes of this same submission on
          // the minutes they have: same data, plus max_minutes.
          const partial = e.partialMinutes || 0;
          setTopUpInfo({
            required: e.minutesRequired,
            remaining: e.minutesRemaining,
            partialMinutes: partial,
            onPartial: partial
              ? () => {
                  track('PartialClipChosen', { props: { required: e.minutesRequired, partial } });
                  setShowTopUp(false);
                  handleProcess({ ...data, maxMinutes: partial }, forceLowQuality);
                }
              : null,
          });
          setShowTopUp(true);
        }
        return;
      }
      const reason = readableError(e.message);
      setJobError(reason);
      setStatus('error');
      setLogs(l => [...l, `Error starting job: ${reason}`]);
    }
  };

  // Resume the job the visitor started before signing in. Runs on the render
  // that first sees isSignedIn true — after a magic link or a Google round trip,
  // i.e. a fresh document — and replays the request through handleProcess, so
  // the entitlement gate still decides whether it actually runs: an unentitled
  // account lands on #/pricing with the request still parked, and pays for it
  // later. `resumedStamp` keeps one parked request from being replayed twice in
  // the same document (the pricing redirect would otherwise loop on it).
  const handleProcessRef = useRef(null);
  const resumedStampRef = useRef(0);
  useEffect(() => {
    handleProcessRef.current = handleProcess;
  });
  useEffect(() => {
    if (!billingEnabled || !isSignedIn) return;
    const pending = peekPendingJob();
    if (!pending || pending.stamp === resumedStampRef.current) return;
    resumedStampRef.current = pending.stamp;
    track('JobResumedAfterSignin', { props: { type: pending.data?.type || 'unknown' } });
    handleProcessRef.current(pending.data);
  }, [billingEnabled, isSignedIn]);

  const handleReset = () => {
    // Flush any pending edit-state sync before dropping the project: the clips
    // themselves are already archived to R2 as they were edited.
    flushClipState();
    setStatus('idle');
    setJobId(null);
    setResults(null);
    setLogs([]);
    setLogTimes([]);
    setProcessingMedia(null);
    setProjectState(null);
    setNoSource(false);
    setPartialJob(null);
    setFirstVideoJob(false);
    setQueueInfo(null);
    setJobError('');
    localStorage.removeItem(SESSION_KEY);
  };

  // --- UI Components ---

  // One nav definition drives all three surfaces: the desktop rail, the mobile
  // drawer, and the bottom tab bar. `short` is the tab-bar label — the full one
  // wraps to two lines in a 5-up bar on a 360px phone.
  const navItems = [
    { id: 'dashboard', group: 'create', icon: Clapperboard, label: 'Clip generator', short: 'clips', primary: true },
    { id: 'saasshorts', group: 'create', icon: SquareUser, label: 'AI shorts', short: 'ai shorts', byok: true, primary: true },
    { id: 'thumbnails', group: 'create', icon: Youtube, label: 'YouTube studio', short: 'studio', primary: true },
    { id: 'ugc-gallery', group: 'library', icon: LayoutDashboard, label: 'Gallery', short: 'gallery', primary: true },
    { id: 'ai-agent', group: 'library', icon: Bot, label: 'Agents', short: 'agents', byok: true },
    ...(billingEnabled && isSignedIn ? [{ id: 'history', group: 'library', icon: History, label: 'History', short: 'history' }] : []),
    { id: 'settings', group: 'footer', icon: SlidersHorizontal, label: 'Settings', short: 'settings' },
  ];
  const NAV_GROUPS = [{ id: 'create', label: 'CREATE' }, { id: 'library', label: 'LIBRARY' }];
  const settingsNav = navItems.find((n) => n.id === 'settings');
  const activeNav = navItems.find((n) => n.id === activeTab);

  // Escape closes the mobile drawer. The shell itself is overflow-hidden, so
  // there is no body scroll to lock behind it.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const goToTab = (id) => {
    if (tutorialLock && id !== 'dashboard') return;
    setActiveTab(id);
    setNavOpen(false);
  };
  const tabLocked = (id) => tutorialLock && id !== 'dashboard';

  // The plan card does what the header's minutes meter did: free accounts get
  // the upgrade modal, paid ones the account page.
  const openPlan = () => {
    if (plan === 'free') { setTopUpInfo({ context: 'upsell' }); setShowTopUp(true); }
    else { window.location.hash = '#/account'; }
  };

  // One nav row, shared by the desktop rail and the mobile drawer. `rail`
  // hides the label and meta at md (icon-only rail) and shows them from lg.
  const NavRow = ({ item, rail = false, trailing = null }) => {
    const NavIcon = item.icon;
    const isActive = activeTab === item.id;
    const locked = tabLocked(item.id);
    const label = rail ? 'hidden lg:block' : '';
    return (
      <button
        data-tutorial={rail && item.id === 'dashboard' ? 'nav-clips' : undefined}
        onClick={() => goToTab(item.id)}
        title={locked ? 'Finish your first clips to unlock' : (rail ? item.label : undefined)}
        disabled={locked}
        aria-current={isActive ? 'page' : undefined}
        className={`cp-nav-item ${rail ? 'justify-center lg:justify-start' : ''}`}
      >
        <NavIcon size={18} strokeWidth={1.8} className="cp-nav-icon" />
        <span className={`${label} flex-1 truncate`}>{item.label}</span>
        {locked
          ? <Lock size={12} className={`shrink-0 ${label}`} />
          : item.byok ? <span className={`cp-nav-meta ${label}`}>BYOK</span>
            : item.isNew ? <span className={`cp-nav-meta ${label}`}>NEW</span> : null}
        {trailing}
      </button>
    );
  };

  // Logo, CREATE / LIBRARY groups, then the plan card, pricing and Settings
  // pinned to the bottom. Shared by the desktop rail and the mobile drawer.
  const NavBody = ({ rail = false }) => (
    <>
      <nav className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        {NAV_GROUPS.map((g) => (
          <div key={g.id} className="flex flex-col gap-0.5">
            <p className={`px-3 pb-2 font-cp-mono text-[11px] font-medium tracking-[0.08em] text-cp-ink-3 ${rail ? 'hidden lg:block' : ''}`}>{g.label}</p>
            {navItems.filter((n) => n.group === g.id).map((item) => <NavRow key={item.id} item={item} rail={rail} />)}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-3 pt-4">
        {billingEnabled && isManaged && <div className={rail ? 'hidden lg:block' : ''}><PlanCard onClick={openPlan} /></div>}
        {billingEnabled && !isManaged && (
          <a
            href="#/pricing"
            className={`px-3 text-sm text-cp-ink-2 underline underline-offset-[3px] hover:text-cp-ink transition-colors ${rail ? 'hidden lg:block' : ''}`}
          >
            Plans and pricing
          </a>
        )}
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0"><NavRow item={settingsNav} rail={rail} /></div>
          {billingEnabled && isSignedIn && <div className={rail ? 'hidden lg:block' : ''}><ProfileMenu placement="up" /></div>}
        </div>
      </div>
    </>
  );

  // Desktop rail: icon-only from md, 248px and labelled from lg. Below md it
  // is gone entirely — an unlabelled 80px rail ate a fifth of a phone screen.
  const Sidebar = () => (
    <aside className="hidden md:flex w-20 lg:w-[248px] bg-cp-paper border-r border-cp-line flex-col h-full shrink-0 px-3.5 py-6">
      <div className="flex items-center justify-center lg:justify-start gap-[7px] px-3 pb-7">
        <ShortFrameLogo width={15} height={25} className="shrink-0" />
        <span className="font-display font-bold text-[19px] tracking-[-0.042em] text-cp-ink hidden lg:block">creatorsplan</span>
      </div>
      <NavBody rail />
    </aside>
  );

  // Mobile drawer: the complete nav, reachable from the header's menu button.
  const MobileNavDrawer = () => (
    <div
      className="md:hidden fixed inset-0 z-[90] flex"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
    >
      <div
        className="absolute inset-0 bg-ink/40 animate-fade"
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-[17rem] max-w-[82vw] h-full bg-cp-paper border-r border-cp-line flex flex-col px-3.5 pt-3 pb-4 safe-bottom animate-slide-in-left">
        <div className="flex items-center justify-between px-3 h-12 mb-4 shrink-0">
          <div className="flex items-center gap-[7px]">
            <ShortFrameLogo width={15} height={25} className="shrink-0" />
            <span className="font-display font-bold text-[19px] tracking-[-0.042em] text-cp-ink">creatorsplan</span>
          </div>
          <button
            onClick={() => setNavOpen(false)}
            aria-label="close navigation"
            className="p-2 -mr-2 text-cp-ink-2 hover:text-cp-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <NavBody />
      </div>
    </div>
  );

  // Bottom tab bar: the four everyday destinations plus "more" for the rest.
  // It is a flex sibling of the scrolling pane rather than `fixed`, so nothing
  // ever hides behind it and no pane needs compensating padding.
  const MobileTabBar = () => {
    const tabs = navItems.filter((n) => n.primary);
    const moreActive = !tabs.some((t) => t.id === activeTab);
    return (
      <nav className="md:hidden shrink-0 border-t border-rule bg-paper2/95 backdrop-blur-sm safe-bottom">
        <div className="flex items-stretch">
          {tabs.map((item) => {
            const NavIcon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-tutorial={item.id === 'dashboard' ? 'nav-clips' : undefined}
                onClick={() => goToTab(item.id)}
                disabled={tabLocked(item.id)}
                aria-current={isActive ? 'page' : undefined}
                title={tabLocked(item.id) ? 'Finish your first clips to unlock' : undefined}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${isActive ? 'text-ink' : 'text-muted active:text-ink2'} ${tabLocked(item.id) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <NavIcon size={19} className={isActive ? 'text-brass' : ''} />
                <span className="text-[10.5px] leading-none truncate max-w-full px-0.5">{item.short}</span>
              </button>
            );
          })}
          <button
            onClick={() => setNavOpen(true)}
            aria-label="more sections"
            aria-expanded={navOpen}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${moreActive ? 'text-ink' : 'text-muted active:text-ink2'}`}
          >
            <Menu size={19} className={moreActive ? 'text-brass' : ''} />
            <span className="text-[10.5px] leading-none">More</span>
          </button>
        </div>
      </nav>
    );
  };

  return (
    /* h-dvh where supported: on mobile Safari/Chrome `100vh` is the tallest the
       viewport ever gets, so a h-screen shell hides its own bottom bar behind
       the browser chrome until the user scrolls. */
    <div className="flex h-screen supports-[height:100dvh]:h-[100dvh] bg-cp-canvas overflow-hidden">
      <Sidebar />
      {navOpen && <MobileNavDrawer />}

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 border-b border-cp-line md:border-transparent bg-cp-canvas flex items-center justify-between gap-2 px-3 sm:px-6 md:px-10 shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile: the drawer handle, and the section name the icon rail
                used to carry. Without it a phone has no "where am I". */}
            <button
              onClick={() => setNavOpen(true)}
              aria-label="open navigation"
              className="md:hidden -ml-1 p-2 rounded-cp-input text-cp-ink active:bg-cp-tint transition-colors shrink-0"
            >
              <Menu size={20} />
            </button>
            <span data-tutorial="nav-clips" className="md:hidden text-base font-semibold text-cp-ink truncate">
              {activeNav?.label || 'creatorsplan'}
            </span>
            {status !== 'idle' && (
              <button
                onClick={handleReset}
                className="btn-quiet px-3 py-1.5 text-xs shrink-0"
                aria-label="New project"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New project</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {billingEnabled && isSignedIn && !isManaged && (
              <button onClick={() => setShowPlanChoice(true)}
                className="btn-primary px-4 py-2 text-xs">
                Choose a plan
              </button>
            )}
            {billingEnabled && !isSignedIn && (
              <div className="flex items-center gap-2">
                <button onClick={() => openAuth('login')}
                  className="btn-ghost min-h-[36px] px-4 py-2 text-xs">
                  Log in
                </button>
                <button onClick={() => openAuth('signup')}
                  className="btn-quiet min-h-[36px] px-4 py-2 text-xs">
                  Sign up
                </button>
              </div>
            )}
            {/* The rail carries the avatar from lg; the icon-only rail and
                phones keep it up here. */}
            {billingEnabled && isSignedIn && <div className="lg:hidden"><ProfileMenu /></div>}

            {/* Hidden below sm: the standing banner underneath already says the
                same thing, and two warnings in a 360px header is just noise. */}
            {keysMissing && (
              <button
                onClick={() => (billingEnabled && !isSignedIn ? openAuth() : goToTab('settings'))}
                className="badge-warn hover:brightness-125 transition-all hidden sm:inline-flex"
                title="Configure API keys or choose a plan"
              >
                <AlertTriangle size={12} />
                <span className="hidden md:inline">Gemini API key missing</span>
                <span className="md:hidden">Keys missing</span>
              </button>
            )}
          </div>
        </header>

        {/* Persistent Missing Keys Banner — visible on every screen */}
        {keysMissing && activeTab !== 'settings' && (
          <div className="mx-3 sm:mx-6 md:mx-10 xl:mx-auto xl:w-[880px] mt-3 px-3.5 sm:px-4 py-3 bg-paper2 border border-rule rounded-card flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 shrink-0 animate-fade">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-sm text-ink2 min-w-0 flex-1">
              <KeyRound size={16} className="shrink-0 text-warn mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <span className="font-medium text-ink">Your Gemini API key is missing.</span>{' '}
                <span className="text-muted">Set it to use creatorsplan.</span>
              </div>
            </div>
            <button
              onClick={() => goToTab('settings')}
              className="btn-quiet px-3 py-1.5 text-xs shrink-0 w-full sm:w-auto"
            >
              Go to settings
            </button>
          </div>
        )}

        {/* Session Recovery Banner */}
        {sessionRecovered && (
          <div className="mx-3 sm:mx-6 md:mx-10 xl:mx-auto xl:w-[880px] mt-2 px-3.5 sm:px-4 py-3 bg-paper2 border border-rule rounded-card flex items-start justify-between gap-3 animate-fade shrink-0">
            <div className="flex items-start sm:items-center gap-2 text-sm text-ink2 flex-wrap min-w-0">
              <RotateCcw size={16} className="text-brass shrink-0 mt-0.5 sm:mt-0" />
              <span className="font-medium">Session recovered</span>
              <span className="text-muted text-xs">Your previous work is back.</span>
            </div>
            <button
              onClick={() => setSessionRecovered(false)}
              aria-label="dismiss"
              className="text-muted hover:text-ink transition-colors shrink-0 -m-1 p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Included tools (Clip Generator, YouTube Studio): non-blocking trial prompt. */}
        {gateThisTab && <TrialGate toolName={TOOL_NAMES[activeTab] || 'this'} onSignUp={isSignedIn ? null : () => openAuth('signup')} />}

        {/* Advanced tools (AI Shorts, AI Agent): BYOK fal.ai + ElevenLabs notice. */}
        {advancedThisTab && <AdvancedBanner needsPlan={needsPlan} onKeys={() => goToTab('settings')} />}

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden relative">

          {/* View: Settings */}
          {activeTab === 'settings' && (
            <Screen>
              <ScreenHeader
                eyebrow="06 · SETTINGS"
                title="Settings"
                subtitle="Your plan and your keys."
              >
                <p className="flex items-center gap-2 text-sm text-cp-ink-2">
                  <Shield size={14} className="text-cp-go shrink-0" /> Keys only live in your browser. They're sent to the backend just to process a job.
                </p>
              </ScreenHeader>

              {/* Gemini key first: optional with a plan (ours is used when empty),
                  required when the server has no accounts or local LLM. */}
              <SettingsSection
                title="Gemini key"
                description={billingEnabled
                  ? 'Optional. Add your own and Gemini calls bill your Google account instead of ours.'
                  : 'The clip generator and YouTube studio run on Gemini.'}
              >
                <div className="space-y-6">
                  <KeyInput onKeySet={setApiKey} savedKey={apiKey} />
                  {billingEnabled && !apiKey && (
                    <p className="cp-help">Nothing to add? Your plan already covers the clip generator and YouTube studio.</p>
                  )}
                </div>
              </SettingsSection>

              <SettingsSection
                title={billingEnabled ? 'Your plan' : 'Core keys'}
                description={billingEnabled
                  ? 'Clip generator and YouTube studio run on our keys. Nothing to set up.'
                  : 'The clip generator and YouTube studio run on Gemini.'}
              >
                {isManaged ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-semibold text-cp-ink">Included in your plan</p>
                      <span className="badge-ok">managed</span>
                    </div>
                    <p className="cp-help">
                      Your plan covers the clip generator and YouTube studio, fully managed: no API keys needed.
                      AI shorts and dubbing use your own fal.ai and ElevenLabs keys (below).
                    </p>
                  </div>
                ) : billingEnabled ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-semibold text-cp-ink">Choose your plan</p>
                      <span className="badge-ok">free plan available</span>
                    </div>
                    <p className="cp-help">
                      Make shorts with zero setup and no API keys. Start free with 20 min a month, or go paid from $12/mo. Cancel anytime.
                    </p>
                    <button onClick={() => setShowPlanChoice(true)} className="btn-quiet px-5">
                      Choose a plan
                    </button>
                  </div>
                ) : null}
              </SettingsSection>

              <SettingsSection
                title="Your keys"
                description="AI shorts and dubbing run on your own accounts. We never mark up usage."
              >
                <div className="rounded-cp-select border border-cp-line bg-cp-field divide-y divide-cp-line">
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="fal-key" className="cp-label">fal.ai</label>
                      <span className="readout">AI shorts · ~$0.65-2 / video</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="fal-key"
                        type="password"
                        value={falKey}
                        onChange={(e) => setFalKey(e.target.value)}
                        className="input-field font-cp-mono"
                        placeholder="fal_..."
                      />
                      <button
                        onClick={() => {
                          if (falKey) {
                            localStorage.setItem('falKey_v1', encrypt(falKey));
                            setFalSaved(true);
                            setTimeout(() => setFalSaved(false), 2000);
                          }
                        }}
                        className={falSaved ? 'badge-ok px-4 self-center' : 'btn-ghost px-5 shrink-0'}
                      >
                        {falSaved ? <><Check size={12} /> Saved</> : (falKey ? 'Save key' : 'Add key')}
                      </button>
                    </div>
                    <p className="cp-help">
                      AI presenter videos. Billed by fal.ai, not covered by your plan.{' '}
                      <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" className="text-cp-ink underline underline-offset-[3px]">Get a key</a>
                    </p>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="elevenlabs-key" className="cp-label">ElevenLabs</label>
                      <span className="readout">voices · dubbing</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="elevenlabs-key"
                        type="password"
                        value={elevenLabsKey}
                        onChange={(e) => setElevenLabsKey(e.target.value)}
                        className="input-field font-cp-mono"
                        placeholder="sk_..."
                      />
                      <button
                        onClick={() => {
                          if (elevenLabsKey) {
                            localStorage.setItem('elevenLabsKey_v1', encrypt(elevenLabsKey));
                            setElevenLabsSaved(true);
                            setTimeout(() => setElevenLabsSaved(false), 2000);
                          }
                        }}
                        className={elevenLabsSaved ? 'badge-ok px-4 self-center' : 'btn-ghost px-5 shrink-0'}
                      >
                        {elevenLabsSaved ? <><Check size={12} /> Saved</> : (elevenLabsKey ? 'Save key' : 'Add key')}
                      </button>
                    </div>
                    <p className="cp-help">
                      Presenter voices and translating your clips into other languages. Billed by ElevenLabs.{' '}
                      <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-cp-ink underline underline-offset-[3px]">Get a key</a>
                    </p>
                  </div>
                </div>
              </SettingsSection>
            </Screen>
          )}

          {/* View: SaaS Shorts */}
          {activeTab === 'saasshorts' && (
            <SaaShortsTab geminiApiKey={apiKey} elevenLabsKey={elevenLabsKey} falKey={falKey} managed={isManaged} />
          )}

          {/* View: AI Agent */}
          {activeTab === 'ai-agent' && (
            <Screen>
              <div className="space-y-8">
                <ScreenHeader
                  eyebrow="05 · AGENTS · BYOK"
                  title="Let an agent do the busywork"
                  subtitle="Connect the assistant you already use. It can clip videos, add captions and write titles with your keys."
                />

                <McpConnectCard cloud={billingEnabled} />

                <h2 className="cp-h2 pt-2">Or run a clipping skill on a folder</h2>

                {/* Mobile-format warning */}
                <div className="px-5 py-4 rounded-cp-select border border-cp-line bg-cp-paper flex items-start gap-3">
                  <Smartphone size={18} className="text-cp-ink shrink-0 mt-0.5" />
                  <div className="text-sm text-ink2">
                    <p className="font-medium text-ink mb-1">Upload videos that are already vertical (9:16).</p>
                    <p className="text-muted leading-relaxed">
                      The agent does not reframe horizontal footage. Make sure every source video is shot or pre-cropped to mobile/portrait format before dropping it into the input folder.
                    </p>
                  </div>
                </div>

                {/* Workflow */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="card p-5 space-y-2">
                    <div className="w-11 h-11 rounded-cp-input bg-cp-tint flex items-center justify-center">
                      <Upload size={18} className="text-brass" />
                    </div>
                    <h3 className="text-[17px] font-semibold text-cp-ink">1. Drop your videos</h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Put your long-form vertical footage in the watched folder. The skill picks one video per run.
                    </p>
                  </div>

                  <div className="card p-5 space-y-2">
                    <div className="w-11 h-11 rounded-cp-input bg-cp-tint flex items-center justify-center">
                      <Users size={18} className="text-brass" />
                    </div>
                    <h3 className="text-[17px] font-semibold text-cp-ink">2. The clippers get to work</h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Whisper transcribes, Gemini 3 Flash picks the moments worth posting, FFmpeg cuts each clip and adds a hook overlay.
                    </p>
                  </div>

                  <div className="card p-5 space-y-2">
                    <div className="w-11 h-11 rounded-cp-input bg-cp-tint flex items-center justify-center">
                      <CheckCircle2 size={18} className="text-brass" />
                    </div>
                    <h3 className="text-[17px] font-semibold text-cp-ink">3. You pick the keepers</h3>
                    <p className="text-xs text-muted leading-relaxed">
                      Approve the candidates you like and download them, ready for TikTok, Reels and YouTube Shorts.
                    </p>
                  </div>
                </div>

                {/* Repo CTA */}
                <div className="card p-6 md:p-8 space-y-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-lg font-semibold text-cp-ink mb-1 font-cp-mono">skill-autoshorts</h2>
                      <p className="text-sm text-muted">
                        The Claude Code skill that powers this workflow. Install it once and trigger it whenever you want a fresh batch of clips.
                      </p>
                    </div>
                    <a
                      href="https://github.com/mutonby/skill-autoshorts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-quiet px-5 shrink-0"
                    >
                      View on GitHub <ExternalLink size={14} />
                    </a>
                  </div>

                  <div className="bg-cp-field border border-cp-line-strong rounded-cp-input px-4 h-12 font-cp-mono text-[13px] text-cp-ink flex items-center justify-between gap-3">
                    <span className="truncate">git clone https://github.com/mutonby/skill-autoshorts</span>
                    <button
                      onClick={() => navigator.clipboard.writeText('git clone https://github.com/mutonby/skill-autoshorts')}
                      className="text-muted hover:text-ink transition-colors shrink-0"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2 text-ink2">
                      <Check size={16} className="text-brass shrink-0 mt-0.5" />
                      <span>Daily batch: picks one long video per run</span>
                    </div>
                    <div className="flex items-start gap-2 text-ink2">
                      <Check size={16} className="text-brass shrink-0 mt-0.5" />
                      <span>Whisper transcription with word-level timing</span>
                    </div>
                    <div className="flex items-start gap-2 text-ink2">
                      <Check size={16} className="text-brass shrink-0 mt-0.5" />
                      <span>Gemini 3 Flash finds the moments worth posting</span>
                    </div>
                    <div className="flex items-start gap-2 text-ink2">
                      <Check size={16} className="text-brass shrink-0 mt-0.5" />
                      <span>Vertical clips ready for TikTok, Reels and YouTube Shorts</span>
                    </div>
                  </div>
                </div>

              </div>
            </Screen>
          )}

          {/* View: UGC Gallery */}
          {activeTab === 'ugc-gallery' && (
            <Screen>
              <UGCGallery />
            </Screen>
          )}

          {/* View: History */}
          {activeTab === 'history' && (
            <Screen>
              <HistoryTab onReopenProject={restoreProject} />
            </Screen>
          )}

          {activeTab === 'thumbnails' && (
            <ThumbnailStudio
              geminiApiKey={apiKey}
              managed={isManaged}
              onCreateClips={(sessionId) => {
                setActiveTab('dashboard');
                // The Studio source is the user's own upload, published to their
                // own channel; the handover carries that same attestation.
                handleProcess({ type: 'thumbnail_session', payload: sessionId, acknowledged: true });
              }}
            />
          )}

          {/* View: Gallery */}
          {/* {activeTab === 'gallery' && (
            <Gallery />
          )} */}

          {/* View: Dashboard (Idle) */}
          {activeTab === 'dashboard' && status === 'idle' && (
            <Screen>
              <ScreenHeader
                eyebrow="01 · CLIP GENERATOR"
                title="Turn long videos into shorts"
                subtitle="Drop in a long video. We'll find the moments worth posting, reframe them and add captions."
              >
                {/* The same pipeline is an MCP server: point people at the
                    one place that explains how to drive it from an agent. */}
                {!tutorialLock && (
                  <p className="text-sm text-cp-ink-2">
                    Prefer to automate it?{' '}
                    <a
                      href={billingEnabled ? '#/account' : '#app'}
                      onClick={(e) => { if (!billingEnabled) { e.preventDefault(); goToTab('settings'); } }}
                      className="text-cp-ink underline underline-offset-[3px]"
                    >
                      Connect Claude, ChatGPT or n8n →
                    </a>
                  </p>
                )}
              </ScreenHeader>

              <MediaInput onProcess={handleProcess} isProcessing={status === 'processing'} />

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-cp-ink-2 text-xs sm:text-sm">
                <span className="flex items-center gap-2"><Youtube size={16} /> YouTube</span>
                <span className="flex items-center gap-2"><Instagram size={16} /> Instagram</span>
                <span className="flex items-center gap-2"><TikTokIcon size={16} /> TikTok</span>
              </div>
            </Screen>
          )}

          {/* View: Processing / Results (Split View) */}
          {activeTab === 'dashboard' && (status === 'processing' || status === 'complete' || status === 'error') && (
            <div className="h-full flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 overflow-y-auto md:overflow-y-hidden custom-scrollbar animate-fade">

              {/* Left Panel: Preview & Status */}
              <div className={`${status === 'complete' ? 'w-full md:w-[30%] lg:w-[25%]' : 'w-full md:w-[55%] lg:w-[60%]'} md:h-full flex flex-col shrink-0 md:shrink card p-3.5 sm:p-6 md:overflow-y-auto custom-scrollbar transition-all duration-700 ease-in-out`}>
                <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
                  <h2 className="cp-h2 flex items-center gap-2">
                    {status === 'processing' && <Loader2 className="animate-spin text-cp-ink-2" size={18} />}
                    {status === 'processing' ? 'Working on your video' : status === 'complete' ? 'Your video' : 'Something went wrong'}
                  </h2>
                  <span className={status === 'processing' ? 'badge-brass' :
                    status === 'complete' ? 'badge-ok' :
                      'badge-danger'
                    }>
                    {status.toUpperCase()}
                  </span>
                </div>

                {/* Waiting in line: say where and for how long, and that paid
                    plans go first (they do: plan priority in the job queue). */}
                {status === 'processing' && queueInfo && (
                  <div className="mb-4 rounded-card border border-brass/40 bg-brass/5 px-4 py-3 text-sm">
                    <p className="text-ink">
                      {queueInfo.ahead === 0
                        ? 'You are next in line. Starting in a moment…'
                        : <>You are <b>#{queueInfo.position}</b> in line · about <b>{Math.max(1, Math.round(queueInfo.eta_seconds / 60))} min</b></>}
                    </p>
                    {billingEnabled && !['starter', 'creator', 'pro'].includes(plan) && queueInfo.ahead > 0 && (
                      <button
                        onClick={() => { track('QueueUpsellClick', { props: { position: String(queueInfo.position) } }); setShowPlanChoice(true); }}
                        className="mt-2 text-xs text-brass hover:underline"
                      >
                        Paid plans skip the line →
                      </button>
                    )}
                  </div>
                )}

                {/* Video Preview */}
                {processingMedia && (
                  <ProcessingAnimation
                    media={processingMedia}
                    isComplete={status === 'complete'}
                    syncedTime={syncedTime}
                    isSyncedPlaying={isSyncedPlaying}
                    syncTrigger={syncTrigger}
                  />
                )}

                {/* Phones only. The scan box drops its invented telemetry at
                    this size and the log terminal below starts collapsed, so
                    without this the screen would say nothing about what the job
                    is actually doing. The log tail is the real answer. */}
                {status === 'processing' && (
                  <div className="sm:hidden mb-3 flex items-start gap-2 text-xs text-ink2 min-w-0">
                    <Loader2 size={14} className="animate-spin text-brass shrink-0 mt-px" />
                    <span className="min-w-0 leading-snug break-words">
                      {logs.length ? logs[logs.length - 1] : 'starting up…'}
                    </span>
                  </div>
                )}

                {/* Logs Terminal */}
                <div className={`bg-paper rounded-card border border-rule overflow-hidden flex flex-col transition-all duration-500 ${status === 'complete' ? `min-h-0 opacity-50 hover:opacity-100 ${logsVisible ? 'h-32' : 'h-auto'}` : `flex-1 ${logsVisible ? 'min-h-[160px] sm:min-h-[200px]' : 'min-h-0 flex-none'}`}`}>
                  <button
                    type="button"
                    onClick={() => setLogsVisible(!logsVisible)}
                    aria-expanded={logsVisible}
                    className="w-full px-3.5 sm:px-4 py-2.5 border-b border-rule flex items-center justify-between gap-2 bg-paper2 shrink-0 text-left"
                  >
                    <span className="readout flex items-center gap-2">
                      <Terminal size={12} /> System Logs
                    </span>
                    <span className="flex items-center gap-2 text-muted">
                      {!logsVisible && logs.length > 0 && (
                        <span className="readout normal-case">{logs.length}</span>
                      )}
                      {logs.length > 0 && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(logs.join('\n'));
                          }}
                          title="Copy logs"
                          className="hover:text-ink transition-colors"
                        >
                          <Copy size={14} />
                        </span>
                      )}
                      <ChevronDown size={16} className={logsVisible ? '' : 'rotate-180'} />
                    </span>
                  </button>
                  {logsVisible && (
                    <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto font-mono text-[11px] sm:text-xs space-y-1.5 custom-scrollbar text-muted break-words">
                      {logs.map((log, i) => (
                        <div key={i} className={`flex gap-2 ${log.toLowerCase().includes('error') ? 'text-danger' : 'text-muted'}`}>
                          <span className="text-muted opacity-50 shrink-0 hidden sm:inline tabular-nums">
                            {logTimes[i] ? new Date(logTimes[i] * 1000).toLocaleTimeString() : ''}
                          </span>
                          <span className="min-w-0 break-words">{log}</span>
                        </div>
                      ))}
                      {status === 'processing' && (
                        <div className="animate-pulse text-brass">_</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Results Grid */}
              <div className={`${status === 'complete' ? 'w-full md:w-[70%] lg:w-[75%]' : 'w-full md:w-[45%] lg:w-[40%]'} md:h-full flex flex-col shrink-0 md:shrink card p-3.5 sm:p-6 transition-all duration-700 ease-in-out`}>
                {/* Title + counters on one row, the actions on their own row below. */}
                <div className="mb-4 sm:mb-6 shrink-0 space-y-3">
                  <h2 className="cp-h2 flex flex-wrap items-center gap-2">
                    <span className="mr-auto">
                      {results?.clips?.length > 0
                        ? `${results.clips.length} ${results.clips.length === 1 ? 'clip' : 'clips'} worth posting`
                        : 'Your clips'}
                    </span>
                    {results?.cost_analysis && !isManaged && (
                      <span className="readout bg-paper3 px-2.5 py-1 rounded-full" title={`Input: ${results.cost_analysis.input_tokens} | Output: ${results.cost_analysis.output_tokens}`}>
                        GEMINI · ${results.cost_analysis.total_cost.toFixed(5)}
                      </span>
                    )}
                  </h2>
                  {results?.clips?.length > 0 && status === 'complete' && (
                    <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center gap-2">
                      <button
                        onClick={handleDownloadAll}
                        disabled={downloadingAll}
                        className="btn-primary px-4 py-2 text-xs"
                        title="Download all clips as a ZIP"
                      >
                        {downloadingAll
                          ? <><Loader2 size={14} className="animate-spin" />Zipping…</>
                          : <><Download size={14} />Download all</>}
                      </button>
                    </div>
                  )}
                </div>

                {status === 'complete' && results?.clips?.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {/* Partial job: the clips on screen come from the first N
                        minutes only. Say so, and sell the rest of the video. */}
                    {partialJob && (
                      <button
                        onClick={() => { setTopUpInfo({ context: 'upsell' }); setShowTopUp(true); }}
                        className="w-full text-left px-3 py-2.5 rounded-input bg-paper3 border border-brass/40 hover:border-brass text-sm transition-colors"
                      >
                        <span className="text-ink">These clips come from the first {partialJob.processed_minutes} of {partialJob.total_minutes} minutes.</span>{' '}
                        <span className="text-brass font-medium">Clip the whole video →</span>
                      </button>
                    )}
                    {/* Peak-moment upsell: they just SAW their clips — sell while
                        they're proud of the result, before asking for stars. */}
                    {firstVideoJob && !partialJob && (
                      <button
                        onClick={() => { setTopUpInfo({ context: 'upsell' }); setShowTopUp(true); }}
                        className="w-full text-left px-3 py-2.5 rounded-input bg-paper3 border border-brass/40 hover:border-brass text-sm transition-colors"
                      >
                        <span className="text-ink">Your first video is on us: we clipped all of it.</span>{' '}
                        <span className="text-muted">That used this month's free minutes.</span>{' '}
                        <span className="text-brass font-medium">Keep clipping →</span>
                      </button>
                    )}
                    {plan === 'free' && !partialJob && !firstVideoJob && (
                      <button
                        onClick={() => { setTopUpInfo({ context: 'upsell' }); setShowTopUp(true); }}
                        className="w-full text-left px-3 py-2.5 rounded-input bg-paper3 border border-brass/40 hover:border-brass text-sm transition-colors"
                      >
                        <span className="text-ink">Like these clips?</span>{' '}
                        <span className="text-muted">Upgrade and these exact clips lose the watermark on the spot, and stay for good.</span>{' '}
                        <span className="text-brass font-medium">Remove the watermark →</span>
                      </button>
                    )}
                    {/* Self-host only: cloud archives clips to the video library,
                        here they really are gone once the retention sweep runs. */}
                    {!billingEnabled && jobRetentionSeconds > 0 && (
                      <div className="px-3 py-2.5 rounded-input bg-paper3 border border-paper3 text-sm">
                        <span className="text-ink">Clips are kept for {formatRetention(jobRetentionSeconds)}, then deleted.</span>{' '}
                        <span className="text-muted">Download what you want to keep, or raise JOB_RETENTION_SECONDS in your env.</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                  {results && results.clips && results.clips.length > 0 ? (
                    <div className={`grid gap-4 pb-10 ${status === 'complete' ? 'grid-cols-[repeat(auto-fill,minmax(min(100%,600px),1fr))]' : 'grid-cols-1'}`}>
                      {rankedClips.map(({ clip, index: i }) => (
                        <ResultCard
                          key={`${jobId}-${i}-${clip.video_url || ''}`}
                          clip={clip}
                          index={i}
                          jobId={jobId}
                          onEditClip={(index) => setEditingClip(index)}
                          onReframeClip={(index) => setReframingClip(index)}
                          onUpgrade={isManaged ? openUpsell : null}
                          initialState={projectState?.clips?.find((c) => c.index === i) || null}
                          onStateChange={handleClipStateChange}
                          durable={durableClips[i]}
                          geminiApiKey={apiKey}
                          elevenLabsKey={elevenLabsKey}
                          isManaged={isManaged}
                          onPlay={(time) => handleClipPlay(time)}
                          onPause={handleClipPause}
                          onBulkSubtitle={handleBulkSubtitles}
                          clipCount={results.clips.length}
                          bulkProgress={bulkSub}
                        />
                      ))}
                    </div>
                  ) : (
                    status === 'processing' ? (
                      <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-muted space-y-3 text-center px-4">
                        <Loader2 size={28} className="animate-spin text-brass" />
                        <p className="text-sm">Waiting for clips...</p>
                        <p className="text-xs text-muted/80 max-w-[26ch] leading-snug">
                          They appear here one by one as each finishes rendering.
                        </p>
                      </div>
                    ) : status === 'error' ? (
                      <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-danger space-y-2">
                        <p>Generation failed.</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Phone navigation. A flex sibling of the scrolling pane, not a fixed
            overlay, so content is never trapped behind it. */}
        <MobileTabBar />

      </main>

      {/* Missing API Key Modal */}
      <Modal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        eyebrow="SETUP"
        title="Gemini API key required"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowKeyModal(false)}
              className="btn-ghost flex-1 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowKeyModal(false); goToTab('settings'); }}
              className="btn-primary flex-1 px-4 py-2 text-sm"
            >
              Go to settings
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            creatorsplan needs a <strong className="text-ink2">Gemini</strong> API key. It has a free tier.
          </p>

          {/* Gemini block */}
          <div className={`rounded-input p-4 space-y-2 border ${!apiKey ? 'border-rule2' : 'border-rule opacity-70'}`}>
            <p className="text-xs font-medium text-ink flex items-center gap-2">
              {apiKey ? <Check size={12} className="text-ok" /> : <AlertTriangle size={12} className="text-warn" />}
              Gemini API key {apiKey && <span className="text-ok">— set</span>}
            </p>
            {!apiKey && (
              <>
                <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brass underline">aistudio.google.com/app/apikey</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Create API key"</li>
                  <li>Copy the key and paste it below</li>
                </ol>
                <input
                  type="text"
                  placeholder="Paste your Gemini API key here..."
                  className="input-field"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      setApiKey(e.target.value.trim());
                    }
                  }}
                />
              </>
            )}
          </div>

        </div>
      </Modal>

      {/* Pre-flight quality gate */}
      {qualityGate && (
        <Modal isOpen={true} onClose={() => setQualityGate(null)} size="md" eyebrow="HEADS UP" title="low source quality">
          <div className="space-y-4">
            <p className="text-sm text-ink2">
              YouTube only offers <span className="text-brass font-semibold">{qualityGate.info.max_height}p</span> for this video
              (below the {qualityGate.info.min_height}p we recommend). Processing anyway will produce lower-quality clips.
            </p>
            {qualityGate.info.cookies_invalid && (
              <p className="text-xs text-muted">
                Your YouTube cookies look expired — refreshing them (export again from an incognito window) often unlocks HD.
              </p>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setQualityGate(null)} className="btn-ghost">cancel</button>
              <button
                onClick={() => { const d = qualityGate.data; setQualityGate(null); handleProcess(d, true); }}
                className="btn-primary"
              >
                process anyway
              </button>
            </div>
          </div>
        </Modal>
      )}


      {editingClip !== null && results?.clips?.[editingClip] && (
        <ClipEditor
          jobId={jobId}
          clipIndex={editingClip}
          clipTitle={results.clips[editingClip].video_title_for_youtube_short || ''}
          onClose={() => setEditingClip(null)}
          onRerendered={handleClipRerendered}
        />
      )}
      {reframingClip !== null && results?.clips?.[reframingClip] && (
        <ReframeEditor
          jobId={jobId}
          clipIndex={reframingClip}
          clipTitle={results.clips[reframingClip].video_title_for_youtube_short || ''}
          onClose={() => setReframingClip(null)}
          onReframed={handleClipRerendered}
        />
      )}
      {showLogin && <LoginModal mode={loginMode} onClose={() => setShowLogin(false)} queued={typeof peekPendingJob()?.data?.payload === 'string'} />}
      {showSurvey && <OnboardingSurvey onDone={() => setSurveyDone(true)} />}
      {tutorialPhase && !showSurvey && (
        <ClipTutorial
          phase={tutorialPhase}
          jobStatus={status}
          errorText={jobError}
          onStart={startTutorial}
          onSkip={skipTutorial}
          onDismissCelebrate={finishTutorial}
        />
      )}
      {showPlanChoice && <PlanChoiceModal onClose={() => setShowPlanChoice(false)} />}
      {showWmNotice && (
        <WatermarkModal
          source="results"
          jobId={jobId}
          previewSrc={results?.clips?.[0]?.video_url ? getApiUrl(results.clips[0].video_url) : null}
          onUpgrade={openUpsell}
          onClose={() => setShowWmNotice(false)}
        />
      )}
      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          required={topUpInfo.required}
          remaining={topUpInfo.remaining}
          partialMinutes={topUpInfo.partialMinutes}
          onPartial={topUpInfo.onPartial}
          context={topUpInfo.context || 'wall'}
        />
      )}
      {showTrialUpgrade && (
        <TrialUpgradeModal
          plan={plan}
          onActivated={refreshMe}
          onClose={() => setShowTrialUpgrade(false)}
        />
      )}
    </div>
  );
}

export default App;
