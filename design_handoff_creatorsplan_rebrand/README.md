# Handoff: creatorsplan rebrand (v2)

## Overview
A full visual rebrand of creatorsplan, moving from a dark, neon-cyan, marble-Zeus look to a bright, minimal one: warm paper, black ink and one volt yellow. It covers the logo, design tokens, all six app screens, a marketing landing page and a 20-second brand film.

## About the design files
The `.dc.html` files are **design references built in HTML**. They are prototypes that show the intended look and behavior, not production code. Recreate them in the existing creatorsplan codebase (the Vite app at `localhost:5175`) using its framework, router, component patterns and data layer. Do not copy the HTML in or ship it. Open any file in a browser to see it running; `support.js` is only the runtime for these previews.

## Fidelity
**High fidelity.** Colors, type, spacing, radii, copy and interactions are final. Match them closely using the codebase's own primitives. Where an existing component already does the job (tabs, inputs, steppers), restyle it rather than rebuilding it.

## Implementation order
1. Add the design tokens (below) as CSS variables or theme config, plus the fonts.
2. Replace the logo and favicon, and restyle global primitives: buttons, inputs, cards, badges, segmented control, stepper and nav item.
3. Re-skin the app shell (sidebar and main area), then each screen in turn.
4. Rewrite UI copy to sentence case (see Voice).
5. Landing page (if the app hosts one).

---

## Design tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `--cp-ink` | `#14120F` | Text, icons, secondary buttons, active nav background |
| `--cp-ink-2` | `#6B665E` | Muted body text (≈5.6:1 on paper) |
| `--cp-ink-3` | `#9A948A` | Placeholders and disabled text only |
| `--cp-line` | `#E5E0D6` | Borders and dividers |
| `--cp-line-strong` | `#D6D0C4` | Input and secondary-button borders |
| `--cp-paper` | `#FBFAF7` | Cards, panels, sidebar, landing background |
| `--cp-canvas` | `#F1EEE7` | App background behind paper |
| `--cp-field` | `#FFFFFF` | Input fill |
| `--cp-tint` | `#EFEBE3` | Segmented-control track, progress track, nav hover |
| `--cp-volt` | `#FFCF1A` | Primary CTA, current step, logo. **At most one per view; never used as a text color** |
| `--cp-volt-soft` | `#FFF1B8` | Selected card fill, focus ring |
| `--cp-volt-hover` | `#FFF8DB` | Dropzone hover |
| `--cp-go` / `--cp-go-bg` | `#1F7A4A` / `#E3F2E8` | Connected, ready, published |
| `--cp-stop` / `--cp-stop-bg` | `#B53A26` / `#F8E4DF` | Errors, over-limit counters |
| Dark section | `#14120F` bg, `#B5AFA5` muted text, `#3A3631` borders | Landing "Tools" band only |

### Typography
- **Hanken Grotesk** (400/500/600/700) for all UI and headlines.
- **Geist Mono** (400/500) for **metadata only**: step numbers, file limits, prices, timecodes and eyebrow labels. Never for headlines or buttons.
- Both are on Google Fonts.

| Role | Size / weight | Letter-spacing | Line-height |
|---|---|---|---|
| Display (landing) | clamp(52px, 8.5vw, 120px) / 600 | -0.05em | 0.92 |
| Screen H1 (app) | 44px / 600 | -0.035em | 1.05 |
| Section H2 | 22px / 600 | -0.015em | 1.2 |
| Card title | 17–19px / 600 | 0 | 1.3 |
| Body | 16–17px / 400 | 0 | 1.55 |
| Small | 13–14px / 400 | 0 | 1.45 |
| Eyebrow / label | Geist Mono 12px / 500, UPPERCASE | 0.06em | — |
| Badge | Geist Mono 10–11px / 500, UPPERCASE | 0.05em | — |

