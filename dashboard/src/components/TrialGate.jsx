import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

// Slim, non-blocking banner shown above a tool when the visitor has no
// entitlement: signed out (offers sign-up) or signed in without minutes
// (offers the plans).
export default function TrialGate({ toolName = 'this', onSignUp = null }) {
  return (
    <div className="card mx-3 sm:mx-6 md:mx-10 xl:mx-auto xl:w-[880px] mt-3 px-3.5 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 animate-fade">
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-sm min-w-0">
        <Zap size={16} className="shrink-0 text-cp-ink mt-0.5 sm:mt-0" />
        <div className="text-ink2 leading-relaxed min-w-0">
          {onSignUp
            ? <>Create a free account to use {toolName}: your first video up to 60 min, then 20 min a month. No card needed.</>
            : <>You're out of minutes for {toolName}. Pick a plan to keep going.</>}
        </div>
      </div>
      <button
        onClick={() => { if (onSignUp) onSignUp(); else window.location.hash = '#/pricing'; }}
        className="btn-primary shrink-0 text-xs px-4 py-2 w-full sm:w-auto"
      >
        {onSignUp ? 'Sign up free' : 'See plans'} <ArrowRight size={14} />
      </button>
    </div>
  );
}
