import { useAuth } from '../contexts/AuthContext';

const PLAN_NAMES = { free: 'Free', starter: 'Starter', creator: 'Creator', pro: 'Pro' };

// Sidebar plan card (design handoff > App shell): plan name, minutes used of
// the allowance, a 6px ink bar and the reset date. Cloud accounts with a
// minute balance only; clicking does what the old header meter did.
export default function PlanCard({ onClick }) {
  const { isManaged, minutes, plan, me } = useAuth();
  if (!isManaged || !minutes) return null;

  const used = Math.round((minutes.plan_used || 0) * 10) / 10;
  const allowance = Math.round((minutes.plan_allowance || 0) * 10) / 10;
  const remaining = Math.round((minutes.remaining || 0) * 10) / 10;
  const pct = allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0;
  const resets = me?.period_end
    ? new Date(me.period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      title="Manage your plan"
      className="w-full text-left rounded-[14px] border border-cp-line p-3.5 hover:border-cp-line-strong transition-colors duration-[var(--cp-dur-settle)]"
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-cp-ink">{PLAN_NAMES[plan] || 'Your'} plan</span>
        <span className="font-cp-mono text-[11px] text-cp-ink-2">
          {allowance > 0 ? `${used} / ${allowance}` : `${remaining} min`}
        </span>
      </span>
      {allowance > 0 && (
        <span className="mt-2.5 block h-1.5 rounded-full bg-cp-tint overflow-hidden">
          <span className="block h-full rounded-full bg-cp-ink" style={{ width: `${pct}%` }} />
        </span>
      )}
      <span className="mt-2 block text-xs text-cp-ink-2">
        {resets ? `Minutes reset ${resets}` : `${remaining} min left`}
      </span>
    </button>
  );
}
