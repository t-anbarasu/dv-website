# EQ OS — screen reference for the MVP build

Screens captured from the EQ OS clickable demo (version 5) for the build described in the PRD: *EQ OS — Product Requirements Document (MVP at eqos.drishtavidya.com)*.

## How to read these

- **Size:** phone width 390 points, captured at 2x (780 px wide). Each image shows the full scrolling length of the screen, between the top bar and the bottom navigation.
- **Theme:** light, except files 35–36 (dark mode). Both themes are required.
- **Data:** all names, messages and numbers are example content. Drishti's replies, rewrites, decodes and rehearsal feedback are **sample text**; in the real app they come from the AI through the server.
- **Fonts:** Bricolage Grotesque (headings) and Figtree (body), both from Google Fonts.
- **Behaviour:** the demo's own source is in `reference/eq-os-demo.html`. Open it in a browser to click through flows, see animations (breathing orb, Drishti presence) and inspect spacing and colours. It is a reference for look and behaviour, not production code.
- **Not shown:** sign-in, consent screens, voucher entry and data export; these are specified in the PRD (F1, F11, F12) and were not part of the demo.

## Screens

| File | Screen | PRD feature |
| --- | --- | --- |
| `screens/01-first-open-how-are-you.png` | First open: one question, no sign-up | F1, Flow A |
| `screens/02-first-open-first-tool.png` | First tool, then optional "Make it mine" | F1, Flow A |
| `screens/03-make-it-mine-language.png` | Make it mine: language (skippable) | F1 |
| `screens/04-make-it-mine-age-country.png` | Make it mine: age band and country | F1 |
| `screens/05-make-it-mine-goal.png` | Make it mine: goal | F1 |
| `screens/06-home-priya.png` | Home: Drishti bar, utilities, 60-second reset, ritual, For this moment, week ahead, intention | F2 |
| `screens/07-home-mark-week-ahead-picked.png` | Home (another user): week-ahead pick and role-based modes | F2, F14 |
| `screens/08-home-amina-go-deeper.png` | Home: "Want to go deeper?" program suggestion from own pattern | F2, F11 |
| `screens/09-home-lucas-portuguese.png` | Home in Portuguese, voice-first user | F2, F16 (language) |
| `screens/10-reset-ready.png` | 60-second reset: ready state (opens with no questions) | F3, Flow D |
| `screens/11-reset-running.png` | 60-second reset: breathing in progress | F3 |
| `screens/12-calm-my-reply-input.png` | Calm my reply: draft and recipient | F4, Flow B |
| `screens/13-calm-my-reply-feeling-word.png` | Calm my reply: feeling word asked inside the flow | F4, Flow B |
| `screens/14-calm-my-reply-result.png` | Calm my reply: calmer version and what changed | F4, Flow B |
| `screens/15-decode-input.png` | Decode someone else: who and what happened | F5, Flow C |
| `screens/16-decode-result.png` | Decode someone else: possibilities to check, then your own feeling | F5, Flow C |
| `screens/17-script-context-check.png` | Conversation script with the two-tap context check | F6, Flow E |
| `screens/18-script-rehearsal-feedback.png` | Rehearsal with Drishti and feedback on empathy, clarity, ownership | F6, Flow E |
| `screens/19-atlas-families.png` | Emotion Atlas: 11 families | F7 |
| `screens/20-atlas-intensity-ladder.png` | Emotion Atlas: words on an intensity ladder | F7 |
| `screens/21-atlas-emotion-at-5.png` | Emotion detail at 5/10: reflect-level tools and strategy | F7 |
| `screens/22-atlas-emotion-at-9-safety.png` | Emotion detail at 9/10: reset only, plus the safety check | F7, F13 |
| `screens/23-quick-check-in.png` | Quick check-in: one word and intensity | F7 |
| `screens/24-drishti-start.png` | Drishti companion: start with starter prompts | F8 |
| `screens/25-drishti-reply-with-tool.png` | Drishti reply naming the feeling and offering one tool | F8 |
| `screens/26-crisis-route.png` | Crisis route: local helpline and coach follow-up | F13 |
| `screens/27-tools-by-engine.png` | Tools grouped by engine, filter by moment | F9 |
| `screens/28-step-tool-in-progress.png` | Step-by-step reflection tool | F9 |
| `screens/29-step-tool-summary.png` | Reflection summary with "Reflect with Drishti" | F9 |
| `screens/30-ritual-close-the-day.png` | Evening ritual: close the day | F9 |
| `screens/31-grow-your-story.png` | Mirror: emotional weather, patterns from tool use, capability map, programs | F10, F11 |
| `screens/32-program-equip.png` | Program (EQUIP): modules with video slots and linked tools | F11 |
| `screens/33-video-placeholder-brief.png` | Video placeholder and its recording brief | F11, Content |
| `screens/34-profile-privacy.png` | Profile: what the OS knows, switches, who sees what | F12 |
| `screens/35-home-dark.png` | Home in dark mode | Non-functional: themes |
| `screens/36-calm-my-reply-dark.png` | Calm my reply in dark mode | Non-functional: themes |

## Colour and type tokens

Taken from the demo's CSS (`:root` in the reference file).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| bg | #EEF0F5 | #0D1018 | Page background |
| surface | #FFFFFF | #161A25 | Cards, bars |
| surface-2 | #F4F5F9 | #1C2130 | Soft cards |
| ink | #151925 | #ECEEF5 | Main text |
| muted | #5A6175 | #A1A8BB | Secondary text |
| line | #DCE0EA | #2A3043 | Borders |
| accent | #C8661A | #F0913E | Primary actions, Drishti |
| accent-soft | #FCEBDB | #3A2817 | Highlighted cards |
| crit | #B83A2E | #EE7466 | Crisis route only |

Emotion family colours (anger, fear, overwhelm, sadness, loneliness, shame, guilt, envy, contempt, surprise, joy) are listed as `--f-*` tokens in the reference file.
