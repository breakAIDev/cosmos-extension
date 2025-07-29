import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
  Modal,
} from 'react-native';
import {
  removeTrailingSlash,
  TxResponse,
  useActiveChain,
  useAddress,
  useGetChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store';
import { AggregatedLoadingList } from '../../../components/aggregated';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import { PENDING_SWAP_TXS } from '../../../services/config/storage-keys';
import { useChainPageInfo } from '../../../hooks';
import { SelectedNetwork } from '../../../hooks/settings/useNetwork';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import PendingSwapsAlertStrip from '../../../screens/home/PendingSwapsAlertStrip';
import SelectChain from '../../../screens/home/SelectChain';
import qs from 'qs';
import { globalSheetsStore } from '../../../context/global-sheets-store';
import { Colors } from '../../../theme/colors';
import { AggregatedSupportedChain } from '../../../types/utility';
import { moveTxsFromCurrentToPending, TxStoreObject } from '../../../utils/pendingSwapsTxsStore';

import { ActivitySwapTxPage } from '../ActivitySwapTxPage';
import { reduceActivityInSections } from '../utils';
import { ActivityHeader } from './activity-header';
import { SelectedTx } from './ChainActivity';
import { ActivityCard, ErrorActivityView, NoActivityView, SelectAggregatedActivityChain, TxDetails } from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

type GeneralActivityProps = {
  txResponse: TxResponse;
  filteredChains?: string[];
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  chainTagsStore: ChainTagsStore;
  setSelectedChain?: React.Dispatch<React.SetStateAction<SupportedChain>>;
};

const GeneralActivity = observer(
  ({
    txResponse,
    filteredChains,
    forceChain,
    forceNetwork,
    setSelectedChain,
    chainTagsStore,
  }: GeneralActivityProps) => {
    const chains = useGetChains();
    const activeChain = useActiveChain() as AggregatedSupportedChain;
    const [showActivityChainSelector, setShowActivityChainSelector] = useState(false);
    const _activeNetwork = useSelectedNetwork();
    const { headerChainImgSrc } = useChainPageInfo();
    const [pendingSwapTxs, setPendingSwapTxs] = useState<TxStoreObject[]>([]);
    const [showSwapTxPageFor, setShowSwapTxPageFor] = useState<TxStoreObject | undefined>(undefined);
    const navigation = useNavigation<any>();

    const selectedChain = useMemo(() => {
      if (activeChain !== AGGREGATED_CHAIN_KEY) {
        return activeChain;
      }

      return forceChain ?? chains.cosmos.key;
    }, [activeChain, forceChain, chains.cosmos.key]);
    const address = useAddress(selectedChain);

    const [showChainSelector, setShowChainSelector] = useState(false);
    const [defaultFilter, setDefaultFilter] = useState('Popular');
    const [selectedTx, setSelectedTx] = useState<SelectedTx | null>(null);

    const { activity } = useMemo(() => txResponse ?? {}, [txResponse]);
    const activeNetwork = useMemo(() => forceNetwork || _activeNetwork, [_activeNetwork, forceNetwork]);

    const accountExplorerLink = useMemo(() => {
      if (chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl) {
        const accountUrl = chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl;

        if (accountUrl?.includes('PLACEHOLDER_FOR_WALLET_ADDRESS')) {
          return removeTrailingSlash((accountUrl ?? '').replace('PLACEHOLDER_FOR_WALLET_ADDRESS', address)) ?? '';
        }

        return `${removeTrailingSlash(
          chains[selectedChain]?.txExplorer?.[activeNetwork]?.accountUrl ?? '',
        )}/${address}`;
      }

      return '';
    }, [activeNetwork, address, chains, selectedChain]);

    useEffect(() => {
      async function updatePendingSwapTxs() {
        const storage = await AsyncStorage.getItem(PENDING_SWAP_TXS);

        if (storage) {
          const pendingTxs = Object.values(JSON.parse(storage) ?? {}) as TxStoreObject[];

          setPendingSwapTxs(pendingTxs);
        } else {
          setPendingSwapTxs([]);
        }
      }
      moveTxsFromCurrentToPending();
      updatePendingSwapTxs();
    }, []);

    const sections = useMemo(() => {
      const txsByDate = activity?.reduce(reduceActivityInSections, {});
      return Object.entries(txsByDate ?? {}).map((entry) => ({ title: entry[0], data: entry[1] }));
    }, [activity]);

    const hasPendingSwapTxs = useMemo(() => {
      return pendingSwapTxs?.length > 0;
    }, [pendingSwapTxs]);

    const renderShowView  = () => {
      if (!hasPendingSwapTxs && activity?.length === 0 && !txResponse?.loading) {
        return (
          <div className='mt-4'>
            <NoActivityView accountExplorerLink={accountExplorerLink} chain={selectedChain} />
          </div>
        );
      }

      if (!hasPendingSwapTxs && txResponse?.error) {
        return (
          <div className='mt-4'>
            <ErrorActivityView accountExplorerLink={accountExplorerLink} chain={selectedChain} />
          </div>
        );
      }

      return (
        <>
          {hasPendingSwapTxs && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent swaps</Text>
              {pendingSwapTxs.map((tx, i) => (
                <PendingSwapsAlertStrip
                  key={`${tx.routingInfo?.messages?.[0]?.customTxHash || i}-${tx.routingInfo?.messages?.[0]?.customMessageChainId || i}`}
                  setShowSwapTxPageFor={setShowSwapTxPageFor}
                  selectedPendingSwapTx={tx}
                />
              ))}
            </View>
          )}
          {txResponse?.loading ? (
            <AggregatedLoadingList style={styles.mt4} />
          ) : null}
          {!txResponse?.loading &&
            sections.map(({ title, data }, idx) => (
              <View style={styles.section} key={`${title}_${idx}`}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {data.map((tx: any) => (
                  <ActivityCard
                    key={tx.parsedTx.txHash}
                    content={tx.content}
                    isSuccessful={tx.parsedTx.code === 0}
                    forceChain={selectedChain}
                    titleStyle={styles.normal}
                    imgSize="sm"
                    onClick={() => setSelectedTx(tx)}
                  />
                ))}
              </View>
            ))}
          {!txResponse?.loading && accountExplorerLink ? (
            <TouchableOpacity onPress={() => Linking.openURL(accountExplorerLink)}>
              <Text style={styles.explorerLink}>Check more on Explorer</Text>
            </TouchableOpacity>
          ) : null}
        </>
      );
    };

    useEffect(() => {
      if (!showChainSelector) {
        setDefaultFilter('Popular');
      }
    }, [showChainSelector]);

    const onChainSelect = useCallback(
      (chainName: SupportedChain) => {
        setSelectedChain && setSelectedChain(chainName);
        setShowActivityChainSelector(false);
      },
      [setSelectedChain],
    );

    const onImgClick = useCallback((event?: React.MouseEvent<HTMLDivElement>, props?: { defaultFilter?: string }) => {
      setShowChainSelector(true);
      if (props?.defaultFilter) {
        setDefaultFilter(props.defaultFilter);
      }
    }, []);

    const handleOpenSideNavSheet = useCallback(() => globalSheetsStore.toggleSideNav(), []);

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {selectedTx ? (
          <TxDetails
            open={!!selectedTx}
            tx={selectedTx}
            onBack={() => setSelectedTx(null)}
            forceChain={selectedChain}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.container}>
            <ActivityHeader />
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Activity</Text>
                <Text style={styles.subtitle}>
                  {chains[selectedChain]?.chainName ?? 'Unknown Chain'}
                </Text>
              </View>
              {filteredChains?.length ? (
                <TouchableOpacity
                  style={styles.tuneBtn}
                  onPress={() => setShowActivityChainSelector(true)}
                >
                  <Image
                    source={Images.Misc.TuneIcon}
                    style={{ width: 16, height: 16, tintColor: '#000' }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ) : null}
            </View>
            {renderShowView()}
            <Modal visible={!!showActivityChainSelector} animationType="slide" transparent>
              <SelectAggregatedActivityChain
                isVisible={!!showActivityChainSelector}
                onClose={() => setShowActivityChainSelector(false)}
                onChainSelect={onChainSelect}
                chainsToShow={filteredChains as string[]}
                selectedChain={selectedChain}
                chainTagsStore={chainTagsStore}
              />
            </Modal>
            <Modal visible={!!showChainSelector} animationType="slide" transparent>
              <SelectChain
                isVisible={!!showChainSelector}
                onClose={() => setShowChainSelector(false)}
                chainTagsStore={chainTagsStore}
                defaultFilter={defaultFilter}
              />
            </Modal>
            <Modal visible={!!showSwapTxPageFor} animationType="slide" transparent>
              {showSwapTxPageFor ? (
                <ActivitySwapTxPage
                  {...showSwapTxPageFor}
                  onClose={(
                    sourceChainId?: string,
                    sourceToken?: string,
                    destinationChainId?: string,
                    destinationToken?: string,
                  ) => {
                    setShowSwapTxPageFor(undefined);
                    let queryStr = '';
                    if (sourceChainId || sourceToken || destinationChainId || destinationToken) {
                      queryStr = `?${qs.stringify({
                        sourceChainId,
                        sourceToken,
                        destinationChainId,
                        destinationToken,
                        pageSource: 'swapAgain',
                      })}`;
                      navigation.navigate('Swap', { query: queryStr });
                    }
                  }}
                />
              ) : null}
            </Modal>
          </ScrollView>
        )}
      </View>
    );
  },
);

GeneralActivity.displayName = 'GeneralActivity';
export { GeneralActivity };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  mt4: { marginTop: 16 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  explorerLink: {
    color: Colors.green600,
    textAlign: 'center',
    fontSize: 15,
    marginTop: 20,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  tuneBtn: {
    backgroundColor: '#f3f3f3',
    borderRadius: 9999,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  normal: {
    fontWeight: '400',
  },
});