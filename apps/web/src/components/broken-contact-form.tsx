"use client";

import { useState, type ChangeEvent } from "react";

type Errors = {
  name?: boolean;
  email?: boolean;
  message?: boolean;
};

type Status = "idle" | "success";

/*
 * INTENTIONALLY BROKEN. Every defect here maps to a checklist item — the
 * point of this component is to feel the failure, not to ship it.
 *
 *   1. Placeholders stand in for labels (no <label>, no aria-label).
 *   2. Submit is a styled <div onClick>: not in tab order, not Enter/Space
 *      operable, no implicit role="button".
 *   3. Errors are red border + red helper text only — no aria-describedby,
 *      no aria-invalid, no live region.
 *   4. Success shows a green check visually only — no announcement.
 *
 * Do NOT "fix" any of this in place. The fixes live in FixedContactForm.
 */
export function BrokenContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const onChange =
    (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setter(e.target.value);

  const handleSubmit = () => {
    const next: Errors = {};
    if (name.trim() === "") next.name = true;
    if (email.trim() === "" || !email.includes("@")) next.email = true;
    if (message.trim() === "") next.message = true;
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setSubscribe(false);
    } else {
      setStatus("idle");
    }
  };

  return (
    <div data-testid="broken-form">
      <h2 className="text-xl font-semibold">Contact us</h2>
      <p className="mt-1 text-sm text-[color:var(--color-muted)]">
        Drop us a note and we&apos;ll get back to you.
      </p>

      <div className="mt-5 space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={onChange(setName)}
          className={inputClass(errors.name)}
          data-testid="broken-name"
        />
        {errors.name ? <p className={errorTextClass}>Name is required</p> : null}

        <input
          type="text"
          placeholder="Email address"
          value={email}
          onChange={onChange(setEmail)}
          className={inputClass(errors.email)}
          data-testid="broken-email"
        />
        {errors.email ? (
          <p className={errorTextClass}>A valid email is required</p>
        ) : null}

        <textarea
          placeholder="What's on your mind?"
          value={message}
          onChange={onChange(setMessage)}
          rows={4}
          className={inputClass(errors.message)}
          data-testid="broken-message"
        />
        {errors.message ? (
          <p className={errorTextClass}>Message is required</p>
        ) : null}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={subscribe}
            onChange={(e) => setSubscribe(e.target.checked)}
          />
          Subscribe to occasional updates
        </label>

        {/* INTENTIONAL: div-as-button. Not focusable, not keyboard-operable. */}
        <div
          onClick={handleSubmit}
          className="mt-2 inline-block cursor-pointer select-none rounded-md bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-accent-foreground)]"
          data-testid="broken-submit"
        >
          Send message
        </div>

        {status === "success" ? (
          // INTENTIONAL: visual-only success. No live region, no role=status.
          <div
            className="mt-4 inline-flex items-center gap-2 text-sm text-[color:var(--color-success)]"
            data-testid="broken-success"
          >
            <span aria-hidden="true">✓</span>
            <span>Sent!</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function inputClass(hasError: boolean | undefined) {
  return [
    "w-full rounded-md border bg-white px-3 py-2 text-sm",
    hasError
      ? "border-[color:var(--color-danger)]"
      : "border-[color:var(--color-border)]",
  ].join(" ");
}

const errorTextClass = "text-sm text-[color:var(--color-danger)]";
