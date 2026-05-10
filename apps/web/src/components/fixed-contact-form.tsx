"use client";

import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { Field, TextareaField } from "./accessible-fields";

type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

/*
 * Accessible mirror of BrokenContactForm. Patterns:
 *
 *   - Native form / label / input / textarea / button. ARIA only patches
 *     what semantics can't express: error association (aria-describedby),
 *     validity state (aria-invalid), polite status announcement.
 *   - Validation runs on submit only; on-blur validation would punish users
 *     for moving forward and is out of scope for this lesson.
 *   - On invalid submit: focus the first invalid field. The screen reader
 *     reads the field's label, type, required state, and the error linked
 *     by aria-describedby — without us writing a custom announcement.
 *   - On valid submit: simulate a 700ms request, clear inputs, write the
 *     success message into a live region that was mounted on first render,
 *     and move focus to that region so VoiceOver/NVDA pick it up reliably.
 *   - Submit disables during the simulated request to prevent double-submit
 *     spamming the live region.
 *   - Touch targets meet 44px via min-h-[44px] on inputs / button.
 */
export function FixedContactForm() {
  const formId = useId();
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const messageId = `${formId}-message`;
  const subscribeId = `${formId}-subscribe`;

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [pending, setPending] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim() === "") next.name = "Name is required";
    if (email.trim() === "") next.email = "Email is required";
    else if (!email.includes("@")) next.email = "Enter a valid email address";
    if (message.trim() === "") next.message = "Please tell us what's on your mind";
    return next;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);

    if (Object.keys(next).length > 0) {
      const firstInvalid = pickFirstInvalid(next, {
        name: nameRef,
        email: emailRef,
        message: messageRef,
      });
      firstInvalid?.current?.focus();
      return;
    }

    setPending(true);
    setStatusMessage("");
    window.setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSubscribe(false);
      setStatusMessage("Message sent. We'll be in touch soon.");
      setPending(false);
      // Focus the live region so VoiceOver/NVDA reliably announce it even
      // when polite-region behavior diverges across OSes.
      statusRef.current?.focus();
    }, 700);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${formId}-heading`}
      data-testid="fixed-form"
    >
      <h2 id={`${formId}-heading`} className="text-xl font-semibold">
        Contact us
      </h2>
      <p className="mt-1 text-sm text-[color:var(--color-muted)]">
        Drop us a note and we&apos;ll get back to you.
      </p>

      <div className="mt-5 space-y-5">
        <Field
          id={nameId}
          label="Your name"
          required
          error={errors.name}
          inputProps={{
            ref: nameRef,
            type: "text",
            autoComplete: "name",
            value: name,
            onChange: (e) => setName(e.target.value),
          }}
        />

        <Field
          id={emailId}
          label="Email address"
          required
          error={errors.email}
          inputProps={{
            ref: emailRef,
            type: "email",
            autoComplete: "email",
            inputMode: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }}
        />

        <TextareaField
          id={messageId}
          label="What's on your mind?"
          required
          error={errors.message}
          textareaProps={{
            ref: messageRef,
            rows: 4,
            value: message,
            onChange: (e) => setMessage(e.target.value),
          }}
        />

        <div>
          <label
            htmlFor={subscribeId}
            className="flex min-h-[44px] items-center gap-3 text-sm"
          >
            <input
              id={subscribeId}
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="h-5 w-5"
            />
            Subscribe to occasional updates
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-[color:var(--color-accent-foreground)] disabled:opacity-60"
          data-testid="fixed-submit"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>

      {/*
       * Live region rendered on initial mount with empty text. Assistive
       * tech needs the region to exist before the message lands, otherwise
       * the announcement is missed. tabIndex=-1 lets us focus it
       * programmatically without putting it in the natural tab order.
       */}
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        data-testid="fixed-status"
        className={
          statusMessage
            ? "mt-5 flex items-start gap-2 rounded-md border border-[color:var(--color-success)] bg-[color:var(--color-success-surface)] p-3 text-sm text-[color:var(--color-success)]"
            : "sr-only"
        }
      >
        {statusMessage ? (
          <>
            <span aria-hidden="true">✓</span>
            <span>{statusMessage}</span>
          </>
        ) : null}
      </div>
    </form>
  );
}

function pickFirstInvalid(
  errors: Errors,
  refs: {
    name: RefObject<HTMLInputElement | null>;
    email: RefObject<HTMLInputElement | null>;
    message: RefObject<HTMLTextAreaElement | null>;
  },
) {
  if (errors.name) return refs.name;
  if (errors.email) return refs.email;
  if (errors.message) return refs.message;
  return null;
}
