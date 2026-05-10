// Shared contract types live here. Frozen during slice; specialists consume,
// don't mutate, after the slice is committed.
export type Lesson = {
  id: string;
  slug: string;
  title: string;
  topic: "form" | "modal" | "navigation" | "table" | "media";
};
