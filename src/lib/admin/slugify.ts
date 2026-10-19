export function slugify(input: string, prefix: string): string {
  const s = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s) return s;
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let r = "";
  for (let i = 0; i < 6; i++) r += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${r}`;
}
