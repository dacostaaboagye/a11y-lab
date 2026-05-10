import Link from "next/link";

export default function Home() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">a11y-lab</h1>
      <p className="mt-3 text-[color:var(--color-muted)]">
        A practice ground for building UIs that work for visually impaired
        users. Each lesson contrasts a broken implementation with an accessible
        one so the difference is felt, not just read.
      </p>

      <ul className="mt-8 space-y-3">
        <li>
          <Link
            href="/lessons/contact-form"
            className="text-[color:var(--color-accent)] underline underline-offset-4"
          >
            Lesson 1 — Accessible contact form
          </Link>
        </li>
      </ul>
    </main>
  );
}
