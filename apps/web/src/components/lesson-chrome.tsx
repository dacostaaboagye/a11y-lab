"use client";

import { useState } from "react";
import { VersionToggle, type FormVersion } from "./version-toggle";
import { BrokenContactForm } from "./broken-contact-form";
import { FixedContactForm } from "./fixed-contact-form";
import { ScreenReaderChecklist } from "./screen-reader-checklist";

/*
 * Owns the broken/fixed toggle state. Remounting each form via `key` is the
 * mechanism that resets local form state on toggle — cheaper and clearer than
 * lifting form state up just to clear it.
 */
export function LessonChrome() {
  const [version, setVersion] = useState<FormVersion>("broken");

  return (
    <div>
      <header className="mb-6 sm:mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-[color:var(--color-muted)]">
          Lesson 1
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          The accessible contact form
        </h1>
        <p className="mt-3 max-w-2xl text-[color:var(--color-muted)]">
          Two versions of the same form. The broken one ships the failures you
          see in the wild — placeholders for labels, a styled div for submit,
          color-only errors. The fixed one repairs each defect with platform
          semantics first and ARIA only where it earns its keep. Toggle between
          them and exercise both with a screen reader.
        </p>
      </header>

      <VersionToggle value={version} onChange={setVersion} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
        <section
          aria-label={
            version === "broken"
              ? "Broken contact form"
              : "Accessible contact form"
          }
          className="rounded-lg border border-[color:var(--color-border)] bg-white p-5 sm:p-6"
        >
          {version === "broken" ? (
            <BrokenContactForm key="broken" />
          ) : (
            <FixedContactForm key="fixed" />
          )}
        </section>

        <ScreenReaderChecklist />
      </div>
    </div>
  );
}
