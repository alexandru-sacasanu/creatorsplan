import { ArrowRight } from 'lucide-react';
import BrandFilm from './components/landing/BrandFilm';

// Marketing landing page (design_handoff_creatorsplan_rebrand/Landing Page.dc.html
// + README > Landing page). Every CTA goes through onLaunchApp, which is how
// main.jsx remembers that this visitor has moved on to the app.

const SHORTS = [
  { pre: 'Nobody tells you', post: ' the first 100 are practice', dur: '0:37', big: false },
  { pre: 'Why I stopped ', hi: 'posting every day', dur: '0:52', big: true },
  { pre: 'What ', hi: '1M views', post: ' actually paid', dur: '0:53', big: false },
];

const MARKS = [
  { left: '8%', width: '6%' },
  { left: '36%', width: '8%' },
  { left: '82%', width: '8%' },
];

const STEPS = [
  { n: '01', title: 'Drop it in', body: 'Upload a file or paste a YouTube link. Podcasts, vlogs, streams and talks all work.' },
  { n: '02', title: 'We find the moments', body: 'Each clip gets a hook score, reframing around the speaker and captions you can edit.' },
  { n: '03', title: 'Post or schedule', body: 'Download, or publish straight to YouTube. An agent can run the whole loop for you.' },
];

const TOOLS = [
  { name: 'Clip generator', body: 'Long video to 9:16, 1:1 or 16:9 clips with captions and a hook score.' },
  { name: 'AI shorts', byok: true, body: 'UGC-style ads from a website or one sentence. Pick a presenter, a language and a length.' },
  { name: 'YouTube studio', body: 'Titles, thumbnails, descriptions and chapters, then publish without leaving the app.' },
  { name: 'Agents', byok: true, body: 'Connect Claude, ChatGPT or n8n and have them clip, title and schedule for you.' },
];

function Mark({ width = 16, height = 26, strike = false }) {
  return (
    <svg width={width} height={height} viewBox="0 0 28 46" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="26" height="44" rx="7" fill="#FFCF1A" stroke="#14120F" strokeWidth="2" />
      <path d="M16.5 8 L7.5 24.5 H13.5 L11.5 38 L20.5 21 H14.5 Z" fill="#14120F" className={strike ? 'cp-strike' : ''} />
    </svg>
  );
}

function SectionHead({ title, label, dark = false }) {
  return (
    <div className={`flex flex-wrap items-baseline justify-between gap-4 border-t pt-3.5 ${dark ? 'border-cp-paper' : 'border-cp-ink'}`}>
      <h2 className="m-0 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">{title}</h2>
      <p className={`font-cp-mono text-xs font-medium tracking-[0.06em] ${dark ? 'text-cp-dark-muted' : 'text-cp-ink-2'}`}>{label}</p>
    </div>
  );
}

