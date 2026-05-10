# a11y-lab

A practice ground for building UIs that work for visually impaired users. Each lesson is a small exercise — a form, a modal, a navigation pattern, a data table — implemented two ways. The everyday way that breaks, and the accessible way that doesn't. The goal is to build muscle memory for accessibility, not just learn the rules.

## Stack

- pnpm monorepo
- `apps/web`: Next.js (added in a future epic)
- `apps/api`: small Node service (added when a lesson needs it)
- `packages/contracts`: shared types

## Why this exists

Most accessibility resources tell you what's right; few make you feel what's wrong. This repo is for both — the broken patterns and the fixes side by side, exercised with a real screen reader and a keyboard.

## Status

Early scaffold. First lessons land via Shipwright epics.
