const LOWERCASE_WORDS = new Set(["a", "à", "ao", "da", "das", "de", "do", "dos", "e", "em", "na", "no"]);

export function clean(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[   ​ ]/g, " ")
    .replace(/[‐‑‒–—―]/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/–/g, "-")
    .toLowerCase();
}

export function slugify(value: string): string {
  return fold(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(value: string): string {
  if (value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index > 0 && LOWERCASE_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
