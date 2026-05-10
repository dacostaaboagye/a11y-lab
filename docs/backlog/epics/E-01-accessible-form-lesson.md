---
id: E-01
title: First lesson — the accessible contact form
status: tested
priority: P0
domain: frontend
owner: claude
parents: []
acceptance:
  - Single route hosts both versions with an inline toggle, default landing on broken so the contrast is the first thing learned.
  - Broken version exhibits placeholders-as-labels, div-as-button, and color-only error states — each failure is intentional and documented.
  - Fixed version uses native semantics, programmatic label association, aria-describedby for errors, focus management on submit, and a polite live region for status.
  - Tab order matches visual order in both versions; no positive tabindex anywhere.
  - Each version is wrapped by a "what to try with your screen reader" panel listing 4-5 concrete actions tied to the failure modes.
  - Submit confirmation is conveyed via text + icon + live region announcement, never color alone.
  - Layout is mobile-first; touch targets meet 44x44 CSS px minimum on the fixed version.
  - Lesson is stateless — no persistence, no progress tracking; reload returns the user to the default broken view.
size: small
---

## Why

I want to learn what makes a form usable for someone with a screen reader. The fastest way to internalize the difference is to see two versions side by side and exercise both with a real screen reader — a "broken" version full of common mistakes and a "fixed" version that does it right. The lesson teaches by contrast, not by abstract rules: each failure in the broken version maps to a specific repair in the fixed version, and the screen-reader checklist forces me to feel the difference rather than read about it.

## Acceptance

- **Single-page contrast.** One route renders both versions, switched by an inline toggle (radio group or segmented control). Landing state is "broken" so the friction is felt before the fix is shown. *Teaches: an a11y problem is something you experience, not something you read about.*
- **Broken version is faithfully broken.** Placeholders stand in for labels; submit is a styled `<div onClick>`; required-field errors are conveyed only by red border + red helper text with no programmatic association. The breakage is deliberate and each defect maps to one item in the screen-reader checklist. *Teaches: what "looks fine" looks like when it isn't.*
- **Fixed version uses platform semantics first.** `<form>`, `<label for>` (or wrapping label), `<input>`, `<button type="submit">`, `<fieldset>`/`<legend>` only where it earns its keep. ARIA is added only where semantics fall short (error association, live region). *Teaches: ARIA is the patch, HTML is the foundation.*
- **Errors are announced, not just shown.** On submit with invalid fields: focus moves to the first invalid input, the error message is linked via `aria-describedby`, and the input carries `aria-invalid="true"`. *Teaches: a sighted user sees the error; a screen-reader user has to be told.*
- **Success is announced, not just colored.** Successful submit clears the form, moves focus to a confirmation region, and writes a message into an `aria-live="polite"` region. The confirmation also uses text + icon, never color alone. *Teaches: status changes need a non-visual channel.*
- **Keyboard parity.** Tab order matches visual order in both versions; every interactive element is reachable and operable from the keyboard; visible focus ring is preserved (no `outline: none` without a replacement). The broken version's div-button is intentionally unreachable by keyboard to make the failure obvious. *Teaches: if you can't Tab to it, it doesn't exist.*
- **Mobile-first layout.** Single-column at small widths, comfortable touch targets (≥44 CSS px) on the fixed version, no horizontal scroll at 320px. *Teaches: a11y and mobile constraints reinforce each other.*
- **Screen-reader checklist panel.** A persistent side/below panel lists 4-5 specific things to try (e.g., "navigate by form controls", "submit with empty fields and listen", "Tab to the submit button"). The same checklist applies to both versions so the contrast is direct. *Teaches: structured practice beats poking around.*
- **Stateless.** No localStorage, no progress tracking, no analytics. Reload returns the default broken view. *Teaches: keep the lesson surface small so the a11y signal isn't drowned in app concerns.*

## Out of scope

- Automated axe / lighthouse / pa11y assertions in CI — deferred to a future "automated audits" lesson so this one stays focused on manual screen-reader practice.
- Backend submission. Submit is simulated client-side; no API route, no email, no persistence.
- Internationalization, RTL, locale-aware validation.
- Dark-mode tokens, theming, design-system extraction. Use plain Tailwind or CSS modules — whatever the scaffold gives.
- A "third" hybrid version or a granular per-defect toggle. Two versions, one toggle.
- Progress tracking, lesson completion, or any cross-lesson state.

## Edge cases

- User submits the broken form with the keyboard — the div-button doesn't fire. This is the intended failure; document it in the checklist rather than fix it.
- User toggles between broken and fixed mid-input. Form state resets on toggle so each version starts clean and the contrast isn't muddied by stale values.
- Rapid double-submit on the fixed version: button disables on submit and re-enables after the simulated response so the live region isn't spammed.
- Live region fires before the screen reader is ready (region added to DOM at the same time as the message). Mount the live region on initial render with empty content, then update its text on submit.
- User tabs past the form into the checklist panel — panel must be reachable and readable, not a focus trap and not skipped.
- Long error messages wrap; ensure `aria-describedby` still references a single id and the visual layout doesn't push the input off-screen on 320px.
- iOS VoiceOver vs. desktop NVDA announce live regions slightly differently. Use `aria-live="polite"` + `role="status"` on the confirmation region for the broadest support.

