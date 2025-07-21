// Format Cosmos address for display
export function formatAddress(addr: string, start = 8, end = 6): string {
  if (!addr) return "";
  if (addr.length < start + end + 3) return addr;
  return addr.slice(0, start) + "..." + addr.slice(-end);
}

// Format token amount (from uatom to ATOM)
export function formatAtom(uatom: string | number): string {
  const amount = typeof uatom === "string" ? parseFloat(uatom) : uatom;
  return (amount / 1e6).toLocaleString(undefined, { maximumFractionDigits: 6 });
}
