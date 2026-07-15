// ASP.NET Core's ValidationProblemDetails keys errors by the C# property name
// (PascalCase — "Email", "FirstName", ...), while our forms are keyed camelCase.
// This is a plain, mechanical rename: every field name in this API's DTOs follows
// standard PascalCase-to-camelCase pairing, so no per-field mapping table is needed.
export function mapBackendFieldErrors(fieldErrors?: Record<string, string[]>): Record<string, string> {
  if (!fieldErrors) return {};

  const mapped: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (!messages?.length) continue;
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    mapped[camelKey] = messages[0];
  }
  return mapped;
}