## UAT scenarios

Run each scenario on both versions with a real screen reader (VoiceOver on macOS/iOS or NVDA on Windows) and a keyboard only.

1. **Label discovery.** Activate the screen reader. Tab to the first field. Expected on broken: the field announces its placeholder once and goes silent, or announces "edit text" with no label. Expected on fixed: the field announces its label, type, and required state.
2. **Empty submit.** Tab to the submit control and activate it (Enter/Space) with all fields empty. Expected on broken: nothing happens (div-button isn't keyboard-operable), or errors appear visually but the screen reader says nothing useful. Expected on fixed: focus moves to the first invalid field and the error is announced via the described-by association.
3. **Error recovery.** Fix the first error and re-submit. Expected on fixed: the next invalid field is focused and announced; previously corrected fields no longer announce as invalid.
4. **Success announcement.** Fill all fields validly and submit. Expected on broken: a green check appears with no audible feedback. Expected on fixed: the live region announces the success message and focus moves to the confirmation; the message is intelligible without seeing the green color.
5. **Checklist walkthrough.** Use the screen reader's form-controls navigation shortcut to jump between fields on each version. Expected: on broken, the count and labels of controls are misleading (the div-button is missing, placeholders aren't labels); on fixed, every control is enumerated correctly with its role and label.

## Dependencies

[]

## Open questions

None blocking. Recommendations made on the three input questions:
- **Toggle vs. routes:** inline toggle on a single route (preserves side-by-side mental model; avoids navigation cost mid-lesson).
- **Persistence:** stateless (lesson is a kata, not an app; persistence would dilute the a11y signal).
- **Automated a11y test:** deferred to a future lesson so this one stays a manual screen-reader practice exercise.

## Slice

This is a frontend-only epic: no backend, no QA-as-write-code in the build stage (QA still writes tests at Stage 5), no contract drift risk. The slice exists to name (a) what's frozen, (b) what the frontend specialist owns, and (c) what scaffold is part of this epic vs assumed.

**Frozen paths** (read-only after this stage until re-slice):

- `packages/contracts/**` — the type contract for the lesson (currently just `Lesson` in `@a11y-lab/contracts`). Frontend may import; not modify.

**Scaffold included in this epic** (since `apps/web` is currently a stub):

- Initialize Next.js 16 + React 19 + TypeScript in `apps/web` using the App Router.
- Tailwind CSS 4 set up with a minimal token surface — focus ring, semantic colors (foreground / muted / accent / danger / success), spacing. No shadcn / no design system extraction yet — that's a future epic.
- Root layout with `<html lang="en">` + `<body>` + a generic skip-link to `#main`.
- A single route at `/lessons/contact-form` for the lesson.
- Bare-minimum Next.js config (no images domain config yet; no env handling beyond what Next ships with).

**Frontend slice** (`feature/e-01-accessible-form-lesson--frontend`):

- *Files frontend may write:*
  - `apps/web/**` — Next.js scaffold + the lesson route + components + tokens.
  - `packages/contracts/src/index.ts` — read-only after slice freeze; frontend imports only.
- *Components to build* (suggested decomposition; specialist may refine):
  - `<LessonChrome>` — page wrapper that renders the toggle + a header + slot for the active version + the screen-reader checklist panel.
  - `<VersionToggle>` — accessible segmented control / radio group for switching broken vs fixed. Default state: broken.
  - `<BrokenContactForm>` — faithful failure-mode form (placeholders-as-labels, div-as-submit, color-only errors). Self-contained component.
  - `<FixedContactForm>` — accessible form (native semantics, label associations, `aria-describedby`, focus management, polite live region). Self-contained component.
  - `<ScreenReaderChecklist>` — sidebar / below-fold panel listing 4–5 concrete actions to try.
- *State ownership:* local component state via `useState` for form values + validation. No global store, no React Query (stateless lesson, no API). Toggle state lives in `<LessonChrome>` and resets form state when flipped.
- *Tokens to add* under `apps/web/src/app/globals.css`: `--color-foreground`, `--color-muted`, `--color-accent`, `--color-danger`, `--color-success`, `--ring-color`, `--ring-width`. Use these via Tailwind's `@theme` directive (Tailwind 4 syntax).
- *Mobile-first:* single-column layout at <768px. `<ScreenReaderChecklist>` collapses below the form on mobile, sits to the side on ≥1024px.

**QA slice** (post-integrate, on `feature/e-01-accessible-form-lesson--qa`):

- Component tests (Vitest + Testing Library): each form variant renders, validates correctly, behaves on submit.
- A11y assertions: focus moves on submit-with-errors; `aria-invalid` toggles; live region announces.
- Manual screen-reader plan as enumerated in the existing `## UAT scenarios`.

