import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CaretUp } from 'phosphor-react-native';
import Text from '../../components/text';
import { Images } from '../../../assets/images';
import { Colors } from '../../theme/colors';
import { Key, sliceAddress, useActiveWallet, useChainsStore } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Divider } from '../../components/dapp';
import { Header } from '../../components/header';
import { BG_RESPONSE } from '../../services/config/storage-keys';
import { useUpdateKeyStore } from '../../hooks/settings/useActiveWallet';
import { useDefaultTokenLogo } from '../../hooks/utility/useDefaultTokenLogo';
import { formatWalletName } from '../../utils/formatWalletName';
import WatchWalletPopup from './WatchWalletPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components/ui/button';

const SCREEN_WIDTH = Dimensions.get('window').width;

type WebsiteProps = {
  name: string;
};

type HeadingProps = {
  name: string;
};

const Heading = ({ name }: HeadingProps) => (
  <View style={styles.headingContainer}>
    <Text size="lg" style={styles.headingText}>{name}</Text>
    <Text size="md" style={styles.subHeadingText}>
      wants to connect to your wallet
    </Text>
  </View>
);

const Website = ({ name }: WebsiteProps) => (
  <View style={styles.websiteRow}>
    <Image source={{uri: Images.Misc.LockGreen}} style={styles.lockIcon} />
    <Text size="md" style={{ color: Colors.green500 }}>{name}</Text>
  </View>
);

type DisplayRequestChains =
  | {
      type: 'address';
      address: string;
      chains: { chain: SupportedChain; payloadId: string }[];
    }
  | {
      type: 'chains';
      address: undefined;
      chains: { chain: SupportedChain; payloadId: string }[];
    };

