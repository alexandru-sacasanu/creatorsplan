/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rebrand palette — values mirror tokens.css (kept literal so
        // Tailwind alpha modifiers like bg-brass/10 compile)
        paper: "rgb(5 7 12 / <alpha-value>)",
        paper2: "rgb(11 15 26 / <alpha-value>)",
        paper3: "rgb(14 20 34 / <alpha-value>)",
        ink: "rgb(233 237 246 / <alpha-value>)",
        ink2: "rgb(136 145 164 / <alpha-value>)",
        muted: "rgb(91 99 118 / <alpha-value>)",
        brass: "rgb(77 216 255 / <alpha-value>)",
        brassink: "rgb(5 7 12 / <alpha-value>)",
        coral: "rgb(167 139 255 / <alpha-value>)",
        ok: "rgb(201 247 106 / <alpha-value>)",
        warn: "rgb(255 207 92 / <alpha-value>)",
        danger: "rgb(255 92 122 / <alpha-value>)",
        // legacy aliases so untouched files degrade gracefully
        background: "rgb(5 7 12 / <alpha-value>)",
        surface: "rgb(11 15 26 / <alpha-value>)",
        primary: "rgb(77 216 255 / <alpha-value>)",
        accent: "rgb(167 139 255 / <alpha-value>)",

        // creatorsplan v2 (design_handoff_creatorsplan_rebrand) — new `cp-*`
        // namespace so steps 3-6 can restyle onto bg-cp-volt, text-cp-ink,
        // border-cp-line etc. without touching the keys above until a
        // component is actually migrated.
        "cp-ink": "var(--cp-ink)",
        "cp-ink-2": "var(--cp-ink-2)",
        "cp-ink-3": "var(--cp-ink-3)",
        "cp-line": "var(--cp-line)",
        "cp-line-strong": "var(--cp-line-strong)",
        "cp-paper": "var(--cp-paper)",
        "cp-canvas": "var(--cp-canvas)",
        "cp-field": "var(--cp-field)",
        "cp-tint": "var(--cp-tint)",
        "cp-volt": "var(--cp-volt)",
        "cp-volt-soft": "var(--cp-volt-soft)",
        "cp-volt-hover": "var(--cp-volt-hover)",
        "cp-go": "var(--cp-go)",
        "cp-go-bg": "var(--cp-go-bg)",
        "cp-stop": "var(--cp-stop)",
        "cp-stop-bg": "var(--cp-stop-bg)",
        "cp-dark-bg": "var(--cp-dark-bg)",
        "cp-dark-muted": "var(--cp-dark-muted)",
        "cp-dark-line": "var(--cp-dark-line)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        sans: "var(--font-body)",
        serif: "var(--font-display)",
        mono: "var(--font-mono)",
        "cp-mono": "var(--cp-font-mono)",
      },
      borderColor: {
        rule: "var(--color-rule)",
        rule2: "var(--color-rule-2)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        input: "var(--radius-input)",
        "cp-chip": "var(--cp-radius-chip)",
        "cp-thumb": "var(--cp-radius-thumb)",
        "cp-input": "var(--cp-radius-input)",
        "cp-select": "var(--cp-radius-select)",
        "cp-card": "var(--cp-radius-card)",
        "cp-pill": "var(--cp-radius-pill)",
      },
      fontSize: {
        micro: ["10.5px", { letterSpacing: "0.10em" }],
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        'cp-settle': "var(--cp-ease-settle)",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade': 'fadeIn 0.4s var(--ease-out)',
        // mobile shell: the nav drawer flies in from the edge, sheets rise
        'slide-in-left': 'slideInLeft 0.24s var(--ease-out)',
        'sheet-up': 'sheetUp 0.26s var(--ease-out)',
        // creatorsplan v2 "Rise": screen mount, step-panel change, new
        // results. Lists stagger 40-60ms per item via inline delay, not here.
        'cp-rise': 'cpRise var(--cp-dur-rise) var(--cp-ease-settle)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        cpRise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        sheetUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
