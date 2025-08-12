import { Key as WalletKey, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, sleep } from '@leapwallet/cosmos-wallet-sdk';
import { captureException } from '@sentry/react-native';
import { Divider, KeyNew as Key, ValueNew as Value } from '../../components/dapp';
import { ErrorCard } from '../../components/ErrorCard';
import { InfoCard } from '../../components/info-card';
import { LoaderAnimation } from '../../components/loader/Loader';
import BottomModal from '../../components/new-bottom-modal';
import { Button } from '../../components/ui/button';
import { ButtonName, ButtonType, EventName } from '../../services/config/analytics';
import { BETA_CHAINS } from '../../services/config/storage-keys';
import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import useActiveWallet, { useUpdateKeyStore } from '../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../hooks/useChainInfos';
import { useDefaultTokenLogo } from '../../hooks/utility/useDefaultTokenLogo';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { chainTagsStore } from '../../context/chain-infos-store';
import { rootStore } from '../../context/root-store';
import { Colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mixpanel from '../../mixpanel'

type AddFromChainStoreProps = {
  readonly isVisible: boolean;
  readonly onClose: VoidFunction;
  newAddChain: ChainInfo;
  skipUpdatingActiveChain?: boolean;
  successCallback?: () => void;
};

const AddFromChainStore = observer(
  ({
    isVisible,
    onClose,
    newAddChain,
    skipUpdatingActiveChain,
    successCallback,
  }: AddFromChainStoreProps) => {
    const [showMore, setShowMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const defaultTokenLogo = useDefaultTokenLogo();
    const setChains = useChainsStore((store) => store.setChains);
    const updateKeyStore = useUpdateKeyStore();
    const { activeWallet, setActiveWallet } = useActiveWallet();
    const setActiveChain = useSetActiveChain();
    const chainInfos = useChainInfos();
    const navigation = useNavigation();

    const isEvmChain = useMemo(() => !!newAddChain && 'evmOnlyChain' in newAddChain, [newAddChain]);

    const networkUrl = useMemo(() => {
      if (!newAddChain) {
        return;
      }
      if (isEvmChain) {
        return newAddChain.apis?.evmJsonRpcTest ?? newAddChain.apis?.evmJsonRpc;
      }
      return newAddChain.apis?.restTest ?? newAddChain.apis?.rest;
    }, [isEvmChain, newAddChain]);

    const newChainKey = newAddChain?.key ?? newAddChain?.chainName;

    const handleCancel = useCallback(() => {
      onClose();
    }, [onClose]);

    const onAddChain = async () => {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.CHAIN_MANAGEMENT,
          buttonName: ButtonName.ADD_CHAIN_FROM_STORE,
          redirectURL: '/home',
          addedChainName: newAddChain?.chainName,
          time: Date.now() / 1000,
        });
      } catch (e) {
        captureException(e);
      }

      setIsLoading(true);
      setChains({ ...chainInfos, [newChainKey]: newAddChain });
      rootStore.setChains({ ...chainInfos, [newChainKey]: newAddChain });
      await sleep(500);

      try {
        const updatedKeystore = await updateKeyStore(activeWallet as WalletKey, newChainKey, 'UPDATE', newAddChain);
        let betaChains = JSON.parse((await AsyncStorage.getItem(BETA_CHAINS)) ?? '{}');
        betaChains[newChainKey] = newAddChain;
        await AsyncStorage.setItem(BETA_CHAINS, JSON.stringify(betaChains));

        if (isEvmChain) {
          chainTagsStore.setBetaChainTags(newAddChain.chainId, ['EVM']);
        } else {
          chainTagsStore.setBetaChainTags(newAddChain.chainId, ['Cosmos']);
        }

        if (!skipUpdatingActiveChain) {
          if (activeWallet) {
            await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey);
          }
          await setActiveChain(newChainKey, newAddChain);
          navigation.navigate('Home'); // Replace with your navigation logic
        }
        successCallback?.();
      } catch (error) {
        setErrors((s) => ({ ...s, submit: 'Unable to add chain' }));
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        fullScreen
        title="Add from chain store"
        hideActionButton
      >
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerRow}>
              <Image
                source={{ uri: newAddChain?.chainSymbolImageUrl ?? defaultTokenLogo }}
                style={styles.chainLogo}
                resizeMode="cover"
                // onError={imgOnError(defaultTokenLogo)} // You may need to handle image error in RN
              />
              <Text style={styles.chainName}>{newAddChain?.chainName || '--'}</Text>
            </View>

            <View style={styles.cardSection}>
              <View style={styles.infoBlock}>
                <Key>Network Name</Key>
                <Value>{newAddChain?.chainName || '--'}</Value>
              </View>
              <Divider/>
              <View style={styles.infoBlock}>
                <Key>Network URL</Key>
                <Value>{networkUrl || '--'}</Value>
              </View>
              <Divider/>
              <View style={styles.infoBlock}>
                <Key>Chain ID</Key>
                <Value>{newAddChain?.chainId || '--'}</Value>
              </View>
              <Divider/>
              <View style={styles.infoBlock}>
                <Key>Currency Symbol</Key>
                <Value>{newAddChain?.denom || '--'}</Value>
              </View>
              {showMore && (
                <>
                  <Divider/>
                  <View style={styles.infoBlock}>
                    <Key>Coin Type</Key>
                    <Value>{newAddChain?.bip44?.coinType || '--'}</Value>
                  </View>
                  {!isEvmChain && (
                    <>
                      <Divider/>
                      <View style={styles.infoBlock}>
                        <Key>Address Prefix</Key>
                        <Value>{newAddChain?.addressPrefix || '--'}</Value>
                      </View>
                      <Divider/>
                      <View style={styles.infoBlock}>
                        <Key>Chain Registry Path</Key>
                        <Value>{newAddChain?.chainRegistryPath || '--'}</Value>
                      </View>
                    </>
                  )}
                </>
              )}
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowMore(!showMore)}
                activeOpacity={0.8}
              >
                <Text style={styles.showMoreText}>
                  {showMore ? 'Show less' : 'Show more'}
                </Text>
              </TouchableOpacity>
            </View>

            <InfoCard
              message="Some wallet features may not work as expected for custom-added chains"
              style={styles.infoCard}
            />

            {errors.submit ? <ErrorCard text={errors.submit} /> : null}
          </ScrollView>
          <View style={styles.footerRow}>
            <Button style={styles.footerBtn} onPress={handleCancel}>
              Cancel
            </Button>
            <Button
              style={styles.footerBtn}
              onPress={onAddChain}
              disabled={isLoading || Object.values(errors).length > 0}
            >
              {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Add Chain'}
            </Button>
          </View>
        </View>
      </BottomModal>
    );
  },
);

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    marginBottom: 24,
  },
  chainLogo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 16,
  },
  chainName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  cardSection: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },
  infoBlock: {
    marginBottom: 6,
  },
  showMoreBtn: {
    marginTop: 10,
    marginBottom: 0,
    alignItems: 'flex-start',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#726FDC',
    height: 20,
  },
  infoCard: {
    marginVertical: 24,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default AddFromChainStore;
