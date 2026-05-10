import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrokenContactForm } from "@/components/broken-contact-form";

/*
 * These tests pin the *intentional* failure modes of BrokenContactForm. If
 * any of them start failing, the broken form has accidentally been "fixed"
 * — which would defeat the lesson. Read the failure carefully before
 * "repairing" anything in this file.
 */
describe("BrokenContactForm (failure modes are intentional)", () => {
  it("uses placeholders instead of <label> elements", () => {
    render(<BrokenContactForm />);

    // No accessible name from a label/aria-label. getByLabelText would find
    // it if there were a real label; queryByLabelText must return null.
    expect(screen.queryByLabelText(/your name/i)).toBeNull();

    // The placeholder is what the user sees but a screen reader does not
    // treat a placeholder as the field's accessible name.
    const nameInput = screen.getByPlaceholderText(/your name/i);
    expect(nameInput).not.toHaveAttribute("aria-label");
    expect(nameInput).not.toHaveAttribute("aria-labelledby");
  });

  it("submit is a div without keyboard / button semantics", async () => {
    const user = userEvent.setup();
    render(<BrokenContactForm />);

    const submit = screen.getByTestId("broken-submit");
    expect(submit.tagName).toBe("DIV");
    expect(submit).not.toHaveAttribute("role", "button");
    // Not a real button: getByRole('button') would find it if it had button
    // semantics. The native <input type="checkbox"> on the form contributes
    // no buttons; if anything else is found, we've drifted.
    expect(screen.queryByRole("button")).toBeNull();

    // Pressing Tab cycles only through inputs / textarea / checkbox. The
    // div is not in the tab order, so we never land on it.
    submit.tabIndex; // no-op read for clarity
    expect(submit.tabIndex).toBe(-1);

    // Pressing Enter while focused on the last input should not submit
    // (the div has no submit semantics and there is no <form>).
    await user.click(screen.getByPlaceholderText(/your name/i));
    await user.keyboard("{Enter}");
    expect(screen.queryByTestId("broken-success")).not.toBeInTheDocument();
  });

  it("does not announce errors or invalid state programmatically", async () => {
    const user = userEvent.setup();
    render(<BrokenContactForm />);

    // Click the div to attempt submit on empty fields.
    await user.click(screen.getByTestId("broken-submit"));

    const nameInput = screen.getByPlaceholderText(/your name/i);
    expect(nameInput).not.toHaveAttribute("aria-invalid");
    expect(nameInput).not.toHaveAttribute("aria-describedby");

    // The error <p> exists visually but isn't linked to the input.
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
