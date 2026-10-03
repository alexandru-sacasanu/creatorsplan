const { useComposition, CompositionStage, Easing, clamp, Captions, useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;
const PAPER = '#FBFAF7', INK = '#14120F', VOLT = '#FFCF1A', LINE = '#E5E0D6', MUTED = '#6B665E';
const STRIPES = 'repeating-linear-gradient(135deg,#E5E0D6 0 14px,#EDE9E1 14px 28px)';
const FONT = "'Hanken Grotesk', sans-serif", MONO = "'Geist Mono', monospace";

const p01 = (t, s, e) => clamp((t - s) / (e - s), 0, 1);
const MOTION = {
  enter: (t, s, e) => Easing.easeOutCubic(p01(t, s, e)),
  glide: (t, s, e) => Easing.easeInOutCubic(p01(t, s, e)),
  strike: (t, s, e) => Easing.easeInQuart(p01(t, s, e)),
};
const lerp = (a, b, p) => a + (b - a) * p;

const BAR = { x: 260, y: 760, w: 1400, h: 90 };
const SEGS = [[0.08, 0.06], [0.40, 0.08], [0.78, 0.08]];
const CARDS = [
  { x: 495, pre: 'Nobody tells you ', hi: 'the first 100', post: ' are practice', dur: '0:37' },
  { x: 825, pre: 'Why I stopped ', hi: 'posting every day', post: '', dur: '0:52' },
  { x: 1155, pre: 'What ', hi: '1M views', post: ' actually paid', dur: '0:53' },
];
const CARD = { y: 200, w: 270, h: 480 };
const TOOLS = ['Clip generator', 'AI shorts', 'YouTube studio', 'Agents'];

function Logo({ T, C, total }) {
  const draw = MOTION.enter(T, 0.3, 1.2);
  const hit = MOTION.strike(T, 1.15, 1.5);
  const fill = MOTION.enter(T, 1.5, 1.7);
  const bump = Math.sin(Math.PI * p01(T, 1.5, 1.8)) * 0.06;
  const word = MOTION.enter(T, 1.8, 2.7);
  const toCorner = MOTION.glide(T, C.Buried, C.Buried + 0.9);
  const back = MOTION.glide(T, C.Close, C.Close + 1.0);
  const k = toCorner * (1 - back);
  const tx = -727 * k, ty = -440 * k - 80 * back;
  const sc = lerp(1, 0.3, k);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, transform: `translate(${tx}px, ${ty}px) scale(${sc})` }}>
        <svg width="120" height="197" viewBox="0 0 28 46" style={{ overflow: 'visible', transform: `scale(${1 + bump}, ${1 - bump})`, transformOrigin: '50% 100%' }}>
          <rect x="1" y="1" width="26" height="44" rx="7" fill={VOLT} fillOpacity={fill} stroke={INK} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
          <path d="M16.5 8 L7.5 24.5 H13.5 L11.5 38 L20.5 21 H14.5 Z" fill={INK} opacity={T > 1.15 ? 1 : 0} transform={`translate(0 ${lerp(-60, 0, hit)})`} />
        </svg>
        <div style={{ width: 800 * word, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ font: `700 160px ${FONT}`, letterSpacing: '-0.045em', lineHeight: 1, color: INK, transform: `translateX(${lerp(-40, 0, word)}px)` }}>creatorsplan</div>
        </div>
      </div>
    </div>
  );
}

