export type Tag = { key: string; value: string };

// "# bg:office_night" → { key: "bg", value: "office_night" }; "# glass" → { key: "glass", value: "" }
export function parseTags(tags: string[]): Tag[] {
  return tags.map((raw) => {
    const [key, ...rest] = raw.trim().split(":");
    return { key: key.trim().toLowerCase(), value: rest.join(":").trim() };
  });
}
