---
id: E-01
title: First lesson — the accessible contact form
status: refined
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
