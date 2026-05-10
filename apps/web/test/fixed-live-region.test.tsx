import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FixedContactForm } from "@/components/fixed-contact-form";

/*
 * Closes acceptance + edge-case gaps around the polite live region:
 *
 *   - Edge case: "Mount the live region on initial render with empty
 *     content, then update its text on submit." Existing tests assert
 *     the region after submit. This test pins that the region is in
 *     the initial DOM with the right ARIA wiring and empty text.
 *
 *   - Acceptance: "Submit confirmation is conveyed via text + icon +
 *     live region announcement, never color alone." We assert all
 *     three: a non-empty text node, an aria-hidden icon glyph, and the
 *     polite live region wrapping both.
 *
 * These complement (don't duplicate) fixed-contact-form.test.tsx which
 * covers the success-clear-form and pending-disabled flow.
 */
describe("FixedContactForm live region", () => {
  it("mounts the live region on initial render with empty content", () => {
    render(<FixedContactForm />);

    const region = screen.getByTestId("fixed-status");
    // Region exists before any user action (assistive tech needs the
    // node present to register the live region — adding it at the same
    // time as the message risks a missed announcement).
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("role", "status");
    expect(region).toHaveAttribute("aria-live", "polite");
    // Empty text content on initial render.
    expect(region.textContent ?? "").toBe("");
    // Visually hidden until populated — uses the sr-only utility so the
    // empty region is not a visible empty box but is still in the
    // accessibility tree.
    expect(region.className).toContain("sr-only");
  });

  it("conveys success with text + icon + live-region announcement (not color alone)", async () => {
    const user = userEvent.setup();
    render(<FixedContactForm />);

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

    await waitFor(
      () => {
        expect(screen.getByTestId("fixed-status")).toHaveTextContent(
          /message sent/i,
        );
      },
      { timeout: 2000 },
    );

    const region = screen.getByTestId("fixed-status");

    // Channel 1: live region wiring is still in place after the update.
    expect(region).toHaveAttribute("role", "status");
    expect(region).toHaveAttribute("aria-live", "polite");

    // Channel 2: human-readable text — the announcement carries meaning,
    // not just "success". A SR user must learn what happened.
    expect(region).toHaveTextContent(/message sent/i);

    // Channel 3: an icon glyph rendered with aria-hidden so it doesn't
    // double-announce, but is present visually alongside the text.
    const icon = within(region).getByText("✓");
    expect(icon).toHaveAttribute("aria-hidden", "true");

    // Receives focus so VoiceOver/NVDA announce reliably across OSes
    // (polite-region behavior diverges between platforms — focusing the
    // region is the defensive belt-and-braces).
    expect(region).toHaveFocus();
  });
});
