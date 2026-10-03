// Full-screen loader for the landing page, built from the Short Frame mark:
// the frame draws itself, fills volt, then the bolt drops in with a bounce.
// Below it a progress bar and "LOADING N%" follow how much of the hero video
// has buffered. Landing.jsx decides when it leaves; `leaving` fades it out.

export default function LogoLoader({ progress, leaving }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div
      className={`cp-loader fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-cp-paper ${leaving ? 'cp-loader-out' : ''}`}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <svg viewBox="0 0 28 46" width="56" height="92" aria-hidden="true" className="overflow-visible">
        <rect className="cp-loader-fill" x="1" y="1" width="26" height="44" rx="7" fill="#FFCF1A" />
        <rect
          className="cp-loader-frame"
          x="1" y="1" width="26" height="44" rx="7"
          fill="none" stroke="#14120F" strokeWidth="2" pathLength="1"
        />
        <path className="cp-loader-bolt" d="M16.5 8 L7.5 24.5 H13.5 L11.5 38 L20.5 21 H14.5 Z" fill="#14120F" />
      </svg>
      <div className="flex w-[180px] flex-col items-center gap-3">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-cp-line">
          <div
            className="h-full rounded-full bg-cp-ink transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="font-cp-mono text-xs font-medium tracking-[0.08em] text-cp-ink-2 tabular-nums">
          LOADING {pct}%
        </p>
      </div>
    </div>
  );
}
