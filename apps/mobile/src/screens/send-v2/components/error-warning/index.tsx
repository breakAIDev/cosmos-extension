import { useAddress, useAddressPrefixes, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CosmosChainData, Prettify, SupportedChain as SupportedChains } from '@leapwallet/elements-core';
import { SkipCosmosMsg, useSkipSupportedChains } from '@leapwallet/elements-hooks';
import { Info, Warning } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import Text from '../../../../components/text';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useSendContext } from '../../../send-v2/context';
import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import IBCSettings from '../IBCSettings';

function ErrorWarning() {
  const [assetChain, setAssetChain] = useState<any>(null);

  const {
    amountError,
    addressError,
    pfmEnabled,
    setPfmEnabled,
    transferData,
    isCexIbcTransferWarningNeeded,
    isIbcUnwindingDisabled,
    setSelectedAddress,
    selectedAddress,
    selectedToken,
    customIbcChannelId,
    sendActiveChain,
  } = useSendContext();

  const currentWalletAddress = useAddress(sendActiveChain);
  const { chains } = useChainsStore();
  const addressPrefixes = useAddressPrefixes();

  const selectedAssetUSDPrice = useMemo(() => {
    if (selectedToken && selectedToken.usdPrice && selectedToken.usdPrice !== '0') {
      return selectedToken.usdPrice;
    }
    return undefined;
  }, [selectedToken]);

  const switchToUSDDisabled = useMemo(() => {
    return !selectedAssetUSDPrice || new BigNumber(selectedAssetUSDPrice ?? 0).isLessThan(10 ** -6);
  }, [selectedAssetUSDPrice]);

  // getting the wallet address from the assets for auto fill
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

  // checking if the token selected is pfmEnabled
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

  const isSendingToSameWallet = currentWalletAddress === selectedAddress?.address;

  const cw20Error = (amountError || '').includes('IBC transfers are not supported');
  const isAddressNotSupported = (amountError || '').includes('You can only send this token to a SEI address');

  if (cw20Error || isAddressNotSupported) {
    return (
      <View style={[styles.warningBox, styles.bgRed]}>
        <Warning size={24} color={'#F87171'} /* text-red-400 */ />
        <Text size='xs' style={styles.warningText}>
          {amountError}
        </Text>
      </View>
    );
  }

  const isIBCError = (addressError || '').includes('IBC transfers are not supported');

  // Error warning for IBC transfers
  if (isIBCError || customIbcChannelId) {
    const destChainInfo = () => {
      if (!selectedAddress?.address) return null;
      const destChainAddrPrefix = getBlockChainFromAddress(selectedAddress.address);
      if (!destChainAddrPrefix) return null;
      const destinationChainKey = addressPrefixes[destChainAddrPrefix] as SupportedChain | undefined;
      if (!destinationChainKey) return null;
      return chains[destinationChainKey];
    };

    return (
      <IBCSettings
        targetChain={destChainInfo()?.key as SupportedChain}
        sourceChain={sendActiveChain}
      />
    );
  }

  // warning to show if PFM is not enabled on the chain
  if (!pfmEnabled && !isIbcUnwindingDisabled) {
    return (
      <View style={[styles.warningBox, styles.bgOrange]}>
        <Info size={16} color={'#FFB33D'} style={{ alignSelf: 'flex-start' }} />
        <Text size='xs' style={[styles.warningText, { flex: 1 }]}>
          You will have to send this token to {assetChain?.chainName} first to able to use it.
        </Text>
        <TouchableOpacity
          onPress={onAutoFillAddress}
          style={styles.autofillButton}
        >
          <Text size='xs' style={styles.autofillButtonText}>
            Autofill address
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // warning to show if sending to same wallet address
  if (isSendingToSameWallet) {
    return (
      <View style={[styles.warningBox, styles.bgOrange]}>
        <Info size={16} color={'#FFB33D'} style={{ alignSelf: 'flex-start' }} />
        <Text size='xs' style={styles.warningText}>
          You're transferring funds to the same address within your own wallet
        </Text>
      </View>
    );
  }

  // warning to show if USD value cannot be calculated
  if (switchToUSDDisabled && selectedToken?.chain) {
    return (
      <View style={[styles.warningBox, styles.bgOrange]}>
        <Warning size={16} color={'#FFB33D'} style={{ alignSelf: 'flex-start' }} />
        <Text size='xs' style={styles.warningText}>
          USD value cannot be calculated for this transaction
        </Text>
      </View>
    );
  }

  if (isCexIbcTransferWarningNeeded) {
    return (
      <View style={[styles.warningBox, styles.bgOrange]}>
        <Warning size={16} color={'#FFB33D'} style={{ alignSelf: 'flex-start' }} />
        <Text size='xs' style={styles.warningText}>
          Avoid transferring IBC tokens to centralised exchanges.
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  warningBox: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  bgRed: {
    backgroundColor: '#fee2e2', // red-100
  },
  bgOrange: {
    backgroundColor: '#fde68a', // orange-200
  },
  warningText: {
    fontWeight: '500',
  },
  autofillButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginLeft: 8,
    alignSelf: 'center',
  },
  autofillButtonText: {
    color: '#1f2937', // black-100
    fontWeight: 'bold',
  },
});

export default ErrorWarning;
