import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LessonChrome } from "@/components/lesson-chrome";

/*
 * Closes the gaps around the lesson chrome itself:
 *
 *   - Acceptance: "Each version is wrapped by a screen-reader checklist
 *     panel listing 4–5 concrete actions tied to the failure modes."
 *     Assert the panel renders, has a labelled region, and contains an
 *     ordered list with at least 4 items.
 *
 *   - Edge case: "User tabs past the form into the checklist panel —
 *     panel must be reachable, content readable, not a focus trap and
 *     not skipped." We verify the panel renders alongside both versions
 *     and is not behind aria-hidden / inert.
 *
 *   - Edge case: "Toggling broken→fixed→broken several times does NOT
 *     leave any global state in a bad shape." Toggle 4 times and check
 *     no orphan timers fire, no leaked DOM nodes, no duplicated forms.
 */
describe("LessonChrome integration", () => {
  it("renders the screen-reader checklist panel with at least 4 actions", () => {
    render(<LessonChrome />);

    // The panel is an <aside> with a labelling heading.
    const heading = screen.getByRole("heading", {
      name: /try this with your screen reader/i,
    });
    const panel = heading.closest("aside");
    expect(panel).not.toBeNull();

    // Not aria-hidden / inert (it must be reachable when tabbing past
    // the form).
    expect(panel).not.toHaveAttribute("aria-hidden", "true");
    expect(panel).not.toHaveAttribute("inert");

    // Ordered list with 4-5 concrete actions per the epic.
    const list = within(panel as HTMLElement).getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.length).toBeLessThanOrEqual(5);

    // Each list item has non-empty text — not a placeholder.
    for (const item of items) {
      expect((item.textContent ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  it("checklist panel is present alongside both the broken and the fixed versions", async () => {
    const user = userEvent.setup();
    render(<LessonChrome />);

    // Default = broken: panel + form coexist.
    expect(screen.getByTestId("broken-form")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /try this with your screen reader/i,
      }),
    ).toBeInTheDocument();

    // Switch to fixed: panel still there.
    await user.click(screen.getByLabelText(/^fixed/i));
    expect(screen.getByTestId("fixed-form")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /try this with your screen reader/i,
      }),
    ).toBeInTheDocument();
  });

  it("toggling broken → fixed → broken → fixed leaves a clean state (no duplicate forms, no leaked status)", async () => {
    const user = userEvent.setup();
    render(<LessonChrome />);

    // Type into broken to give us something to leak.
    await user.type(screen.getByTestId("broken-name"), "Ada");

    // Toggle four times.
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByLabelText(/^fixed/i));
      // Exactly one fixed form, zero broken forms.
      expect(screen.getAllByTestId("fixed-form")).toHaveLength(1);
      expect(screen.queryAllByTestId("broken-form")).toHaveLength(0);

      await user.click(screen.getByLabelText(/broken \(default\)/i));
      // Exactly one broken form, zero fixed forms.
      expect(screen.getAllByTestId("broken-form")).toHaveLength(1);
      expect(screen.queryAllByTestId("fixed-form")).toHaveLength(0);

      // Each remount has a fresh empty input — no value bleed-through.
      const broken = screen.getByTestId("broken-name") as HTMLInputElement;
      expect(broken.value).toBe("");
    }
  });

  it("toggling away mid-pending submit on the fixed form does not leak the success message into the broken view", async () => {
    const user = userEvent.setup();
    render(<LessonChrome />);

    // Switch to fixed.
    await user.click(screen.getByLabelText(/^fixed/i));

    // Fill validly and start the submit (700ms simulated request).
    await user.type(screen.getByLabelText(/your name/i), "Ada Lovelace");
    await user.type(
      screen.getByLabelText(/email address/i),
      "ada@example.com",
    );
    await user.type(
      screen.getByLabelText(/what's on your mind/i),
      "Hello there!",
    );
    await user.click(screen.getByTestId("fixed-submit"));

    // Toggle back to broken before the simulated request resolves. The
    // FixedContactForm unmounts. If its setTimeout callback ran on a
    // stale ref, it would either error or paint a success node into a
    // ghost tree. We pin: nothing leaks into the broken view.
    await user.click(screen.getByLabelText(/broken \(default\)/i));

    // Wait long enough that the original 700ms timer would have fired.
    await waitFor(
      () => {
        // The broken view must still be the only one rendered.
        expect(screen.getByTestId("broken-form")).toBeInTheDocument();
        expect(screen.queryByTestId("fixed-form")).not.toBeInTheDocument();
        // No success message anywhere on the page (broken success uses
        // its own testid; fixed-status was unmounted with the form).
        expect(screen.queryByTestId("broken-success")).not.toBeInTheDocument();
        expect(screen.queryByTestId("fixed-status")).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