### Spacing, radius and shadow
- Spacing: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 96.
- Radius: 6 (tiny chips), 8–10 (thumbnails), 12 (inputs, nav items, segmented), 14–16 (selection cards, dropzone), 20 (cards/panels), 999 (buttons, pills).
- Shadows: none except (a) the volt button's hard `0 2px 0 #14120F`, and (b) the segmented control's active pill, `0 1px 2px rgba(20,18,15,.12)`.

### Motion (only three curves)
- **Settle:** 140–200ms `cubic-bezier(.2,.8,.2,1)` for hover, focus and selection (color, border, ≤2px movement).
- **Rise:** 320ms, 8px up plus a fade on screen mount, step-panel change and new results. Lists stagger 40–60ms per item.
  `@keyframes cpRise { from {opacity:0; transform:translateY(8px)} to {opacity:1; transform:none} }`
- **Strike:** brand only. The bolt drops 5–6px into the frame over 600ms when the logo first mounts. Never use it on routine UI.
- Respect `prefers-reduced-motion`: disable Rise and Strike.

---

## Logo: "The Short Frame"
A 9:16 rounded rectangle (the shape of a short) with a lightning bolt inside, next to the lowercase wordmark **creatorsplan** (Hanken Grotesk 700, letter-spacing -0.04em to -0.045em).

The mark is an SVG with viewBox `0 0 28 46`:
```svg
<svg viewBox="0 0 28 46" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="26" height="44" rx="7" fill="#FFCF1A" stroke="#14120F" stroke-width="2"/>
  <path d="M16.5 8 L7.5 24.5 H13.5 L11.5 38 L20.5 21 H14.5 Z" fill="#14120F"/>
</svg>
```
- **On ink:** volt fill, no stroke. **On volt:** no fill, ink stroke 2.4.
- **App icon / favicon:** ink rounded tile (radius ≈ 23% of size) with the volt frame, no stroke. At 24px and below, drop the stroke.
- **Spacing:** gap between mark and wordmark ≈ 0.45× the mark width. Clear space equals the mark width on every side. Minimum height 18px.
- The name is always lowercase ("creatorsplan"), in the logo and in copy.
- Delete the old marble-Zeus assets and favicon.

---

## App shell
- **Grid:** `248px | minmax(0,1fr)`, min-height 100vh. Main background `--cp-canvas`.
- **Sidebar:** `--cp-paper`, 1px right border `--cp-line`, padding 24px 14px, sticky at full height. It contains, top to bottom:
  - Logo: mark 15×25 plus wordmark at 19px.
  - Group label "CREATE" (mono 11px, `--cp-ink-3`, 0.08em) above Clip generator, AI shorts (BYOK), YouTube studio.
  - Group label "LIBRARY" above Gallery (count "24"), Agents (BYOK).
  - Pinned to the bottom: a plan card (border `--cp-line`, radius 14, padding 14: "Creator plan" + "340 / 500", a 6px progress bar with ink fill, "Credits reset Oct 18"), then the Settings nav item with a 26px volt avatar circle showing the initial.
- **Nav item:** 42px tall, radius 12, padding 0 12px, gap 12, 18px icon (stroke 1.8), label 15px/500.
  - Inactive: transparent background, ink text, `--cp-ink-2` icon.
  - **Active:** `--cp-ink` background, `--cp-paper` text, **volt icon**.
  - Background and color animate over 160ms.
- **Main:** padding 56px 40px 96px, content max-width 880px, centered.
- **Screen header:**
  - Eyebrow (mono 12px, e.g. `01 · CLIP GENERATOR`).
  - H1 44px.
  - Subtitle 17px `--cp-ink-2`, max-width 620px.
  - Gaps of 12px within the header and 32px before the content.
- **Icons:** simple 24-grid strokes (lucide-style). **No sparkle icons anywhere.** AI shorts uses a portrait-in-frame icon.

## Core components
- **Primary (volt) button:** 48–56px tall, pill, 1.5px ink border, volt fill, 600 15–17px text, `box-shadow: 0 2px 0 #14120F`.
  - Hover: translateY(-1px) and a 3px shadow. Active: translateY(2px) and no shadow.
  - Only one per view.
