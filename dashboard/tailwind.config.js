/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy semantic keys, repointed at the creatorsplan v2 palette so
        // every screen moves to paper/ink/volt at once (kept literal so alpha
        // modifiers like bg-brass/10 compile). paper = app canvas, paper2 =
        // cards and panels, paper3 = tint (hover, tracks, chips). `brass` was
        // the accent; it maps to ink, never volt: volt is never a text color
        // and appears once per view, through .btn-primary.
        paper: "rgb(241 238 231 / <alpha-value>)",
        paper2: "rgb(251 250 247 / <alpha-value>)",
        paper3: "rgb(239 235 227 / <alpha-value>)",
        ink: "rgb(20 18 15 / <alpha-value>)",
        ink2: "rgb(107 102 94 / <alpha-value>)",
        muted: "rgb(107 102 94 / <alpha-value>)",
        brass: "rgb(20 18 15 / <alpha-value>)",
        brassink: "rgb(251 250 247 / <alpha-value>)",
        coral: "rgb(181 58 38 / <alpha-value>)",
        ok: "rgb(31 122 74 / <alpha-value>)",
        warn: "rgb(20 18 15 / <alpha-value>)",
        danger: "rgb(181 58 38 / <alpha-value>)",
        background: "rgb(241 238 231 / <alpha-value>)",
        surface: "rgb(251 250 247 / <alpha-value>)",
        primary: "rgb(20 18 15 / <alpha-value>)",
        accent: "rgb(20 18 15 / <alpha-value>)",

        // creatorsplan v2 tokens by name (design_handoff_creatorsplan_rebrand).
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
        rule: "var(--cp-line)",
        rule2: "var(--cp-line-strong)",
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
