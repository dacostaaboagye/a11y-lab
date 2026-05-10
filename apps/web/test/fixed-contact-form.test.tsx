import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FixedContactForm } from "@/components/fixed-contact-form";

describe("FixedContactForm", () => {
  it("focuses the first invalid field on empty submit", async () => {
    const user = userEvent.setup();
    render(<FixedContactForm />);

    await user.click(screen.getByTestId("fixed-submit"));

    const nameInput = screen.getByLabelText(/your name/i);
    expect(nameInput).toHaveFocus();
    expect(nameInput).toHaveAttribute("aria-invalid", "true");

    // The error <p> is linked via aria-describedby to the name input,
    // so the screen reader will announce it on focus.
    const errorId = nameInput.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent(
      /name is required/i,
    );
  });

  it("moves focus to the next invalid field after the first is fixed", async () => {
    const user = userEvent.setup();
    render(<FixedContactForm />);

    // Fill name only, then submit. Email should be the next invalid.
    await user.type(screen.getByLabelText(/your name/i), "Ada Lovelace");
    await user.click(screen.getByTestId("fixed-submit"));

    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveFocus();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  it("announces success via the live region on valid submit", async () => {
    const user = userEvent.setup();
    render(<FixedContactForm />);

    // Live region is mounted from the start, even when empty — assistive
    // tech needs the region present before the message lands.
    const status = screen.getByTestId("fixed-status");
    expect(status).toHaveAttribute("role", "status");
    expect(status).toHaveAttribute("aria-live", "polite");

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

    // Submit goes pending while the simulated request runs.
    expect(screen.getByTestId("fixed-submit")).toBeDisabled();

    await waitFor(
      () => {
        expect(screen.getByTestId("fixed-status")).toHaveTextContent(
          /message sent/i,
        );
      },
      { timeout: 2000 },
    );
    // Form fields cleared.
    expect(screen.getByLabelText(/your name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("");
  });
});