- **Ink button:** pill, ink background, paper text. Hover `#2E2A25`.
- **Secondary button:** pill, 1px `--cp-line-strong` border, paper background. Hover: border turns ink.
- **Text button:** underlined (offset 3px), e.g. "Back".
- **Disabled button:** `--cp-line` background, `--cp-ink-3` text, no border or shadow.
- **Input / textarea:** 48–52px tall, radius 12, 1px `--cp-line-strong` border, white fill, padding 0 16px, 15px text.
  - Focus: ink border plus `0 0 0 4px #FFF1B8`.
  - Label 14–15px/600, optional hint as "· optional" in muted 400, helper text 13px muted below.
- **Selection card** (format, mode, presenter, hook):
  - Radius 16, `1.5px solid` border in `--cp-line` at rest. Keep the border width constant so nothing shifts.
  - **Selected:** ink border plus `--cp-volt-soft` fill. Any small glyph inside fills volt.
  - Radio-style items show an 18px ring with an 8px ink dot.
- **Segmented control:** `--cp-tint` track, radius 12, padding 4, options 34–36px tall at radius 9 and 13px/600. Active option is white with the soft shadow.
- **Tabs (upload / link):** 52px tall, 15px/600, 16px icon, active is ink text with a 2px ink underline, inactive is muted. Sits on a 1px `--cp-line` baseline.
- **Stepper:** a row of steps with connecting 2px lines.
  - Done: 28px ink circle with a paper check; clickable to go back.
  - **Current:** a volt pill (28px tall, 1.5px ink border) showing the mono number and label, e.g. "02 Analysis".
  - Upcoming: 28px circle with 1px `--cp-line-strong` border and a mono number.
  - Connecting lines are ink when done, otherwise `--cp-line`. **Only the current step shows its label.**
- **Dropzone:** 1.5px dashed `--cp-ink-3`, radius 16, padding 44px. Hover: `--cp-volt-hover` fill and ink border.
  - Content: a 44px ink circle holding a volt upload icon, the title "Drop a video here, or browse" (17px/600), and the limits line `MP4, MOV · UP TO 500MB · AT LEAST 45S` in mono 12px.
- **Badges:** pill, 24–30px tall, mono 10–12px uppercase.
  - RECOMMENDED: ink fill with paper text.
  - BEST QUALITY / BYOK: 1px ink outline.
  - CONNECTED / READY / PUBLISHED: go colors.
- **Progress:** 4–8px track in `--cp-tint` with ink fill, fully rounded.
- **Toggle:** 44×26 track (ink when on, `--cp-line-strong` when off) with a 20px white knob that slides 18px over 200ms.
- **Media placeholders:** `repeating-linear-gradient(135deg,#E5E0D6 0 8px,#EDE9E1 8px 16px)`. Replace with real thumbnails.

---

## Screens

### 01 Clip generator
- **Header copy:**
  - H1 "Turn long videos into shorts".
  - Subtitle "Drop in a long video. We'll find the moments worth posting, reframe them and add captions."
  - Link line "Prefer to automate it? Connect Claude, ChatGPT or n8n →", which goes to Agents.
- **Card** (paper, radius 20, padding 8/28/28) contains:
  - Tabs: Upload file / Video link.
  - The dropzone. After a file is chosen it becomes a file row: thumbnail, name, a progress bar showing "Uploading N%" that changes to "412 MB · 48:12", and a Remove button.
  - On the Video link tab, a URL input instead.
  - "Output format": 3 selection cards. 9:16 "Shorts · Reels · TikTok", 1:1 "Feed posts", 16:9 "Keep landscape · YouTube". Each has a glyph in that aspect ratio.
  - "Advanced options": collapsible, with the chevron rotating -90° to 0°. Two segmented controls: Clip length (15–30s / 30–60s / 60–90s) and Captions (Clean / Bold / None).
  - Divider, then a footer row: a custom checkbox ("I own this video or have the rights to edit and publish it.") and the volt "Generate clips →".
  - While the button is disabled, a hint sits beside it: "Add a video first", "Paste a link first" or "Confirm the rights checkbox".