**Build commands** (from `.shipwright.yml` `verify.detected`):

- Install: `pnpm install` (will pull Next.js + React + Tailwind into `apps/web`).
- Verify: `pnpm verify` (currently echoes ok; specialist should refine to actually run lint + typecheck + test once those exist).
- Format: `biome` if added; otherwise `pnpm exec next lint`.

**Out of scope for this slice** (reaffirming the refined epic):

- No backend submission, no API route, no contract additions beyond the existing `Lesson` type.
- No automated a11y testing in CI (axe / pa11y).
- No design-system extraction; one-off Tailwind tokens are fine.
- No theming / dark-mode wiring (can be added in a follow-up).
- No additional lessons; this epic ships the contact-form lesson only.

## Test plan

### Automated tests (pnpm verify)

7 test files, 23 tests total, all passing.

- `version-toggle.test.tsx` (2): default broken; toggling resets form state.
- `broken-contact-form.test.tsx` (3): pinning-tests for the failures (no `<label>`, div-as-submit, no `aria-invalid`). These fail loudly if the broken form is ever "fixed" — the lesson's contrast depends on those failures staying intact.
- `fixed-contact-form.test.tsx` (3): focus moves to first invalid; focus moves to next invalid after first fixed; success live-region populates and form clears.
- `keyboard-and-touch.test.tsx` (5): no positive `tabIndex`; visual order = DOM order; touch targets ≥44px on the fixed version.
- `fixed-live-region.test.tsx` (2): live region present in initial DOM with empty text; success uses text + icon + region focus, never color alone.
- `fixed-edge-cases.test.tsx` (4): `aria-describedby` always single id; describedby clears on correction; double-submit absorbed; `aria-busy` + "Sending…" during pending.
- `lesson-chrome.test.tsx` (4): checklist `<aside>` with ≥4 items, not hidden; coexists with both versions; 4-cycle toggle leaves clean state; mid-pending toggle doesn't leak success markup.

### Manual verification — screen reader + keyboard

Run on macOS (VoiceOver, Cmd+F5) or Windows (NVDA). Use a keyboard only — no trackpad / mouse. Each step has expected results on **broken** and on **fixed**; both must hold for the PR to merge.

Setup: `pnpm --filter @a11y-lab/web dev` and open `/lessons/contact-form`. The page must land on broken by default.

- [ ] **1. Default landing.** Reload the page. Confirm "Broken (default)" toggle is selected and the broken form is visible. *Expected:* always returns to broken — no localStorage persistence.
- [ ] **2. Label discovery (broken).** SR active, Tab once into the form. *Expected on broken:* "edit text" or only the placeholder once; no programmatic label, no required state.
- [ ] **3. Label discovery (fixed).** Toggle to fixed. Tab to the first field. *Expected:* "Your name, required, edit text" (or platform equivalent — label, type, required).
- [ ] **4. Empty submit (broken).** Return to broken. Tab through every field, then keep tabbing. *Expected:* Tab skips the "Send message" div entirely. No keyboard path to submit. Pressing Enter on the last input does nothing audible.
- [ ] **5. Empty submit (fixed).** Toggle to fixed. Tab to submit. Press Enter. *Expected:* focus jumps to "Your name"; SR announces the field's label *and* "Name is required" via `aria-describedby`. Button isn't focused after.
- [ ] **6. Error recovery (fixed).** Type "Ada Lovelace" into Your name. Tab to submit, press Enter. *Expected:* focus to Email; "Email is required" announced. Name is no longer reported invalid.
- [ ] **7. Success announcement (broken).** Fill all fields validly, click the green "Send message" div with the mouse (you can't tab to it). *Expected:* green check appears; SR says nothing.
- [ ] **8. Success announcement (fixed).** Fill all fields validly. Tab to submit, press Enter. *Expected:* button shows "Sending…" and disables briefly; ~700ms later polite live region announces "Message sent. We'll be in touch soon." Focus on the success region. Message intelligible without seeing the green color.
- [ ] **9. Double-submit guard (fixed).** With form valid, press Enter on submit, then *immediately* press Enter several more times. *Expected:* one announcement only.
- [ ] **10. Form-controls navigation.** Use SR's form-controls shortcut (NVDA: F. VoiceOver: VO+Cmd+J). *Expected on broken:* control count is wrong (no submit enumerated); inputs unlabelled. *Expected on fixed:* every control enumerated with role + label, including "Send message" button.
- [ ] **11. Checklist panel reachability.** Tab past the submit button on either version. *Expected:* tab moves into the "Try this with your screen reader" panel; SR reads the heading and items. No focus trap; Shift+Tab returns through the form.
- [ ] **12. Mobile layout sanity.** Resize to 320px wide. Scroll. *Expected:* no horizontal scroll. Form stays single-column. Checklist sits below the form, not beside it. Touch targets ~44px tall.
- [ ] **13. Visible focus ring.** Tab through every interactive element on both versions. *Expected:* every focusable element shows a visible focus indicator. No bare `outline: none`.

