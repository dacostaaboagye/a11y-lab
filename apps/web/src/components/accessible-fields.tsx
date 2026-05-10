"use client";

import type { RefObject, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/*
 * Field primitives used by FixedContactForm. Each one wires together the
 * three pieces of the accessible-input contract:
 *
 *   - <label htmlFor> linked to the input id (programmatic association).
 *   - aria-invalid toggled on validation state (state announcement).
 *   - aria-describedby linked to a sibling <p id="...-error"> when there's
 *     an error (the message is announced when the field gets focus).
 *
 * No ARIA where semantics already do the job: required is the native
 * attribute first, with aria-required mirrored only because some legacy
 * AT readers historically missed the implicit form.
 */

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  inputProps: InputHTMLAttributes<HTMLInputElement> & {
    ref?: RefObject<HTMLInputElement | null>;
  };
};

export function Field({ id, label, required, error, inputProps }: FieldProps) {
  const errorId = `${id}-error`;
  const { ref, ...rest } = inputProps;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-[color:var(--color-danger)]">
            {" *"}
          </span>
        ) : null}
      </label>
      <input
        {...rest}
        id={id}
        ref={ref}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClass(Boolean(error))}
      />
      {error ? (
        <p id={errorId} className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextareaFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref?: RefObject<HTMLTextAreaElement | null>;
  };
};

export function TextareaField({
  id,
  label,
  required,
  error,
  textareaProps,
}: TextareaFieldProps) {
  const errorId = `${id}-error`;
  const { ref, ...rest } = textareaProps;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-[color:var(--color-danger)]">
            {" *"}
          </span>
        ) : null}
      </label>
      <textarea
        {...rest}
        id={id}
        ref={ref}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={textareaClass(Boolean(error))}
      />
      {error ? (
        <p id={errorId} className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

const errorClass = "mt-1 text-sm text-[color:var(--color-danger)]";

function inputClass(hasError: boolean) {
  return [
    "mt-1 block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-sm",
    hasError
      ? "border-[color:var(--color-danger)]"
      : "border-[color:var(--color-border)]",
  ].join(" ");
}

function textareaClass(hasError: boolean) {
  return [
    "mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm",
    hasError
      ? "border-[color:var(--color-danger)]"
      : "border-[color:var(--color-border)]",
  ].join(" ");
}
