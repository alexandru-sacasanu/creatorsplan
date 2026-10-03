/**
 * App screen frame (design_handoff_creatorsplan_rebrand/README.md > App shell):
 * main padding 56px 40px 96px, content max-width 880px, centred, and a Rise
 * on mount. `Screen` owns the scroll; `ScreenHeader` is the eyebrow / H1 /
 * subtitle block every screen opens with.
 */
export function Screen({ children, className = '' }) {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className={`mx-auto w-full max-w-[880px] px-4 pt-8 pb-16 sm:px-10 sm:pt-14 sm:pb-24 animate-cp-rise ${className}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * eyebrow: mono label, e.g. "01 · CLIP GENERATOR".
 * actions: optional node on the right of the title row (a filter, a button).
 * children: optional extra line under the subtitle (a link).
 */
export function ScreenHeader({ eyebrow, title, subtitle, actions, children }) {
  return (
    <header className="mb-8 flex flex-col gap-3">
      {eyebrow && <p className="cp-eyebrow">{eyebrow}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="cp-h1">{title}</h1>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {subtitle && <p className="max-w-[620px] text-[17px] leading-[1.55] text-cp-ink-2">{subtitle}</p>}
      {children}
    </header>
  );
}
