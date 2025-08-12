import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, } from 'react-native';
import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { useGetBTCDepositInfo, useNomicBTCDepositConstants } from '../../../hooks/nomic-btc-deposit';
import { useCaptureUIException } from '../../../hooks/perf-monitoring/useCaptureUIException';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { Buttons } from '@leapwallet/leap-ui';
import { UserClipboard } from '../../../utils/clipboard';
import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { formatAuthzDate } from '../../../utils/formatAuthzDate';
import { Images } from '../../../../assets/images'; // Make sure this is a require-able image for RN
import { Colors, getChainColor } from '../../../theme/colors';
import { observer } from 'mobx-react-lite';
import { useQueryParams } from '../../../hooks/useQuery';
import { queryParams } from '../../../utils/query-params';
import BottomModal from '../../../components/new-bottom-modal';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export function DepositBTCBanner() {
  const { data } = useNomicBTCDepositConstants();
  const activeChain = useActiveChain();
  const query = useQueryParams();

  if (
    data &&
    !data.banner.chains.includes(activeChain) &&
    !data.banner.chains.includes('All')
  ) {
    return null;
  }

  return data ? (
    <TouchableOpacity
      style={styles.bannerBtn}
      onPress={() => query.set(queryParams.btcDeposit, 'true')}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: data?.banner.banner_url ?? '' }}
        alt="Deposit BTC to get nBTC - Powered by Nomic"
        style={styles.bannerImg}
        resizeMode="cover"
      />
    </TouchableOpacity>
  ) : null;
}

type NomicBTCDepositProps = {
  selectedChain: SupportedChain;
  handleChainBtnClick: () => void;
};

export const NomicBTCDeposit = observer(({ selectedChain, handleChainBtnClick }: NomicBTCDepositProps) => {
  const { data: btcDepositInfo, status } = useGetBTCDepositInfo(selectedChain);
  const activeChain = useActiveChain();
  const chainInfos = useChainInfos();
  const defaultTokenLogo = useDefaultTokenLogo();
  const { data } = useNomicBTCDepositConstants();

  useCaptureUIException(
    btcDepositInfo?.code === 1 || btcDepositInfo?.code === 2 ? btcDepositInfo.reason : null,
  );

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <LoaderAnimation color="" />
      </View>
    );
  }

  if (status === 'success' && btcDepositInfo) {
    // Select Chain Dropdown
    const SelectChainDropdown = (
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Receive nBTC on</Text>
        <TouchableOpacity style={styles.chainBtn} onPress={handleChainBtnClick} activeOpacity={0.7}>
          <Image
            source={{ uri: chainInfos[selectedChain].chainSymbolImageUrl ?? defaultTokenLogo}}
            style={styles.chainIcon}
          />
          <Text style={styles.chainName}>{chainInfos[selectedChain]?.chainName ?? ''}</Text>
          <Image
            source={{uri: Images.Misc.ArrowDown}} // Provide a static image source for RN, or replace with an icon
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>
    );

    if (btcDepositInfo.code === 0) {
      const { qrCodeData, bitcoinAddress, expirationTimeMs } = btcDepositInfo;
      const date = formatAuthzDate(expirationTimeMs);

      return (
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {SelectChainDropdown}
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: qrCodeData }}
              style={styles.qrImg}
              resizeMode="contain"
            />
          </View>
          <Buttons.CopyWalletAddress
            color={getChainColor(activeChain)}
            walletAddress={sliceAddress(bitcoinAddress)}
            data-testing-id="copy-wallet-address"
            onCopy={() => {
              UserClipboard.copyText(bitcoinAddress);
            }}
          />
          <Text style={styles.depositText}>
            Deposit BTC to this address to receive nBTC
          </Text>
          <Text style={styles.warningText}>
            {date === 'Expired'
              ? 'This address is Expired.'
              : `This address is valid till ${date}. Deposits sent after this time will be lost.`}
          </Text>

          <View style={styles.nomicDetailsContainer}>
            <View style={styles.nomicHeader}>
              <View>
                <Text style={styles.nomicTitle}>Powered by Nomic</Text>
                <Text style={styles.nomicSub}>Transaction details</Text>
              </View>
              <Image
                source={{uri: Images.Logos.NomicFullnameLogo}}
                style={styles.nomicLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.nomicDivider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Bitcoin Miner Fee:</Text>
              <Text style={styles.feeValue}>
                {data?.deposit_sheet.bitcoin_miner_fee ?? ''}
              </Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Estimated Arrival:</Text>
              <Text style={styles.feeValue}>
                {data?.deposit_sheet.estimated_arrival ?? ''}
              </Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Nomic Bridge Fee:</Text>
              <Text style={styles.feeValue}>
                {data?.deposit_sheet.nomic_bridge_fee[
                  selectedChain === 'nomic' ? 'nomic' : 'non_nomic'
                ] ?? ''}
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    if (btcDepositInfo.code === 2 || btcDepositInfo.code === 1) {
      return (
        <View style={styles.errorContainer}>
          {SelectChainDropdown}
          <Image
            source={{ uri: 'https://assets.leapwallet.io/nomic-btc-deposit-error.png' }}
            style={{ width: 200, height: 120, marginTop: 10 }}
            resizeMode="contain"
          />
          <Text style={styles.errorTitle}>
            {btcDepositInfo.code === 2 ? 'Bridge limit reached.' : 'Error'}
          </Text>
          <Text style={styles.errorMsg}>
            {btcDepositInfo.code === 2
              ? 'The Nomic Bitcoin bridge is currently at capacity.\nPlease try again later.'
              : btcDepositInfo.reason}
          </Text>
        </View>
      );
    }
  }
  return null;
});

