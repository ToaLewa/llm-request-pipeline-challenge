export function parseIntegerParam(value: string | string[] | undefined): number {
  if (Array.isArray(value) || value === undefined || !/^\d+$/.test(value)) {
    return Number.NaN;
  }

  return Number.parseInt(value, 10);
}
