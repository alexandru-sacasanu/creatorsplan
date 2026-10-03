import { Check } from 'lucide-react';

/**
 * The single wizard stepper (design_handoff_creatorsplan_rebrand/README.md >
 * Core components > Stepper) — shared by ThumbnailStudio and SaaShortsTab.
 *
 * Done: 28px ink circle, paper check, clickable to go back.
 * Current: a volt pill showing the mono number and label — the only step
 * that shows a label at all.
 * Upcoming: 28px circle, --cp-line-strong border, mono number only.
 * Connectors: 2px, ink when done, --cp-line otherwise.
 *
 * Props:
 *  - steps: string[] (labels)
 *  - current: index of the active step
 *  - onStepClick(index)? — optional, only past steps are clickable
 */
export default function StepIndicator({ steps, current, onStepClick }) {
  return (
    <ol className="flex items-center w-full" aria-label="progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done && typeof onStepClick === 'function';
        return (
          <li key={label} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(i)}
              className={`flex items-center shrink-0 transition-colors duration-[var(--cp-dur-settle)] ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              aria-current={active ? 'step' : undefined}
            >
              {active ? (
                <span className="h-7 px-3 inline-flex items-center gap-1.5 rounded-cp-pill border-[1.5px] border-cp-ink bg-cp-volt">
                  <span className="font-cp-mono text-[11px] font-medium text-cp-ink">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-cp-mono text-[11px] font-medium uppercase tracking-[0.05em] text-cp-ink">{label}</span>
                </span>
              ) : done ? (
                <span className="w-7 h-7 rounded-full bg-cp-ink flex items-center justify-center">
                  <Check size={13} className="text-cp-paper" />
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full border border-cp-line-strong flex items-center justify-center font-cp-mono text-[11px] text-cp-ink-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
            </button>
            {i < steps.length - 1 && (
              <span className={`h-[2px] flex-1 mx-1.5 sm:mx-3 ${done ? 'bg-cp-ink' : 'bg-cp-line'}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
