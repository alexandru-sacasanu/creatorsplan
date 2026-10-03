/**
 * The single on/off switch (design_handoff_creatorsplan_rebrand/README.md >
 * Core components > Toggle): 44x26 track, ink when on, --cp-line-strong when
 * off, 20px white knob that slides 18px over 200ms.
 *
 * A real checkbox underneath (sr-only), so a wrapping <label> still toggles it
 * and keyboard/screen-reader behaviour is the browser's.
 */
export default function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <span className="relative inline-flex items-center shrink-0">
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span className="cp-toggle" aria-hidden="true" />
    </span>
  );
}
