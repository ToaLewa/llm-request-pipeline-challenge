export function formatLabel(value: string | null): string {
  if (value === 'unknown_human_review') {
    return 'Unknown Request - Requires Human Review';
  }

  return value ? value.split('_').join(' ') : 'Pending';
}
