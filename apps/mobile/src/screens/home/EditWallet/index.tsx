import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { getEthereumAddress } from '@leapwallet/cosmos-wallet-sdk';
import { ActiveChainStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store';
import { KeyChain } from '@leapwallet/leap-keychain';
import { Check, TrashSimple } from 'phosphor-react-native';
import { ErrorCard } from '../../../components/ErrorCard';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { LEDGER_NAME_EDITED_SUFFIX, LEDGER_NAME_EDITED_SUFFIX_REGEX } from '../../../services/config/config';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { getWalletIconAtIndex } from '../../../../assets/images/misc';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import { walletColors } from '../../../theme/colors';
import { RemoveWallet } from '../RemoveWallet';
import { CopyButton } from './copy-address';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';

type EditWalletFormProps = {
  wallet: Key;
  isVisible: boolean;
  onClose: (closeParent: boolean) => void;
  activeChainStore: ActiveChainStore;
  chainInfoStore: ChainInfosStore;
};

export const EditWalletForm = observer(
  ({ isVisible, wallet, onClose, activeChainStore, chainInfoStore }: EditWalletFormProps) => {
    const [name, setName] = useState(wallet?.name ?? '');
    const [error, setError] = useState<string>('');
    const [isShowRemoveWallet, setShowRemoveWallet] = useState<boolean>(false);
    const { activeWallet, setActiveWallet } = useActiveWallet();
    const activeChain = activeChainStore.activeChain;
    const [colorIndex, setColorIndex] = useState<number>(wallet?.colorIndex ?? 0);

    useEffect(() => {
      setError('');
      setName(wallet?.name ?? '');
      setColorIndex(wallet?.colorIndex ?? 0);
    }, [wallet, isVisible]);

    const handleInputChange = (value: string) => {
      setError('');
      if (value.length < 25) setName(value);
    };

    const handleSaveChanges = async () => {
      if (name && wallet) {
        try {
          const walletName =
            wallet.walletType === WALLETTYPE.LEDGER ? `${name.trim()}${LEDGER_NAME_EDITED_SUFFIX}` : name.trim();
          await KeyChain.EditWallet({
            walletId: wallet.id,
            name: walletName,
            colorIndex: colorIndex,
          });

          if (wallet.id === activeWallet?.id) {
            setActiveWallet({ ...activeWallet, name: walletName, colorIndex });
          }

          onClose(false);
        } catch (error: any) {
          setError(error.message);
        }
      }
    };

    const address = useMemo(() => {
      if (activeChain === 'aggregated' || !wallet) return '';
      const evmChain = chainInfoStore.chainInfos[activeChain].evmOnlyChain;
      if (evmChain) {
        if (wallet.addresses[activeChain]) {
          return getEthereumAddress(wallet.addresses[activeChain]);
        } else {
          return '';
        }
      } else {
        return wallet.addresses[activeChain];
      }
    }, [activeChain, chainInfoStore.chainInfos, wallet]);

    return (
      <>
        <BottomModal
          fullScreen
          isOpen={isVisible}
          onClose={() => onClose(false)}
          title={'Edit wallet'}
          footerComponent={
            <View style={styles.footerRow}>
              <Button
                size={'md'}
                variant={'secondary'}
                style={styles.footerButton}
                disabled={!name}
                onPress={() => onClose(false)}
              >
                Cancel
              </Button>
              <Button
                size={'md'}
                style={styles.footerButton}
                disabled={!name}
                onPress={handleSaveChanges}
              >
                Save changes
              </Button>
            </View>
          }
          secondaryActionButton={
            <Button
              variant={'ghost'}
              size={'icon'}
              style={styles.removeBtn}
              testID='btn-remove-wallet-bin'
              onPress={() => setShowRemoveWallet(true)}
            >
              <Text>Remove wallet</Text>
              <TrashSimple weight='fill' size={18} color="#FF4D4F" />
            </Button>
          }
        >
          <View style={styles.card}>
            <Image
              source={{ uri: wallet?.avatar ?? getWalletIconAtIndex(colorIndex) }}
              style={styles.walletIcon}
              resizeMode="contain"
            />

            {address ? <CopyButton address={address} /> : null}

            {wallet ? (
              <Input
                autoFocus
                placeholder="Enter wallet Name"
                maxLength={24}
                value={name.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
                onChangeText={handleInputChange}
                style={styles.input}
                trailingElement={
                  <Text style={styles.trailingText}>{`${name.length}/24`}</Text>
                }
              />
            ) : null}

            {/* Color Picker */}
            <View style={styles.colorRow}>
              {walletColors.map((color, index) => {
                const isSelected = colorIndex === index;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setColorIndex(index)}
                    style={[
                      styles.colorCircleWrapper,
                      isSelected && { borderWidth: 2, borderColor: color },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                      ]}
                    >
                      {isSelected && <Check size={12} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {!!error && <ErrorCard style={styles.errorCard} text={error} />}
        </BottomModal>

        <RemoveWallet
          wallet={wallet}
          address={address}
          isVisible={isShowRemoveWallet}
          onClose={(action) => {
            setShowRemoveWallet(false);
            if (action) onClose(action);
          }}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC', // bg-secondary-50
    alignItems: 'center',
    gap: 12, // Not supported, use marginBottom on elements if needed
  },
  walletIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  input: {
    borderColor: '#34D399', // ring-accent-green-200
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    width: 240,
    marginVertical: 8,
  },
  trailingText: {
    color: '#A1A1AA', // text-muted-foreground
    fontSize: 13,
    fontWeight: '500',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  colorCircleWrapper: {
    padding: 4,
    borderRadius: 999,
    marginHorizontal: 4,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  colorCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    width: 16,
    height: 16,
  },
  errorCard: {
    marginHorizontal: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  removeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