const ApproveConnection = () => {
  // ---- Props/context/hooks (get these from your RN state or pass as props/context) ----
  const [selectedWallets, setSelectedWallets] = useState<[Key] | [] | Key[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<Array<any>>([]); // Pass or load from context/store
  const [requestedChains, setRequestedChains] = useState<Array<{ chain: SupportedChain; payloadId: string }>>([]);
  const [readMoreEnabled, setReadMoreEnabled] = useState(false);

  // Replace navigation logic:
  const navigation = useNavigation();
  const isFullScreen = SCREEN_WIDTH > 800;

  // Replace all web `activeWallet` and `chains` hooks/logic with your RN hooks
  const activeWallet = useActiveWallet();
  const { chains } = useChainsStore();
  const defaultTokenLogo = useDefaultTokenLogo();
  const updateKeyStore = useUpdateKeyStore();
  const addressGenerationDone = useRef<boolean>(false);

  // ---- Approval chains display logic (memoized for performance) ----
  const displayedRequestedChains: DisplayRequestChains = useMemo(() => {
    const isMoveConnection = requestedChains.every((chain) => ['movement', 'aptos'].includes(chain.chain));
    if (isMoveConnection) {
      return {
        type: 'address',
        chains: requestedChains,
        address: selectedWallets?.[0]?.addresses?.[requestedChains[0]?.chain] || '',
      };
    }

    const isEvmConnection = requestedChains.every((chain) => chains[chain.chain]?.evmOnlyChain);
    if (isEvmConnection && selectedWallets?.[0]?.pubKeys) {
      const address = pubKeyToEvmAddressToShow(
        selectedWallets[0].pubKeys[requestedChains[0]?.chain] || selectedWallets[0].pubKeys.evmos,
      );

      return {
        type: 'address',
        chains: requestedChains,
        address,
      };
    }

    const isSolanaConnection = requestedChains.every((chain) => ['solana'].includes(chain.chain));
    if (isSolanaConnection) {
      return {
        type: 'address',
        chains: requestedChains,
        address: selectedWallets?.[0]?.addresses?.[requestedChains[0]?.chain] || '',
      };
    }

    const isSuiConnection = requestedChains.every((chain) => ['sui'].includes(chain.chain));
    if (isSuiConnection) {
      return {
        type: 'address',
        chains: requestedChains,
        address: selectedWallets?.[0]?.addresses?.[requestedChains[0]?.chain] || '',
      };
    }

    const uniqueChainRequests = requestedChains.reduce(
      (acc: Array<{ chain: SupportedChain; payloadId: string }>, element) => {
        const existingRequest = acc.find((request) => request.chain === element.chain);
        if (!existingRequest) {
          acc.push(element);
          return acc;
        }
        return acc;
      },
      [],
    );
    return {
      type: 'chains',
      chains: uniqueChainRequests,
    };
  }, [chains, requestedChains, selectedWallets]);

  useEffect(() => {
    async function generateAddresses() {
      const wallet = selectedWallets[0];
      if (!wallet || !displayedRequestedChains?.chains || addressGenerationDone.current) return;

      const chainsToGenerateAddresses =
        displayedRequestedChains.chains
          .filter((chain) => {
            const hasAddress = selectedWallets?.[0]?.addresses?.[chain.chain];
            const hasPubKey = selectedWallets?.[0]?.pubKeys?.[chain.chain];
            return (chains[chain.chain] && !hasAddress) || !hasPubKey;
          })
          ?.map((chain) => chain.chain) ?? [];

      if (!chainsToGenerateAddresses?.length) {
        return;
      }

      const _chainInfos: Partial<Record<SupportedChain, ChainInfo>> = {};

      for await (const chain of chainsToGenerateAddresses) {
        _chainInfos[chain] = chains[chain];
      }
      const keyStore = await updateKeyStore(wallet, chainsToGenerateAddresses, 'UPDATE', undefined, _chainInfos);
      addressGenerationDone.current = true;
      const newSelectedWallets = selectedWallets.map((wallet) => {
        if (!keyStore) return wallet;
        const newWallet = keyStore[wallet.id];
        if (!newWallet) {
          return wallet;
        }
        return newWallet;
      });
      setSelectedWallets(newSelectedWallets);
    }

    generateAddresses();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedRequestedChains, selectedWallets]);

  // ---- Cancel & Approve handlers ----
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    if (activeWallet) {
      setSelectedWallets([activeWallet]);
    }
  }, [activeWallet]);

  useEffect(() => {
    AsyncStorage.removeItem(BG_RESPONSE);
  }, [approvalRequests]);

  const handleApproveConnection = async () => {
    navigation.goBack();
  };

  // ---- Conditional rendering for loader/popup ----
  if (activeWallet?.watchWallet) {
    return <WatchWalletPopup origin={approvalRequests?.[0]?.origin} handleCancel={handleCancel} />;
  }

  // ---- Main Render ----
  return (
    <View style={styles.outer}>
      {/* Header Section */}
      <Header
        HeadingComponent={() => <Heading name={approvalRequests?.[0]?.origin || 'Connect Leap'} />}
        SubTitleComponent={() => <Website name={approvalRequests?.[0]?.origin} />}
      />

      {/* Main Content Scrollable */}
      <ScrollView
        style={styles.scrollSection}
        contentContainerStyle={{ paddingBottom: 120 }}
        bounces={false}
      >
        <View
          style={[
            styles.chainPanel,
            {
              height:
                readMoreEnabled
                  ? 405
                  : displayedRequestedChains.type === 'chains'
                  ? displayedRequestedChains.chains.length > 1
                    ? 230
                    : 100
                  : undefined,
              backgroundColor: Colors.white100,
            },
          ]}
        >
          {/* Chain List Header */}
          <TouchableOpacity
            style={[
              styles.chainListHeader,
              {
                marginBottom: displayedRequestedChains.type === 'chains' ? 16 : 0,
                // Optionally, add cursor pointer style for web (not needed for native)
              },
            ]}
            onPress={() => setReadMoreEnabled(false)}
            activeOpacity={0.7}
          >
            <View style={styles.chainListHeaderRow}>
              <Image
                source={{uri: Images.Misc.WalletIconTeal}}
                style={{ width: 20, height: 20, marginRight: 12 }}
                resizeMode="contain"
              />
              <Text size="md" style={[styles.headerText, { color: Colors.black100, fontWeight: 'bold' }]}>
                {`${displayedRequestedChains.type === 'chains' ? 'Connecting ' : ''}${formatWalletName(
                  activeWallet?.name ?? '',
                )}`}
              </Text>
              {displayedRequestedChains.type === 'chains' &&
                displayedRequestedChains.chains.length > 1 &&
                readMoreEnabled && <CaretUp size={16} color="#6B7280" style={{ marginLeft: 'auto' }} />}
            </View>
            {displayedRequestedChains.type === 'address' ? (
              <Text
                size="sm"
                style={[styles.headerText, { marginLeft: 'auto', fontWeight: 'bold', color: Colors.black100 }]}
              >
                {sliceAddress(displayedRequestedChains.address)}
              </Text>
            ) : null}
          </TouchableOpacity>

          {/* Chain Rows */}
          {displayedRequestedChains.type === 'chains' && (
            <View
              style={[
                styles.chainRows,
                {
                  height:
                    readMoreEnabled
                      ? 340
                      : requestedChains.length > 2
                      ? 120
                      : requestedChains.length === 2
                      ? 70
                      : 16,
                  marginBottom: requestedChains.length <= 1 ? 16 : 8,
                },
              ]}
            >
              {displayedRequestedChains.chains.map((requestedChain, index) => {
                const isLast = index === displayedRequestedChains.chains.length - 1;
                const hasAddress = selectedWallets?.[0]?.addresses?.[requestedChain.chain];
                let address;
                if (hasAddress) {
                  address = chains[requestedChain.chain]?.evmOnlyChain
                    ? pubKeyToEvmAddressToShow(selectedWallets?.[0]?.pubKeys?.[requestedChain.chain])
                    : selectedWallets?.[0]?.addresses?.[requestedChain.chain];
                } else {
                  const evmosPubkey = selectedWallets?.[0]?.pubKeys?.['evmos'];
                  const canGenerateEvmAddress = chains[requestedChain.chain]?.evmOnlyChain && evmosPubkey;
                  address = canGenerateEvmAddress ? pubKeyToEvmAddressToShow(evmosPubkey) : '';
                }

                const showRow = index <= 2 || readMoreEnabled;

                return showRow ? (
                  <React.Fragment key={requestedChain.payloadId}>
                    <View
                      style={[
                        styles.chainRow,
                        {
                          paddingVertical: displayedRequestedChains.chains.length > 1 ? 10 : 0,
                          paddingHorizontal: 20,
                        },
                      ]}
                    >
                      <Image
                        source={
                          typeof chains[requestedChain.chain]?.chainSymbolImageUrl === 'string'
                            ? {uri: chains[requestedChain.chain]?.chainSymbolImageUrl}
                            : {uri: chains[requestedChain.chain]?.chainSymbolImageUrl ?? defaultTokenLogo}
                        }
                        style={{ width: 16, height: 16, marginRight: 8 }}
                        resizeMode="contain"
                      />
                      <Text size="xs" style={{ color: '#9CA3AF' /* text-gray-400 */ }}>
                        {chains[requestedChain.chain]?.chainName ?? ''}
                      </Text>
                      <Text size="xs" style={[{ color: '#9CA3AF', marginLeft: 'auto' }]}>
                        {sliceAddress(address)}
                      </Text>
                    </View>
                    {!isLast && (
                      <View style={{ paddingHorizontal: 20 }}>
                        <Divider />
                      </View>
                    )}
                  </React.Fragment>
                ) : null;
              })}
              {!readMoreEnabled && displayedRequestedChains.chains.length > 3 && (
                <TouchableOpacity onPress={() => setReadMoreEnabled(true)} style={styles.viewMoreBtn}>
                  <Text size="xs" style={[{ color: Colors.osmosisPrimary, marginLeft: 'auto' }]}>
                    {`view more (${displayedRequestedChains.chains.length - 3})`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Permission Info */}
        {!readMoreEnabled ? (
          <View
            style={[
              styles.permissionPanel,
              {
                backgroundColor: Colors.white100,
                borderRadius: 16,
                padding: 16,
                marginTop: 16,
                marginBottom: 16,
              },
            ]}
          >
            <Text size="xs" style={{ color: '#D1D5DB', marginBottom: 4 /* text-gray-300 */ }}>
              This app will be able to
            </Text>
            <View style={styles.permissionRow}>
              <Image source={{uri: Images.Misc.GreenTick}} style={styles.permissionIcon} resizeMode="contain" />
              <Text size="sm" style={styles.permissionText}>
                View your wallet balance and activity
              </Text>
            </View>
            <View style={styles.permissionRow}>
              <Image source={{uri: Images.Misc.GreenTick}} style={styles.permissionIcon} resizeMode="contain" />
              <Text size="sm" style={styles.permissionText}>
                Request approval for transactions.
              </Text>
            </View>
            <View style={styles.permissionDivider} />
            <Text size="xs" style={{ color: '#D1D5DB', marginBottom: 4 /* text-gray-300 */ }}>
              This app won&apos;t be able to
            </Text>
            <View style={styles.permissionRow}>
              <Image source={{uri: Images.Misc.GreyCross}} style={styles.permissionIcon} resizeMode="contain" />
              <Text size="sm" style={styles.permissionText}>
                Move funds without your permission
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: Colors.white100,
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingTop: 12,
            width: SCREEN_WIDTH,
            justifyContent: isFullScreen ? 'center' : 'space-between',
            gap: isFullScreen ? 16 : 8,
          },
        ]}
      >
        <Button
          style={[styles.actionBtn, { backgroundColor: Colors.gray900, borderColor: Colors.white100 }]}
          onPress={handleCancel}
        >
          Cancel
        </Button>
        <Button
          style={[styles.actionBtn, { backgroundColor: Colors.cosmosPrimary, borderColor: Colors.white100 }]}
          onPress={handleApproveConnection}
          disabled={selectedWallets.length <= 0}
        >
          Connect
        </Button>
      </View>
    </View>
  );
};

export default ApproveConnection;

// ----- Styles -----
const styles = StyleSheet.create({
    outer: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.white100,
  },
  scrollSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chainPanel: {
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    minHeight: 100,
    width: '100%',
    overflow: 'hidden',
  },
  chainListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  chainListHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    fontWeight: 'bold',
  },
  chainRows: {
    flexDirection: 'column',
    width: '100%',
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  viewMoreBtn: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: 'flex-end',
  },
  permissionPanel: {
    width: '100%',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  permissionIcon: {
    width: 12,
    height: 12,
    marginRight: 8,
  },
  permissionText: {
    color: '#181818',
  },
  permissionDivider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 8,
    opacity: 0.5,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingBottom: 24,
    alignItems: 'center',
  },
  actionBtn: {
    height: 48,
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white100,
    paddingHorizontal: 16,
    paddingTop: 16,
    width: SCREEN_WIDTH,
  },
  headingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  headingText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subHeadingText: {
    color: Colors.gray800,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  lockIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
    resizeMode: 'contain',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  chainBox: {
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Add chain list and details here
  },
  chainIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    resizeMode: 'contain',
  },
  chainAddress: {
    marginLeft: 'auto',
  },
  readMoreButton: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  permissionBox: {
    backgroundColor: Colors.white100,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  permissionTitle: {
    color: Colors.gray400,
    marginBottom: 6,
  },
  permIcon: {
    width: 12,
    height: 12,
    marginRight: 8,
    resizeMode: 'contain',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.white100,
  },
  cancelButton: {
    height: 48,
    backgroundColor: Colors.gray900,
    color: Colors.white100,
    flex: 1,
    marginRight: 8,
  },
  connectButton: {
    height: 48,
    backgroundColor: Colors.cosmosPrimary,
    color: Colors.white100,
    flex: 1,
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
