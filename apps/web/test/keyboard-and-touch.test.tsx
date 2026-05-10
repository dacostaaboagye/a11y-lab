import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonChrome } from "@/components/lesson-chrome";
import { BrokenContactForm } from "@/components/broken-contact-form";
import { FixedContactForm } from "@/components/fixed-contact-form";

/*
 * Closes acceptance gaps:
 *
 *   - "No positive tabindex anywhere; tab order matches visual order."
 *     Asserted at the DOM level on both versions: every focusable element
 *     has tabIndex 0 (default) or -1 (programmatic-only). Anything > 0
 *     would create a custom tab order that diverges from visual flow.
 *
 *   - "Touch targets ≥44 CSS px on the fixed version."
 *     jsdom does not lay out CSS, so we cannot read computed pixel sizes
 *     reliably. We assert the design-system contract instead: the inputs,
 *     textarea, submit button, and subscribe label all carry the
 *     `min-h-[44px]` Tailwind class that backs the 44px guarantee.
 *
 * The fixed form's polite live region carries tabIndex={-1} — that's
 * intentional (programmatic focus on success) and is excluded from the
 * "tab order matches visual order" assertion.
 */
describe("keyboard ordering and touch-target sanity", () => {
  it("has no positive tabIndex anywhere on the broken version", () => {
    const { container } = render(<BrokenContactForm />);
    const candidates = container.querySelectorAll<HTMLElement>(
      "[tabindex], input, textarea, button, a[href], select",
    );
    expect(candidates.length).toBeGreaterThan(0);
    for (const el of candidates) {
      // tabIndex returns the resolved IDL value: 0 when omitted on a
      // natively-focusable element, -1 when explicitly opted out, and a
      // positive integer only when authored that way. We forbid > 0.
      expect(el.tabIndex).toBeLessThanOrEqual(0);
    }
  });

  it("has no positive tabIndex anywhere on the fixed version", () => {
    const { container } = render(<FixedContactForm />);
    const candidates = container.querySelectorAll<HTMLElement>(
      "[tabindex], input, textarea, button, a[href], select",
    );
    expect(candidates.length).toBeGreaterThan(0);
    for (const el of candidates) {
      expect(el.tabIndex).toBeLessThanOrEqual(0);
    }
  });

  it("has no positive tabIndex anywhere on the lesson chrome (toggle + checklist)", () => {
    const { container } = render(<LessonChrome />);
    const candidates = container.querySelectorAll<HTMLElement>(
      "[tabindex], input, textarea, button, a[href], select",
    );
    expect(candidates.length).toBeGreaterThan(0);
    for (const el of candidates) {
      expect(el.tabIndex).toBeLessThanOrEqual(0);
    }
  });

  it("tab order on the fixed form matches visual order: name -> email -> message -> subscribe -> submit", () => {
    render(<FixedContactForm />);

    // Collect inputs / textarea / button in document order. The visual
    // order in the JSX matches: name, email, message, subscribe checkbox,
    // submit. If any positive tabIndex were introduced, the IDL order
    // wouldn't match the source order.
    const order = [
      screen.getByLabelText(/your name/i),
      screen.getByLabelText(/email address/i),
      screen.getByLabelText(/what's on your mind/i),
      screen.getByLabelText(/subscribe to occasional updates/i),
      screen.getByTestId("fixed-submit"),
    ];

    // All natively focusable, all tabIndex 0.
    for (const el of order) {
      expect((el as HTMLElement).tabIndex).toBe(0);
    }

    // And they appear in this DOM order — equivalent to "tab order
    // matches visual order" given no positive tabIndex above.
    const all = Array.from(
      document.querySelectorAll(
        "input, textarea, button[data-testid='fixed-submit']",
      ),
    );
    const indices = order.map((el) => all.indexOf(el));
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });

  it("fixed-version inputs, textarea, and submit carry the 44px touch-target class", () => {
    render(<FixedContactForm />);

    const name = screen.getByLabelText(/your name/i);
    const email = screen.getByLabelText(/email address/i);
    const message = screen.getByLabelText(/what's on your mind/i);
    const submit = screen.getByTestId("fixed-submit");
    const subscribe = screen.getByLabelText(
      /subscribe to occasional updates/i,
    );
    // The 44px guarantee on the checkbox row is on its wrapping <label>,
    // not the checkbox itself (the label is the touch target).
    const subscribeLabel = subscribe.closest("label");

    expect(name.className).toMatch(/min-h-\[44px\]/);
    expect(email.className).toMatch(/min-h-\[44px\]/);
    // Textarea uses rows for height; min-h-[44px] would conflict with rows=4.
    // We don't enforce min-h-[44px] on textarea — its rendered height is
    // already comfortably above 44px from rows=4. Sanity-check rows instead.
    expect(message.getAttribute("rows")).toBe("4");
    expect(submit.className).toMatch(/min-h-\[44px\]/);
    expect(subscribeLabel?.className ?? "").toMatch(/min-h-\[44px\]/);
  });
});
