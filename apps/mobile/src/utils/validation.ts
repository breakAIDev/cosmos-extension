// Very basic Cosmos address validation (mainnet)
export function isValidCosmosAddress(address: string): boolean {
  return /^cosmos1[0-9a-z]{38}$/.test(address);
}

// Basic amount validation
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}