- **Running state:** a card with the stage label ("Transcribing" → "Finding the best moments" → "Reframing and adding captions"), a mono percentage and an 8px progress bar.
- **Done state:** "4 clips worth posting" with a "Start a new video" link, then a list of rows that Rise in staggered. Each row has:
  - A 64×112 thumbnail with a duration chip.
  - The title (17px/600) and a mono time range.
  - A "Hook score" with a mono number and a 4px bar.
  - A Download button.

### 02 AI shorts (BYOK)
- **Header copy:** H1 "Make a UGC-style ad". Subtitle "Describe a product and an AI presenter will talk about it on camera."
- **Steps:** Setup → Analysis → Presenter → Generate → Result.
- **Setup:**
  - "Video quality" cards. Standard has RECOMMENDED, "~$0.80 / VIDEO" and "Hailuo 2.3 + VEED Lipsync…". Premium has BEST QUALITY, "~$2.00 / VIDEO" and "Kling Avatar v2…".
  - Website (optional) input.
  - "What are you selling?" textarea.
  - Language pills: English / Spanish / Portuguese / German.
  - Ink "Analyze" button, disabled until a website or description is entered.
- **Analysis:**
  - "Here's what we understood": 3 white fact cards (PRODUCT / AUDIENCE / ANGLE).
  - "Opening line": 3 radio cards.
  - Back / Continue.
- **Presenter:**
  - 4-up grid of 3:4 portrait cards (name and tone).
  - Length segmented control (15s / 30s / 45s).
  - Volt "Generate video" button with the mono cost.
- **Generate:** progress card ("Writing the script" → "Animating {name}" → "Syncing voice and lips") plus "This usually takes 2–4 minutes…".
- **Result:**
  - A 240px-wide 9:16 preview with an ink play button.
  - READY badge and "{cost} CHARGED TO YOUR KEY".
  - The hook as a 28px title, with meta "Lucía · English · 30s · 9:16".
  - "Download MP4" (ink) and "Make another" (secondary).

### 03 YouTube studio
- **Header copy:** H1 "Package a video for YouTube". Subtitle "Title, thumbnail and description in one pass, then publish straight to your channel."
- **Steps:** Input → Title → Thumbnail → Description → Publish.
- **Input:** two cards side by side.
  - **Option A, "Start from the video":** dropzone that turns selected when a file is in, plus a "Suggest titles" ink button (disabled with no file).
  - **Option B, "I have a title":** input (max 70 characters), a helper line "Under 60 characters shows in full on mobile", a mono counter `N / 70` that turns stop-red above 60, and "Use this title →" (ink once there is text). This path skips to Thumbnail.
- **Title:** 5 radio cards, each showing its character count in mono.
- **Thumbnail:** 3 selection cards with 16:9 placeholders ("Face + big number", "Before / after", "Room wide shot").
- **Description:** textarea pre-filled with chapters, plus tag pills.
- **Publish:**
  - Preview card on the left.
  - On the right: Visibility segmented control (Public / Unlisted / Private), "Publishing to **{channel}** · {subs}", and the volt "Publish to YouTube".
  - Success state: PUBLISHED badge, "It's live on your channel.", then "Open on YouTube" / "Package another".

### 04 Gallery
- H1 "Everything you've made". Segmented filter on the right: All / Clips / AI shorts / Thumbnails.
- Grid `repeat(auto-fill, minmax(180px, 1fr))`, gap 16.
- Each item: 9:16 tile (radius 16), type badge top-left (paper chip, mono), duration bottom-right (ink chip), then title (14px/600) and date (12px muted).
- Tile hover: ink border and translateY(-2px). Items Rise in with a stagger.

### 05 Agents (BYOK)
- **Header copy:** H1 "Let an agent do the busywork". Subtitle "Connect the assistant you already use. It can clip videos, write titles and schedule posts with your keys."
- **Provider card** with rows for Claude ("Through our MCP server"), ChatGPT ("As a custom GPT action") and n8n ("HTTP node with your API key").
  - Each row: 44px tint tile with the initial, name and description, a CONNECTED badge when on, and a Connect (ink) / Disconnect (secondary) button.
