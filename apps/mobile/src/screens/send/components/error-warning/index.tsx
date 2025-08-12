import { useAddress, useAddressPrefixes, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CosmosChainData, Prettify, SupportedChain as SupportedChains } from '@leapwallet/elements-core';
import { SkipCosmosMsg, useSkipSupportedChains } from '@leapwallet/elements-hooks';
import { Info, Warning } from 'phosphor-react-native'; // or 'phosphor-react-native'
import BigNumber from 'bignumber.js';
import { Button } from '../../../../components/ui/button';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useSendContext } from '../../../send/context';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IBCSettings from '../IBCSettings';

export function ErrorChannel() {
  const [assetChain, setAssetChain] = useState<any>(null);

  const {
    amountError,
    addressError,
    pfmEnabled,
    setPfmEnabled,
    transferData,
    isIbcUnwindingDisabled,
    setSelectedAddress,
    selectedAddress,
    customIbcChannelId,
    sendActiveChain,
  } = useSendContext();
  const { chains } = useChainsStore();
  const addressPrefixes = useAddressPrefixes();

  const chainInfos = useChainInfos();
  const wallet = useActiveWallet().activeWallet;
  const asssetChainKey = Object.values(chainInfos).find((chain) => chain.chainId === assetChain?.chainId)?.key;

  const autoFillAddress = wallet?.addresses?.[asssetChainKey as SupportedChain];

  const onAutoFillAddress = () => {
    setSelectedAddress({
      address: autoFillAddress,
      name: autoFillAddress?.slice(0, 5) + '...' + autoFillAddress?.slice(-5),
      avatarIcon: assetChain?.icon,
      emoji: undefined,
      chainIcon: assetChain?.icon,
      chainName: assetChain?.addressPrefix,
      selectionType: 'notSaved',
      information: { autofill: true },
    });
  };

  const { data: skipSupportedChains } = useSkipSupportedChains();

  useEffect(() => {
    if (transferData?.isSkipTransfer && transferData?.routeResponse) {
      const allMessages = transferData?.messages?.[1] as SkipCosmosMsg;

      const _skipChain = skipSupportedChains?.find(
        (d) => d.chainId === allMessages?.multi_chain_msg?.chain_id,
      ) as Prettify<CosmosChainData & SupportedChains>;
      setAssetChain(
        _skipChain?.addressPrefix === 'sei'
          ? {
              ..._skipChain,
              addressPrefix: 'seiTestnet2',
            }
          : _skipChain,
      );
      setPfmEnabled(_skipChain?.pfmEnabled === false ? false : true);
    } else {
      setAssetChain(null);
      setPfmEnabled(true);
    }

    return () => {
      setPfmEnabled(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    skipSupportedChains,
    transferData?.isSkipTransfer,
    transferData?.routeResponse,
    transferData?.messages,
  ]);

  const cw20Error = (amountError || '').includes('IBC transfers are not supported');
  const isAddressNotSupported = (amountError || '').includes('You can only send this token to a SEI address');

  if (cw20Error || isAddressNotSupported) {
    return (
      <View style={[styles.errorBox, styles.bgRed]}>
        <Warning size={24} color="#F87171" style={styles.icon} />
        <Text style={styles.errorText}>{amountError}</Text>
      </View>
    );
  }

  const isIBCError = (addressError || '').includes('IBC transfers are not supported');

  // Error warning for IBC transfers
  if (isIBCError || customIbcChannelId) {
    const destChainInfo = () => {
      if (!selectedAddress?.address) {
        return null;
      }
      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address);
      if (!destChainAddrPrefix) {
        return null;
      }
      const destinationChainKey = addressPrefixes[destChainAddrPrefix] as SupportedChain | undefined;
      if (!destinationChainKey) {
        return null;
      }
      return chains[destinationChainKey];
    };
    // For React Native, you may need to update IBCSettings to use native UI
    return <IBCSettings targetChain={destChainInfo()?.key as SupportedChain} sourceChain={sendActiveChain} />;
  }

  // warning to show if PFM is not enabled on the chain
  if (!pfmEnabled && !isIbcUnwindingDisabled) {
    return (
      <View style={[styles.warningBox]}>
        <Info size={16} color="#EAB308" style={styles.icon} />
        <Text style={styles.warningText}>
          You will have to send this token to {assetChain?.chainName} first to able to use it.
        </Text>
        <Button variant="mono" size="sm" style={styles.button} onPress={onAutoFillAddress}>
          Autofill address
        </Button>
      </View>
    );
  }
  return null;
}

export function useSwitchToUSDDisabled() {
  const { selectedToken } = useSendContext();

  const selectedAssetUSDPrice = useMemo(() => {
    if (selectedToken && selectedToken.usdPrice && selectedToken.usdPrice !== '0') {
      return selectedToken.usdPrice;
    }
    return undefined;
  }, [selectedToken]);

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6);
  }, [selectedAssetUSDPrice]);

  return switchToUSDDisabled;
}

export function ErrorWarning() {
  const { isCexIbcTransferWarningNeeded, selectedAddress, selectedToken, sendActiveChain } = useSendContext();
  const currentWalletAddress = useAddress(sendActiveChain);
  const switchToUSDDisabled = useSwitchToUSDDisabled();
  const isSendingToSameWallet = currentWalletAddress === selectedAddress?.address;

  // warning to show if sending to same wallet address
  if (isSendingToSameWallet) {
    return (
      <View style={[styles.warningBox]}>
        <Info size={16} color="#EAB308" style={styles.icon} />
        <Text style={styles.warningText}>
          You're transferring funds to the same address within your own wallet
        </Text>
      </View>
    );
  }

  // warning to show if USD value cannot be calculated
  if (switchToUSDDisabled && selectedToken?.chain) {
    return null;
  }

  if (isCexIbcTransferWarningNeeded) {
    return (
      <View style={[styles.warningBox]}>
        <Info size={16} color="#EAB308" style={styles.icon} />
        <Text style={styles.warningText}>
          Avoid transferring IBC tokens to centralised exchanges.
        </Text>
      </View>
    );
  }

  return null;
}

export function ErrorWarningTokenCard() {
  const switchToUSDDisabled = useSwitchToUSDDisabled();
  const { selectedAddress, selectedToken, sendActiveChain } = useSendContext();
  const currentWalletAddress = useAddress(sendActiveChain);
  const isSendingToSameWallet = currentWalletAddress === selectedAddress?.address;

  // warning to show if sending to same wallet address
  if (isSendingToSameWallet) {
    return null;
  }

  // warning to show if USD value cannot be calculated
  if (switchToUSDDisabled && selectedToken?.chain) {
    return (
      <View style={[styles.warningBox]}>
        <Info size={16} color="#EAB308" style={styles.icon} />
        <Text style={styles.warningText}>
          USD value cannot be calculated for this transaction
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 8,
  },
  bgRed: {
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '500',
    fontSize: 14,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    gap: 6,
    marginBottom: 8,
  },
  warningText: {
    color: '#EAB308',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    minHeight: 36,
  },
  icon: {
    minWidth: 16,
    marginRight: 8,
  },
});

export default ErrorChannel;
