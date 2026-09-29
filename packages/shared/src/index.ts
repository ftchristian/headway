/**
 * Type guard that drops null and undefined, so `.filter(isDefined)` narrows the array type.
 * Feed entities have many optional fields; this keeps that filtering type-safe.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