export const BitcoinDeposit = observer(() => {
  const query = useQueryParams();
  const isVisible = query.get(queryParams.btcDeposit) === 'true';

  const activeChain = useActiveChain();
  const [showSelectChain, setShowSelectChain] = useState(false);
  const { data } = useNomicBTCDepositConstants();
  const [selectedChain, setSelectedChain] = useState(activeChain);

  useEffect(() => {
    if (data && data.ibcChains?.length) {
      if (data.ibcChains?.includes(activeChain)) {
        setSelectedChain(activeChain);
      } else {
        setSelectedChain(data.ibcChains?.[0] as SupportedChain);
      }
    }
  }, [activeChain, data]);

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => query.remove(queryParams.btcDeposit)}
      title="Bitcoin Deposit Address"
    >
      <>
        <NomicBTCDeposit selectedChain={selectedChain} handleChainBtnClick={() => setShowSelectChain(true)} />
        {/* <SelectChainSheet
          chainsToShow={data?.ibcChains}
          isVisible={showSelectChain}
          onClose={() => setShowSelectChain(false)}
          selectedChain={selectedChain}
          onChainSelect={(chainName) => {
            setSelectedChain(chainName);
            setShowSelectChain(false);
          }}
          chainTagsStore={chainTagsStore}
        /> */}
      </>
    </BottomModal>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 40,
    height: 450,
    justifyContent: 'center',
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#fff', // replace with your color
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: '100%',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#555',
  },
  chainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#f1f1f1', // replace with your color
    padding: 8,
  },
  chainIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  chainName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  arrowIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
    marginRight: 4,
  },
  qrContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 4,
    marginTop: 20,
    marginBottom: 10,
    elevation: 2,
  },
  qrImg: {
    width: 232,
    height: 233,
  },
  depositText: {
    color: '#222', // dark:text-white-100
    fontSize: 16,
    marginTop: 12,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    width: 250,
    marginTop: 8,
  },
  nomicDetailsContainer: {
    borderRadius: 16,
    padding: 12,
    width: '100%',
    gap: 8,
    marginTop: 16,
    backgroundColor: 'linear-gradient(93deg, #54298D 37.84%, #310E6F 95.03%)', // linear gradients: use expo-linear-gradient or similar
  },
  nomicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomicTitle: {
    color: '#fff',
    fontSize: 14,
  },
  nomicSub: {
    color: '#fff',
    fontSize: 12,
  },
  nomicLogo: {
    width: 84,
    height: 32,
  },
  nomicDivider: {
    borderBottomWidth: 0.5,
    borderColor: '#48237A',
    marginVertical: 4,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  feeLabel: {
    color: '#bbb',
    fontSize: 12,
  },
  feeValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 450,
    paddingVertical: 24,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 18,
    marginTop: 16,
  },
  errorMsg: {
    color: '#222',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  bannerBtn: {
    borderRadius: 20,
    width: 312,
    height: 62,
    marginVertical: 24,
    overflow: 'hidden',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
});
