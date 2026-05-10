import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FixedContactForm } from "@/components/fixed-contact-form";

/*
 * Closes the remaining edge-case gaps from the epic:
 *
 *   - "Long error messages wrap; aria-describedby still references a
 *     single id and doesn't push the input off-screen on 320px." We
 *     can't check pixel layout under jsdom, but we can verify the
 *     contract: aria-describedby always points to one id, and that id
 *     resolves to the visible error <p> sibling. Wrapping is then a
 *     CSS / Tailwind concern, not a logic concern.
 *
 *   - "Rapid double-submit on the fixed version: the button disables on
 *     submit and re-enables after the simulated response so the live
 *     region isn't spammed." Pin: a second click while pending is a
 *     no-op (button is disabled). The success message still lands once.
 *
 *   - "The error remains linked after the user starts correcting it"
 *     (a corollary of the wrapping case): aria-describedby stays a
 *     single id throughout the error's lifetime; it doesn't accumulate.
 */
describe("FixedContactForm edge cases", () => {
  it("links aria-describedby to a single id that resolves to the visible error", async () => {
    const user = userEvent.setup();
    render(<FixedContactForm />);

    // Trigger errors on all three required fields.
    await user.click(screen.getByTestId("fixed-submit"));

    const fields = [
      screen.getByLabelText(/your name/i),
      screen.getByLabelText(/email address/i),
      screen.getByLabelText(/what's on your mind/i),
    ];

    for (const field of fields) {
      const describedBy = field.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      // Single id, not space-separated. A space-separated list is valid
      // ARIA, but for this lesson the contract is one error per field.
      // Multiple ids would mean wrapping or layout drift could leave a
      // stale id behind.
      expect(describedBy!.trim().split(/\s+/)).toHaveLength(1);

      // The id resolves to a visible <p> in the document.
      const errorEl = document.getElementById(describedBy!);
      expect(errorEl).not.toBeNull();
      expect(errorEl!.tagName.toLowerCase()).toBe("p");
      expect(errorEl!.textContent ?? "").not.toBe("");

      // aria-invalid mirrors the error.
      expect(field).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("clears aria-describedby + aria-invalid once the field is corrected and re-submitted", async () => {
    const user = userEvent.setup();
    render(<FixedContactForm />);

    // First submit — name is errored.
    await user.click(screen.getByTestId("fixed-submit"));
    const name = screen.getByLabelText(/your name/i);
    expect(name).toHaveAttribute("aria-invalid", "true");

    // Fill the name and re-submit. The next focus moves to email; name
    // should no longer carry aria-invalid or aria-describedby.
    await user.type(name, "Ada Lovelace");
    await user.click(screen.getByTestId("fixed-submit"));

    expect(name).not.toHaveAttribute("aria-invalid");
    expect(name).not.toHaveAttribute("aria-describedby");
  });

  it("disables submit during the simulated request and ignores rapid double-clicks", async () => {
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

    const submit = screen.getByTestId("fixed-submit") as HTMLButtonElement;

    // First click kicks off the simulated request — synchronous state
    // flush makes the button disabled before any timer fires.
    await user.click(submit);
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute("aria-busy", "true");

    // A second click while pending must be a no-op. user-event respects
    // the disabled state, so this exercises the real DOM contract.
    await user.click(submit);
    await user.click(submit);

    // Wait for the simulated 700ms request to settle.
    await waitFor(
      () => {
        expect(screen.getByTestId("fixed-status")).toHaveTextContent(
          /message sent/i,
        );
      },
      { timeout: 2000 },
    );

    // Button re-enables after the response so the user can submit again
    // in a real session. The success message is present exactly once —
    // no duplication from the double-click attempt.
    expect(submit).not.toBeDisabled();
    expect(submit).not.toHaveAttribute("aria-busy", "true");
    const successMatches = screen.getAllByText(/message sent/i);
    expect(successMatches).toHaveLength(1);
  });

  it("button reflects pending state with text and aria-busy", async () => {
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

    const submit = screen.getByTestId("fixed-submit");
    await user.click(submit);

    // While pending: visible label changes too — text is the primary
    // channel for sighted users. SR users get aria-busy.
    expect(submit).toHaveTextContent(/sending/i);

    await waitFor(
      () => expect(screen.getByTestId("fixed-status")).toHaveTextContent(
        /message sent/i,
      ),
      { timeout: 2000 },
    );

    // After settling, the label returns to "Send message".
    expect(submit).toHaveTextContent(/send message/i);
  });
});
