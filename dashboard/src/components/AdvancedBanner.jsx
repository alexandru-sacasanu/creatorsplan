import React from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';

// Banner for advanced tools (AI Shorts, AI Agent) that use fal.ai + ElevenLabs.
// These are BYOK: the plan covers the script/orchestration, the user brings their
// own keys for the premium generation. If they have no plan yet, also nudge trial.
export default function AdvancedBanner({ needsPlan, onKeys }) {
  return (
    <div className="card mx-3 sm:mx-6 md:mx-10 xl:mx-auto xl:w-[880px] mt-3 px-3.5 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 animate-fade">
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-sm min-w-0">
        <KeyRound size={16} className="shrink-0 text-warn mt-0.5 sm:mt-0" />
        <div className="text-ink2 leading-relaxed min-w-0">
          <span className="font-medium text-ink">Bring your own keys.</span>{' '}
          {needsPlan
            ? <>Sign in with <span className="font-medium text-ink">Google</span> to unlock it for free. This tool also uses your own <span className="font-medium text-ink normal-case">fal.ai + ElevenLabs</span> keys (you pay those providers).</>
            : <>Presenter video and voices use your own <span className="font-medium text-ink normal-case">fal.ai + ElevenLabs</span> keys. Add them in settings. Scripts are included in your plan.</>}
        </div>
      </div>
      <button
        onClick={needsPlan ? () => { window.location.hash = '#/pricing'; } : onKeys}
        className="btn-quiet shrink-0 text-xs px-3 py-1.5 w-full sm:w-auto"
      >
        {needsPlan ? <>See plans <ArrowRight size={14} /></> : 'Add keys'}
      </button>
    </div>
  );
}
