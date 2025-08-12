import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { getEthereumAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ActiveChainStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store';
import { KeyChain } from '@leapwallet/leap-keychain';
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { Check, Wallet } from 'phosphor-react-native';
import BottomModal from '../../components/bottom-modal';
import { ErrorCard } from '../../components/ErrorCard';
import IconButton from '../../components/icon-button';
import { LEDGER_NAME_EDITED_SUFFIX, LEDGER_NAME_EDITED_SUFFIX_REGEX } from '../../services/config/config';
import { AGGREGATED_CHAIN_KEY } from '../../services/config/constants';
import { useChainPageInfo } from '../../hooks';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { getChainColor, walletColors } from '../../theme/colors';
import { UserClipboard } from '../../utils/clipboard';
import { sliceAddress } from '../../utils/strings';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Input } from '../../components/ui/input';

type EditWalletFormProps = {
  wallet: Key;
  isVisible: boolean;
  onClose: (closeParent: boolean) => void;
  activeChainStore: ActiveChainStore;
  chainInfosStore: ChainInfosStore;
};

export const EditWalletForm = observer(
  ({ isVisible, wallet, onClose, activeChainStore, chainInfosStore }: EditWalletFormProps) => {
    const [name, setName] = useState(wallet?.name ?? '');
    const [error, setError] = useState<string>('');
    const [isShowRemoveWallet, setShowRemoveWallet] = useState<boolean>(false);
    const { activeWallet, setActiveWallet } = useActiveWallet();
    const activeChain = activeChainStore.activeChain;
    const [colorIndex, setColorIndex] = useState<number>(wallet?.colorIndex ?? 0);
    const isDark = useTheme().theme === ThemeName.DARK;

    useEffect(() => {
      setError('');
      setName(wallet?.name ?? '');
      setColorIndex(wallet?.colorIndex ?? 0);
    }, [wallet, isVisible]);

    const { topChainColor } = useChainPageInfo();

    const handleSaveChanges = async () => {
      if (name) {
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

    const getAddress = (chain: SupportedChain, wallet: Key) => {
      const evmChain = chainInfosStore.chainInfos[chain].evmOnlyChain;
      if (evmChain) {
        return getEthereumAddress(wallet.addresses[chain]);
      } else {
        return wallet.addresses[chain];
      }
    };

    return (
      <>
        <BottomModal
          // containerDiv is web only; omit in RN
          isOpen={isVisible}
          onClose={() => onClose(false)}
          title={'Edit wallet'}
          closeOnBackdropClick={true}
          secondaryActionButton={
            <View style={styles.iconButtonContainer}>
              <IconButton
                onPress={() => setShowRemoveWallet(true)}
                image={{src: 0, alt: Images.Misc.DeleteRed}}
                data-testing-id="btn-remove-wallet-bin"
              />
            </View>
          }
        >
          <View style={styles.centeredColumn}>
            <View style={styles.modalContent}>
              <View
                style={[
                  styles.walletIconCircle,
                  { backgroundColor: walletColors[colorIndex] },
                ]}
              >
                <Wallet size={40} color="#fff" />
              </View>

              {activeChain && activeChain !== AGGREGATED_CHAIN_KEY && wallet && (
                <Buttons.CopyWalletAddress
                  color={getChainColor(activeChain)}
                  walletAddress={sliceAddress(getAddress(activeChain, wallet))}
                  data-testing-id="copy-wallet-address"
                  style={{
                    backgroundColor: isDark ? '#383838' : '#E8E8E8',
                    color: !isDark ? '#383838' : '#E8E8E8',
                  }}
                  onCopy={() => {
                    UserClipboard.copyText(getAddress(activeChain, wallet));
                  }}
                />
              )}

              {wallet ? (
                <View style={styles.inputContainer}>
                  <Input
                    placeholder="Enter wallet Name"
                    maxLength={24}
                    value={name.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
                    onChangeText={text => {
                      setError('');
                      if (text.length <= 24) setName(text);
                    }}
                  />
                  <Text style={styles.counterText}>{`${name.length}/24`}</Text>
                </View>
              ) : null}

              <View style={styles.colorRow}>
                {walletColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setColorIndex(index)}
                    style={[
                      styles.colorOuter,
                      { borderColor: color },
                      colorIndex === index && styles.colorSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.colorInner,
                        { backgroundColor: color },
                      ]}
                    >
                      {index === colorIndex && <Check size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {!!error && <ErrorCard text={error} />}
            <View style={styles.saveButtonRow}>
              <Buttons.Generic disabled={!name} color={topChainColor} onClick={handleSaveChanges}>
                Save changes
              </Buttons.Generic>
            </View>
          </View>
        </BottomModal>

        {/* 
        // TODO: RemoveWallet modal, if needed, should be implemented in React Native.
        <RemoveWallet
          wallet={wallet}
          isVisible={isShowRemoveWallet}
          onClose={(action) => {
            setShowRemoveWallet(false)
            if (action) onClose(action)
          }}
        /> 
        */}
      </>
    );
  },
);

const styles = StyleSheet.create({
  iconButtonContainer: {
    position: 'absolute',
    top: 22,
    left: 28,
    zIndex: 10,
  },
  centeredColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  modalContent: {
    width: 344,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 20,
  },
  walletIconCircle: {
    borderRadius: 100,
    padding: 24,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  counterText: {
    position: 'absolute',
    right: 16,
    top: 14,
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  colorOuter: {
    padding: 5,
    borderRadius: 99,
    borderWidth: 2,
    marginHorizontal: 4,
  },
  colorSelected: {
    borderWidth: 3,
  },
  colorInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonRow: {
    width: 344,
    marginTop: 8,
    marginBottom: 16,
  },
});

