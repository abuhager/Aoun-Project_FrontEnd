/** Escape HTML script delimiters while preserving JSON values. */
export function serializeStructuredData(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new TypeError("Structured data must be JSON serializable");
  return serialized.replace(/[<>&\u2028\u2029]/g, (character) =>
    `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`
  );
}
