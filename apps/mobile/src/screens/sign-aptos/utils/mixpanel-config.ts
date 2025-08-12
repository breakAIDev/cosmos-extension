import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';

export const mapWalletTypeToMixpanelWalletType = (
  walletType: WALLETTYPE
): 'seed-phrase' | 'private-key' | 'ledger' => {
  switch (walletType) {
    case WALLETTYPE.LEDGER:
      return 'ledger';
    case WALLETTYPE.PRIVATE_KEY:
      return 'private-key';
    default:
      return 'seed-phrase';
  }
};
