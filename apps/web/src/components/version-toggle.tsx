"use client";

export type FormVersion = "broken" | "fixed";

type Props = {
  value: FormVersion;
  onChange: (next: FormVersion) => void;
};

/*
 * Segmented control implemented as a native radio group: each option is a
 * real <input type="radio">, the visible "chip" is its label. This gives us
 * arrow-key navigation, screen-reader role announcements, and form semantics
 * without writing any of it ourselves.
 */
export function VersionToggle({ value, onChange }: Props) {
  return (
    <fieldset
      className="rounded-lg border border-[color:var(--color-border)] p-3"
      data-testid="version-toggle"
    >
      <legend className="px-1 text-sm font-medium text-[color:var(--color-muted)]">
        Form version
      </legend>
      <div
        role="radiogroup"
        aria-label="Form version"
        className="flex flex-wrap gap-2"
      >
        <ToggleOption
          name="form-version"
          option="broken"
          checked={value === "broken"}
          onChange={() => onChange("broken")}
          label="Broken (default)"
          description="The everyday way that fails for screen readers"
        />
        <ToggleOption
          name="form-version"
          option="fixed"
          checked={value === "fixed"}
          onChange={() => onChange("fixed")}
          label="Fixed"
          description="Native semantics, programmatic associations, focus management"
        />
      </div>
    </fieldset>
  );
}

type OptionProps = {
  name: string;
  option: FormVersion;
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
};

function ToggleOption({
  name,
  option,
  checked,
  onChange,
  label,
  description,
}: OptionProps) {
  const id = `version-${option}`;
  return (
    <label
      htmlFor={id}
      className={[
        "flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border px-4 py-2 text-sm",
        checked
          ? "border-[color:var(--color-accent)] bg-[color:var(--color-muted-surface)]"
          : "border-[color:var(--color-border)] bg-white hover:bg-[color:var(--color-muted-surface)]",
      ].join(" ")}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={option}
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-[color:var(--color-muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}
