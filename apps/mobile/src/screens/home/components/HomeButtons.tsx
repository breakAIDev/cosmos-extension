import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useActiveChain, useChainInfo, useFeatureFlags, useGetChains, useSelectedNetwork, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { isAptosChain, isSolanaChain } from '@leapwallet/cosmos-wallet-sdk';
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils';
import { ArrowDown, Parachute } from 'phosphor-react-native'; // or your own icon lib!
import ClickableIcon from '../../../components/clickable-icons';
import { useHardCodedActions } from '../../../components/search-modal';
import useActiveWallet from '../../../hooks/settings/useActiveWallet';
import { useQueryParams } from '../../../hooks/useQuery';
import { BuyIcon } from '../../../../assets/icons/buy-icon';
import { EarnIcon } from '../../../../assets/icons/earn-icon';
import { SendIcon } from '../../../../assets/icons/send-icon';
import { StakeIcon } from '../../../../assets/icons/stake-icon';
import { SwapIcon } from '../../../../assets/icons/swap-icon';
import Vote from '../../../../assets/icons/vote';
import { observer } from 'mobx-react-lite';
// react-native-navigation:
import { useNavigation } from '@react-navigation/native';
import { AggregatedSupportedChain } from '../../../types/utility';
import { isLedgerEnabled } from '../../../utils/isLedgerEnabled';

export const HomeButtons = observer(({ skipVote = false }: { skipVote?: boolean }) => {
  const query = useQueryParams();
  const isTestnet = useSelectedNetwork() === 'testnet';
  const activeChain = useActiveChain();
  const { activeWallet } = useActiveWallet();
  const navigation = useNavigation();
  const { data: featureFlags } = useFeatureFlags();

  const chains = useGetChains();
  const chain = useChainInfo();
  const { handleVoteClick, onSendClick, handleBuyClick, handleNobleEarnClick, handleSwapClick } = useHardCodedActions();

  const disabled =
    activeWallet?.walletType === WALLETTYPE.LEDGER &&
    !isLedgerEnabled(activeChain, chain?.bip44?.coinType, Object.values(chains));

  const isNomicChain = activeChain === 'nomic';
  const walletCtaDisabled = isNomicChain || disabled;

  const isStakeHidden =
    chain?.disableStaking ||
    !!chain?.evmOnlyChain ||
    isAptosChain(chain?.key) ||
    isBitcoinChain(chain?.key) ||
    isSolanaChain(chain?.key);

  const isVoteHidden =
    ['aggregated', 'noble'].includes(activeChain as AggregatedSupportedChain) ||
    !!chain?.evmOnlyChain ||
    isAptosChain(chain?.key) ||
    isBitcoinChain(chain?.key) ||
    isSolanaChain(chain?.key) ||
    skipVote;

  // Helper navigation (adapt as per your navigation setup)
  const navigate = (route: string) => {
    navigation.navigate(route); // or navigation.navigate('AirdropsScreen'), etc.
  };

  if (activeChain === 'initia') {
    return (
      <View style={styles.buttonRow}>
        <ClickableIcon
          label="Receive"
          icon={ArrowDown}
          onPress={() => query.set('receive', 'true')}
          disabled={walletCtaDisabled}
        />

        <ClickableIcon
          label="Send"
          icon={SendIcon}
          onPress={() => onSendClick()}
          disabled={walletCtaDisabled}
        />

        <ClickableIcon
          label="Vote"
          icon={Vote}
          onPress={() => handleVoteClick()}
        />

        {featureFlags?.airdrops.extension !== 'disabled' && (
          <ClickableIcon
            label="Airdrops"
            icon={Parachute}
            onPress={() => navigate('AirdropsScreen')}
          />
        )}
      </View>
    );
  }

  if (isTestnet) {
    return (
      <View style={styles.buttonRow}>
        <ClickableIcon
          label="Send"
          icon={SendIcon}
          onPress={() => onSendClick()}
          disabled={walletCtaDisabled}
          testID="home-generic-send-btn"
        />

        <ClickableIcon
          label="Receive"
          icon={ArrowDown}
          onPress={() => query.set('receive', 'true')}
          disabled={walletCtaDisabled}
        />

        {featureFlags?.airdrops.extension !== 'disabled' ? (
          <ClickableIcon
            label="Airdrops"
            icon={Parachute}
            onPress={() => navigate('AirdropsScreen')}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.buttonRow}>
      <ClickableIcon
        label="Buy"
        icon={BuyIcon}
        onPress={() => handleBuyClick()}
        disabled={walletCtaDisabled}
      />

      <ClickableIcon
        label="Send"
        icon={SendIcon}
        onPress={() => onSendClick()}
        disabled={walletCtaDisabled}
      />

      <ClickableIcon
        label="Swap"
        icon={SwapIcon}
        onPress={() => handleSwapClick()}
        disabled={featureFlags?.all_chains?.swap === 'disabled' || walletCtaDisabled}
      />

      {!isStakeHidden && (
        <ClickableIcon
          label="Stake"
          icon={StakeIcon}
          onPress={() => navigate('StakeScreen')}
          disabled={walletCtaDisabled}
        />
      )}

      {!isVoteHidden ? (
        <ClickableIcon
          label="Vote"
          icon={Vote}
          onPress={() => handleVoteClick()}
          disabled={walletCtaDisabled}
        />
      ) : null}

      {activeChain === 'noble' && (
        <ClickableIcon label="Earn" icon={EarnIcon} onPress={handleNobleEarnClick} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
    paddingHorizontal: 28,
    width: '100%',
  },
});