- **MCP endpoint:** mono field plus a Copy button that shows "Copied" for 1.4s.
- **"Recent agent runs":** rows laid out as `90px | 1fr | 90px` (mono source, description, time).

### 06 Settings
- Three sections laid out as `200px | 1fr`, each with a top border:
  - **Your keys:** "AI shorts and agents run on your own accounts. We never mark up usage." Rows for fal.ai / OpenAI / ElevenLabs with a masked mono value and Replace / Add key.
  - **Defaults:** toggle rows "Burn in captions", "Add watermark", "Email me when jobs finish", each with a description.
  - **Account:** Name and Email inputs.

---

## Landing page
In order:
1. **Header:** logo; links Tools / Your keys / Log in; ink "Start free" pill.
2. **Hero** (centered):
   - Eyebrow "FOR PEOPLE WHO MAKE VIDEOS".
   - Display "Post more. / Edit less." with "less." on a volt highlight.
   - Subtitle "creatorsplan turns your long videos into shorts, makes UGC-style ads and packages your YouTube uploads. It all runs on your own AI keys."
   - Volt "Drop in your first video →" and secondary "How it works".
3. **Hero visual:** a canvas panel (radius 28) on a 6s loop.
   - Three 9:16 cards (1.5px ink border, captions with volt highlights) rise in staggered by 0.25s.
   - Under them, a timeline bar with a scanning ink playhead (linear, 6s) and three volt segments that light up.
4. **How it works:** H2 "One video in, a week of posts out.", then 3 columns (01 Drop it in / 02 We find the moments / 03 Post or schedule).
5. **Tools:** full-bleed ink band, H2 "Four tools, one workspace.", then a 2×2 grid of outlined cards (border `#3A3631`, volt on hover).
6. **Your keys:** H2 "You pay the model, not a markup.", with the Standard (~$0.80) and Premium (~$2.00) cost cards.
7. **Final CTA:** volt block with an ink border, radius 28, "Your next video / is already shot.", and an ink "Start free →".
8. **Footer:** mark, wordmark and © 2026; Terms / Privacy / Contact.

Responsive behavior: the sections use clamp() for headline sizes. On mobile, collapse multi-column grids to one column.

## Voice
- **Sentence case everywhere**, except the lowercase "creatorsplan" name and UPPERCASE mono labels.
- Say what happens. Avoid "viral", "instantly", "AI-powered" and sparkle icons.
- Examples:
  - "create viral shorts" → "Turn long videos into shorts"
  - "analyze & get titles" → "Suggest titles"
  - "ugc gallery" → "Gallery"
  - "ai agent" → "Agents"

## State (per the prototype; map these to your real data and API)
- **Clip generator:** `tab`, `uploadProgress`, `url`, `format`, `advancedOpen`, `clipLength`, `captionStyle`, `rightsConfirmed`, `job: idle|running|done`, `jobProgress`, `clips[]`.
- **AI shorts:** `step` (0–4), `mode`, `site`, `description`, `language`, `hook`, `presenter`, `length`, `genProgress`.
- **YouTube studio:** `step` (0–4), `videoFile`, `customTitle`, `pickedTitle`, `thumbnail`, `visibility`, `published`.
- **Other:** gallery `filter`; agents `providers{}`; settings `toggles{}`.

## Brand film
`Brand Film.dc.html` with `brand-film.jsx` is a 20.5s, 1920×1080 looping motion piece for socials and the site hero. Export it to MP4 from the design tool. It is not app code.

## Files
- `Design System.dc.html`: tokens, logo usage and components
- `App Prototype.dc.html`: all six screens, clickable (logic is in its `<script data-dc-script>` block)
- `Landing Page.dc.html`
- `Brand Film.dc.html`, `brand-film.jsx`, `animations-v3.jsx`, `tweaks-panel.jsx`
- `support.js`: preview runtime only
