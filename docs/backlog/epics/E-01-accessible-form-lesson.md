---
id: E-01
title: First lesson — the accessible contact form
status: idea
priority: P0
domain: frontend
owner: claude
parents: []
acceptance: []
size: small
---

## Why

I want to learn what makes a form usable for someone with a screen reader. The fastest way to internalize the difference is to see two versions side by side and exercise both with a real screen reader — a "broken" version full of common mistakes and a "fixed" version that does it right. The lesson teaches by contrast, not by abstract rules.

## Raw notes

- The page should be mobile-first.
- Keyboard navigation has to feel obvious — Tab order should match visual order.
- Form has the typical fields: name, email, message, a "subscribe?" checkbox, submit.
- Each field needs proper labels, errors that get announced, and a submit confirmation that doesn't just rely on color.
- The "broken" version should use placeholders-as-labels, divs-as-buttons, color-only error states. Things that LOOK fine but fail with assistive tech.
- The "fixed" version uses native semantics, real labels, aria-describedby for errors, focus management on submit, polite live region for status.
- Wrap the lesson with a small narrative panel that says "what to try with your screen reader" — a checklist of 4-5 specific things to do.

## Open questions for the PO

- Should the broken / fixed toggle be inline (one page, switch) or separate routes?
- Do we persist anything (localStorage progress) or is the lesson stateless?
- Do we include an automated a11y test (axe) as part of the lesson's build, or save that for a later "automated audits" lesson?
