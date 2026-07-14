export function parseArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export function stringifyArray(value: string[]): string {
  return JSON.stringify(value);
}