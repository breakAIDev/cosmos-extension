export function getPercentage(a: number, b: number): string {
  if (!b) return '0%';
  const percent = (a / b) * 100;
  return `${percent.toFixed(2)}%`;
}
