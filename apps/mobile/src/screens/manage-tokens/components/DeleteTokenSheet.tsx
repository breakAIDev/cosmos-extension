import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import {
  ActiveChainStore,
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  BetaNativeDenomsStore,
  ChainInfosStore,
} from '@leapwallet/cosmos-wallet-store';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type DeleteTokenSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenToDelete: NativeDenom | undefined;
  activeChainStore: ActiveChainStore;
  chainInfosStore: ChainInfosStore;
  betaNativeDenomsStore: BetaNativeDenomsStore;
  betaERC20DenomsStore: BetaERC20DenomsStore;
  betaCW20DenomsStore: BetaCW20DenomsStore;
};

export const DeleteTokenSheet = observer(({
  isOpen,
  onClose,
  tokenToDelete,
  activeChainStore,
  chainInfosStore,
  betaNativeDenomsStore,
  betaERC20DenomsStore,
  betaCW20DenomsStore,
}: DeleteTokenSheetProps) => {
  const { activeChain } = activeChainStore;
  const { chainInfos } = chainInfosStore;
  const activeChainInfo = chainInfos?.[activeChain as SupportedChain];
  const { betaNativeDenoms } = betaNativeDenomsStore;
  const { betaCW20Denoms } = betaCW20DenomsStore;
  const { betaERC20Denoms } = betaERC20DenomsStore;

  const tokenName = useMemo(() => {
    const name = tokenToDelete?.coinDenom ?? '';
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
  }, [tokenToDelete?.coinDenom]);

  const onConfirm = useCallback(() => {
    if (tokenToDelete && betaNativeDenoms[tokenToDelete?.coinMinimalDenom ?? '']) {
      betaNativeDenomsStore.removeBetaNativeDenoms(tokenToDelete?.coinMinimalDenom, activeChain);
    } else if (tokenToDelete && betaCW20Denoms[tokenToDelete?.coinMinimalDenom ?? '']) {
      betaCW20DenomsStore.removeBetaCW20Denoms(tokenToDelete?.coinMinimalDenom, activeChain);
    } else if (tokenToDelete && betaERC20Denoms[tokenToDelete?.coinMinimalDenom ?? '']) {
      betaERC20DenomsStore.removeBetaERC20Denoms(tokenToDelete?.coinMinimalDenom, activeChain);
    }
    onClose();
  }, [
    tokenToDelete,
    betaNativeDenoms,
    betaCW20Denoms,
    betaERC20Denoms,
    onClose,
    betaNativeDenomsStore,
    activeChain,
    betaCW20DenomsStore,
    betaERC20DenomsStore,
  ]);

  return (
    <BottomModal title="Delete Token" onClose={onClose} isOpen={isOpen}>
      <View style={styles.contentContainer}>
        <View style={styles.iconBox}>
          <Image source={{uri: Images.Misc.DeleteTokenSheetBin}} style={styles.binIcon} />
        </View>
        <Text style={styles.title}>Confirm Delete?</Text>
        <Text style={styles.bodyText}>
          Are you sure you want to delete your manually added “{tokenName}” token on {activeChainInfo?.chainName}?
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <Button
          style={[styles.button, styles.cancelBtn]}
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          style={[styles.button, styles.confirmBtn]}
          onPress={onConfirm}
        >
          Confirm
        </Button>
      </View>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    borderRadius: 16,
    backgroundColor: '#f5f5fa',
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  iconBox: {
    borderRadius: 99,
    backgroundColor: '#fee2e2', // destructive-100
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  binIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#22223B',
    textAlign: 'center',
  },
  bodyText: {
    marginTop: 20,
    color: '#878787',
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6', // secondary-100
    marginRight: 6,
  },
  confirmBtn: {
    backgroundColor: '#fee2e2', // destructive-100
    marginLeft: 6,
  },
});