export default function Landing({ onLaunchApp }) {
  const launch = (e) => { e.preventDefault(); onLaunchApp(); };

  return (
    <div className="min-h-screen bg-cp-paper text-cp-ink">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-5 sm:gap-6 sm:px-8">
        <a href="#landing" className="flex items-center gap-[9px]" aria-label="creatorsplan home">
          <Mark strike />
          <span className="text-lg font-bold tracking-[-0.04em] sm:text-xl">creatorsplan</span>
        </a>
        <nav className="flex items-center gap-3 whitespace-nowrap text-[15px] font-medium sm:gap-7">
          <a href="#tools" className="hidden hover:text-cp-ink-2 sm:inline">Tools</a>
          <a href="#keys" className="hidden hover:text-cp-ink-2 sm:inline">Your keys</a>
          <a href="#app" onClick={launch} className="hover:text-cp-ink-2">Log in</a>
          <a href="#app" onClick={launch} className="btn-quiet min-h-[40px] px-3.5 text-sm sm:min-h-[42px] sm:px-[18px] sm:text-[15px]">Start free</a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-7 px-4 pb-10 pt-12 text-center sm:px-8 sm:pt-[72px]">
          <p className="font-cp-mono text-xs font-medium tracking-[0.08em] text-cp-ink-2">FOR PEOPLE WHO MAKE VIDEOS</p>
          <h1 className="m-0 text-[length:var(--cp-text-display)] font-semibold leading-[0.92] tracking-[-0.05em]">
            Post more.<br />Edit <span className="cp-highlight">less.</span>
          </h1>
          <p className="m-0 max-w-[600px] text-[17px] leading-[1.55] text-cp-ink-2 sm:text-[19px]">
            creatorsplan turns your long videos into shorts, makes UGC-style ads and packages your YouTube uploads.
            The AI tools run on your own keys.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#app" onClick={launch} className="btn-primary min-h-[56px] px-7 text-[17px]">
              Drop in your first video <ArrowRight size={16} />
            </a>
            <a href="#how" className="btn-ghost min-h-[56px] bg-transparent px-6 text-[17px]">How it works</a>
          </div>
        </section>

        {/* Hero visual: three shorts lift off a scanned timeline, on a 6s loop */}
        <section className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 sm:px-8" aria-hidden="true">
          <div className="flex flex-col gap-10 overflow-hidden rounded-[28px] bg-cp-canvas px-5 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12">
            <div className="flex min-h-[220px] items-end justify-center gap-[clamp(12px,3vw,40px)] sm:min-h-[300px]">
              {SHORTS.map((s, i) => (
                <div
                  key={s.dur}
                  className={`cp-lift relative aspect-[9/16] overflow-hidden border-[1.5px] border-cp-ink bg-cp-paper ${s.big ? 'w-[clamp(100px,18vw,200px)] rounded-[20px]' : 'w-[clamp(84px,15vw,170px)] rounded-[18px]'}`}
                  style={{ animationDelay: `${i * 0.25}s` }}
                >
                  <div className="cp-placeholder absolute inset-0" />
                  <div className={`absolute left-2.5 right-2.5 text-left font-bold leading-[1.2] ${s.big ? 'bottom-[38px] text-[11px] sm:text-[15px]' : 'bottom-[34px] text-[10px] sm:text-[13px]'}`}>
                    {s.hi ? <>{s.pre}<span className="bg-cp-volt px-[3px] py-px">{s.hi}</span>{s.post}</> : <><span className="bg-cp-volt px-[3px] py-px">{s.pre}</span>{s.post}</>}
                  </div>
                  <span className="absolute bottom-2.5 left-2.5 rounded bg-cp-ink px-[5px] py-0.5 font-cp-mono text-[10px] font-medium text-cp-paper">{s.dur}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between font-cp-mono text-xs font-medium text-cp-ink-2">
                <span>PODCAST-EP42-FINAL.MP4</span><span>48:12</span>
              </div>
              <div className="relative h-14 overflow-hidden rounded-xl border border-cp-line bg-cp-paper">
                <div className="absolute inset-3 bg-[repeating-linear-gradient(90deg,#D6D0C4_0_2px,transparent_2px_6px)]" />
                {MARKS.map((m, i) => (
                  <div
                    key={m.left}
                    className="cp-mark absolute bottom-1.5 top-1.5 rounded-md border-[1.5px] border-cp-ink bg-cp-volt"
                    style={{ left: m.left, width: m.width, animationDelay: `${i * 0.25}s` }}
                  />
                ))}
                <div className="cp-scan absolute bottom-0 top-0 w-0.5 bg-cp-ink" />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto flex w-full max-w-[1200px] scroll-mt-6 flex-col gap-10 px-4 pb-[120px] sm:px-8">
          <SectionHead title="One video in, a week of posts out." label="HOW IT WORKS" />
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-3">
                <p className="font-cp-mono text-[13px] font-medium text-cp-ink-2">{s.n}</p>
                <h3 className="text-[22px] font-semibold tracking-[-0.015em]">{s.title}</h3>
                <p className="text-base leading-[1.55] text-cp-ink-2">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Brand film */}
        <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 pb-[120px] sm:px-8">
          <SectionHead title="The whole idea in 20 seconds." label="FILM" />
          <div className="overflow-hidden rounded-[28px] border-[1.5px] border-cp-ink">
            <BrandFilm />
          </div>
        </section>

        {/* Tools (the one dark band) */}
        <section id="tools" className="scroll-mt-0 bg-cp-dark-bg text-cp-paper">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-24 sm:px-8">
            <SectionHead title="Four tools, one workspace." label="TOOLS" dark />
            <div className="grid gap-4 md:grid-cols-2">
              {TOOLS.map((t) => (
                <div key={t.name} className="flex flex-col gap-3 rounded-cp-card border border-cp-dark-line p-7 transition-colors duration-[160ms] ease-cp-settle hover:border-cp-volt">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-2xl font-semibold tracking-[-0.02em]">{t.name}</h3>
                    {t.byok && (
                      <span className="flex h-[22px] items-center rounded-full border border-cp-ink-2 px-2 font-cp-mono text-[10px] font-medium tracking-[0.05em] text-cp-dark-muted">BYOK</span>
                    )}
                  </div>
                  <p className="text-base leading-[1.55] text-cp-dark-muted">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Your keys */}
        <section id="keys" className="mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 py-[120px] sm:px-8 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <p className="font-cp-mono text-xs font-medium tracking-[0.06em] text-cp-ink-2">BRING YOUR OWN KEYS</p>
            <h2 className="m-0 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em] [text-wrap:balance]">You pay the model, not a markup.</h2>
            <p className="m-0 max-w-[460px] text-[17px] leading-[1.55] text-cp-ink-2">
              Add your fal.ai and ElevenLabs keys once. Every AI short shows its real cost before you generate it.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 rounded-[24px] bg-cp-canvas p-6">
            <div className="flex items-center justify-between gap-4 rounded-cp-select border-[1.5px] border-cp-ink bg-cp-paper p-5">
              <div className="flex flex-col gap-1">
                <p className="text-[17px] font-semibold">Standard</p>
                <p className="text-sm text-cp-ink-2">Hailuo 2.3 + VEED Lipsync</p>
              </div>
              <p className="font-cp-mono text-[15px] font-medium">~$0.80</p>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-cp-select border border-cp-line bg-cp-paper p-5">
              <div className="flex flex-col gap-1">
                <p className="text-[17px] font-semibold">Premium</p>
                <p className="text-sm text-cp-ink-2">Kling Avatar v2</p>
              </div>
              <p className="font-cp-mono text-[15px] font-medium">~$2.00</p>
            </div>
            <p className="px-1 pt-1 font-cp-mono text-[11px] font-medium tracking-[0.05em] text-cp-ink-2">PER VIDEO, BILLED BY YOUR PROVIDER</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-[1200px] px-4 pb-24 sm:px-8">
          <div className="flex flex-col items-center gap-6 rounded-[28px] border-[1.5px] border-cp-ink bg-cp-volt px-6 py-14 text-center sm:px-10 sm:py-[72px]">
            <h2 className="m-0 text-[clamp(40px,6vw,80px)] font-semibold leading-[0.95] tracking-[-0.045em]">
              Your next video<br />is already shot.
            </h2>
            <a href="#app" onClick={launch} className="btn-quiet min-h-[56px] px-7 text-[17px]">
              Start free <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-[1200px] flex-wrap justify-between gap-4 border-t border-cp-line px-4 pb-10 pt-6 text-sm text-cp-ink-2 sm:px-8">
        <div className="flex items-center gap-2">
          <Mark width={11} height={18} />
          <span className="font-bold tracking-[-0.04em] text-cp-ink">creatorsplan</span>
          <span>© 2026</span>
        </div>
        <div className="flex gap-5">
          <a href="/terms" className="hover:text-cp-ink">Terms</a>
          <a href="/privacy" className="hover:text-cp-ink">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
