import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants';

const BASE_URL = 'https://chains.cosmos.directory';

export async function fetchAssetList(chain: SupportedChain) {
  const url = `${BASE_URL}/${chain}/assetlist`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch asset list for ${chain}`);
  return await res.json();
}
