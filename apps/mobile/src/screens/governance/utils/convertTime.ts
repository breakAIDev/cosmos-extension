export function convertTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // Pad with zeros
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
