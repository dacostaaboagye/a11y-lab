/*
 * Persistent panel listing concrete actions to perform with a screen reader
 * on each version. The same checklist applies to both versions so the
 * contrast is direct.
 *
 * Layout: below the form on mobile (single column), beside it at lg+.
 * The panel is part of the natural tab order (no focus trap) and uses
 * a heading so the screen reader's region/heading navigation lands here
 * naturally.
 */
export function ScreenReaderChecklist() {
  return (
    <aside
      aria-labelledby="sr-checklist-heading"
      className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted-surface)] p-5 sm:p-6"
    >
      <h2
        id="sr-checklist-heading"
        className="text-base font-semibold tracking-tight"
      >
        Try this with your screen reader
      </h2>
      <p className="mt-1 text-sm text-[color:var(--color-muted)]">
        Run each step on both versions. The same actions, very different
        results.
      </p>

      <ol className="mt-4 space-y-3 text-sm">
        {ITEMS.map((item, idx) => (
          <li key={item.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white text-xs font-semibold text-[color:var(--color-foreground)] ring-1 ring-[color:var(--color-border)]"
            >
              {idx + 1}
            </span>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-[color:var(--color-muted)]">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-xs text-[color:var(--color-muted)]">
        Tip: VoiceOver on macOS/iOS or NVDA on Windows. Use the screen
        reader&apos;s form-controls navigation (e.g. F in NVDA, VO+Cmd+J in
        VoiceOver) to enumerate inputs.
      </p>
    </aside>
  );
}

const ITEMS = [
  {
    title: "Tab to the first field — does it announce a label?",
    detail:
      "Broken: silence or 'edit text'. Fixed: name, type, and required state.",
  },
  {
    title: "Submit empty — what (if anything) is announced?",
    detail:
      "Broken: nothing useful. Fixed: focus moves to the first invalid field and the linked error reads.",
  },
  {
    title: "Tab to the submit button.",
    detail:
      "Broken: tab skips it — a styled div isn't focusable. Fixed: a real <button> takes focus and announces its role.",
  },
  {
    title: "Fill everything in and submit.",
    detail:
      "Broken: a green check appears, no audio. Fixed: the polite live region announces the success.",
  },
  {
    title: "Use the form-controls shortcut to enumerate inputs.",
    detail:
      "Broken: the count is wrong (no submit button) and labels are missing. Fixed: every control is enumerated with role + label.",
  },
];