function Timeline({ T, C }) {
  const inP = MOTION.enter(T, C.Buried + 0.4, C.Buried + 1.2);
  const outP = MOTION.enter(T, C.Cut + 1.2, C.Cut + 2.0);
  const s0 = C.Buried + 1.2, s1 = C.Cut + 0.6;
  const scan = p01(T, s0, s1);
  const mins = Math.floor(scan * 48), secs = Math.floor((scan * 48 * 60) % 60);
  return (
    <div style={{ position: 'absolute', left: BAR.x, top: BAR.y - 44, width: BAR.w, opacity: inP * (1 - outP), transform: `translateY(${30 * (1 - inP) + 20 * outP}px)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 20px ${MONO}`, letterSpacing: '0.04em', color: MUTED, height: 44 }}>
        <span>PODCAST-EP42-FINAL.MP4</span><span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} / 48:12</span>
      </div>
      <div style={{ position: 'relative', height: BAR.h, borderRadius: 16, background: PAPER, border: `2px solid ${LINE}`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '18px 16px', background: 'repeating-linear-gradient(90deg,#D6D0C4 0 3px,transparent 3px 9px)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${scan * 100}%`, width: 3, background: INK }} />
      </div>
    </div>
  );
}

function Clips({ T, C }) {
  const s0 = C.Buried + 1.2, s1 = C.Cut + 0.6;
  const drift = lerp(1, 1.035, p01(T, C.Cut + 1, C.Close));
  const out = MOTION.glide(T, C.Close, C.Close + 0.7);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${drift}) translateY(${40 * out}px)`, transformOrigin: '50% 40%', opacity: 1 - out }}>
      {SEGS.map(([f, w], i) => {
        const on = MOTION.enter(T, s0 + f * (s1 - s0), s0 + f * (s1 - s0) + 0.25);
        const m = MOTION.glide(T, C.Cut + 0.5 + i * 0.15, C.Cut + 1.6 + i * 0.15);
        const content = MOTION.enter(T, C.Cut + 1.5 + i * 0.15, C.Cut + 2.1 + i * 0.15);
        const card = CARDS[i];
        const x = lerp(BAR.x + 16 + f * (BAR.w - 32), card.x, m);
        const y = lerp(BAR.y + 10, CARD.y, m);
        const wd = lerp(w * (BAR.w - 32), CARD.w, m);
        const ht = lerp(BAR.h - 20, CARD.h, m);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: wd, height: ht, borderRadius: lerp(10, 24, m), border: `3px solid ${INK}`, background: STRIPES, overflow: 'hidden', opacity: on, transform: `scale(${lerp(0.9, 1, on)})` }}>
            <div style={{ position: 'absolute', inset: 0, background: VOLT, opacity: 1 - m }} />
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 58, opacity: content, transform: `translateY(${12 * (1 - content)}px)`, font: `700 26px ${FONT}`, lineHeight: 1.2, color: INK, letterSpacing: '-0.01em' }}>
              {card.pre}<span style={{ background: VOLT, padding: '0 4px' }}>{card.hi}</span>{card.post}
            </div>
            <div style={{ position: 'absolute', left: 18, bottom: 18, opacity: content, font: `500 16px ${MONO}`, background: INK, color: PAPER, padding: '3px 8px', borderRadius: 6 }}>{card.dur}</div>
          </div>
        );
      })}
    </div>
  );
}

function Tools({ T, C }) {
  const out = MOTION.glide(T, C.Close, C.Close + 0.6);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', gap: 18, opacity: 1 - out, transform: `translateY(${30 * out}px)` }}>
      {TOOLS.map((label, i) => {
        const a = C.Tools + 0.5 + i * 0.4;
        const on = MOTION.enter(T, a, a + 0.35);
        const settle = MOTION.enter(T, a + 0.4, a + 0.8);
        return (
          <div key={label} style={{ height: 76, padding: '0 32px', borderRadius: 99, display: 'flex', alignItems: 'center', font: `600 30px ${FONT}`, color: INK, border: `2.5px solid ${INK}`, background: settle > 0.5 ? PAPER : VOLT, boxShadow: `0 ${4 * (1 - settle)}px 0 ${INK}`, opacity: on, transform: `translateY(${lerp(24, 0, on)}px)` }}>{label}</div>
        );
      })}
    </div>
  );
}

function Close({ T, C }) {
  const line = MOTION.enter(T, C.Close + 0.9, C.Close + 1.5);
  const hi = MOTION.glide(T, C.Close + 1.5, C.Close + 2.0);
  const url = MOTION.enter(T, C.Close + 1.9, C.Close + 2.4);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <div style={{ font: `600 84px ${FONT}`, letterSpacing: '-0.04em', color: INK, opacity: line, transform: `translateY(${20 * (1 - line)}px)`, display: 'flex', gap: 22 }}>
        <span>Post more.</span>
        <span style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: -8, right: -8, top: 10, bottom: 4, background: VOLT, borderRadius: 8, transform: `scaleX(${hi})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>Edit less.</span>
        </span>
      </div>
      <div style={{ font: `500 24px ${MONO}`, letterSpacing: '0.06em', color: MUTED, opacity: url }}>CREATORSPLAN.COM</div>
    </div>
  );
}

function Piece({ captions }) {
  const { T, CUES: C, time, authoredTotal } = useComposition();
  const total = authoredTotal || (C.Close + 4);
  const outro = MOTION.glide(T, total - 0.6, total);
  return (
    <div data-screen-label={`t=${Math.floor(time || 0)}s`} style={{ position: 'absolute', inset: 0, background: PAPER, overflow: 'hidden', fontFamily: FONT }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - outro }}>
        <Timeline T={T} C={C} />
        <Clips T={T} C={C} />
        <Tools T={T} C={C} />
        <Logo T={T} C={C} total={total} />
        <Close T={T} C={C} />
        {captions && (
          <Captions
            style={{ font: `600 52px ${FONT}`, letterSpacing: '-0.025em', color: INK, textShadow: 'none', bottom: '7%' }}
            items={[
              { at: C.Buried + 0.6, until: C.Cut + 0.3, text: 'Your best moments are buried in hours of footage.' },
              { at: C.Cut + 0.5, until: C.Tools + 0.2, text: 'creatorsplan finds them, reframes them, captions them.' },
              { at: C.Tools + 0.4, until: C.Close, text: 'Then titles, packages and posts them.' },
            ]}
          />
        )}
      </div>
    </div>
  );
}

function BrandFilm() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={1920} height={1080} bg={PAPER} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        <Piece captions={t.captions} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Film" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
        <TweakToggle label="Captions" value={t.captions} onChange={(v) => setTweak('captions', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}
window.BrandFilm = BrandFilm;
