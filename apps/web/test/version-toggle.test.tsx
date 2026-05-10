import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LessonChrome } from "@/components/lesson-chrome";

describe("LessonChrome version toggle", () => {
  it("defaults to broken so the failure is felt first", () => {
    render(<LessonChrome />);
    expect(screen.getByTestId("broken-form")).toBeInTheDocument();
    expect(screen.queryByTestId("fixed-form")).not.toBeInTheDocument();

    const broken = screen.getByLabelText(/broken \(default\)/i);
    expect(broken).toBeChecked();
  });

  it("resets form state on toggle (no input bleed across versions)", async () => {
    const user = userEvent.setup();
    render(<LessonChrome />);

    // Type into the broken form's name input.
    const brokenName = screen.getByTestId("broken-name") as HTMLInputElement;
    await user.type(brokenName, "Ada Lovelace");
    expect(brokenName).toHaveValue("Ada Lovelace");

    // Toggle to fixed, then back to broken — the input should be cleared.
    await user.click(screen.getByLabelText(/^fixed/i));
    expect(screen.queryByTestId("broken-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("fixed-form")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/broken \(default\)/i));
    const brokenNameAgain = screen.getByTestId("broken-name") as HTMLInputElement;
    expect(brokenNameAgain).toHaveValue("");
  });
});
