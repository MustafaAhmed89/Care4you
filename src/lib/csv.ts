// Minimal RFC-4180-ish CSV serializer for the data export (F-26).
// Values containing quotes, commas or newlines are quoted; embedded quotes doubled.
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "boolean" ? (v ? "yes" : "no") : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => esc(row[h])).join(","));
  return lines.join("\r\n");
}
