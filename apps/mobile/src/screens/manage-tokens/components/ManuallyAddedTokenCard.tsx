import React, { useMemo } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import {
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
} from '@leapwallet/cosmos-wallet-store';
import { observer } from 'mobx-react-lite';
import { useGetExplorerAccountUrl } from '@leapwallet/cosmos-wallet-hooks';
import { capitalize, sliceWord } from '../../../utils/strings';

import { CustomToggleCard } from './CustomToggleCard';
import { TokenTitle } from './TokenTitle';
import { TokenType } from './TokenType';

type ManuallyAddedTokenCardProps = {
  index: number;
  token: NativeDenom;
  tokensLength: number;
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>;
  fetchedTokens: string[];
  onDeleteClick: (token: NativeDenom) => void;
  betaERC20DenomsStore: BetaERC20DenomsStore;
  betaCW20DenomsStore: BetaCW20DenomsStore;
  disabledCW20DenomsStore: DisabledCW20DenomsStore;
  enabledCW20DenomsStore: EnabledCW20DenomsStore;
};

export const ManuallyAddedTokenCard = observer(
  ({
    index,
    token,
    tokensLength,
    handleToggleChange,
    fetchedTokens,
    onDeleteClick,
    betaCW20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    betaERC20DenomsStore,
  }: ManuallyAddedTokenCardProps) => {
    const { betaCW20Denoms } = betaCW20DenomsStore;
    const { betaERC20Denoms } = betaERC20DenomsStore;
    const disabledCW20Denoms = disabledCW20DenomsStore.disabledCW20Denoms;
    const enabledCW20Denoms = enabledCW20DenomsStore.enabledCW20Denoms;
    const { getExplorerAccountUrl } = useGetExplorerAccountUrl({});

    const isFirst = index === 0;
    const isLast = index === tokensLength - 1;

    const title = sliceWord(token?.name ?? capitalize(token.coinDenom.toLowerCase()) ?? '', 7, 4);
    const subTitle = sliceWord(token.coinDenom, 4, 4);
    const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom);

    const tokenType = useMemo(() => {
      if (betaCW20Denoms[token.coinMinimalDenom]) {
        return <TokenType type='cw20' style={styles.cw20} />;
      } else if (betaERC20Denoms[token.coinMinimalDenom]) {
        return <TokenType type='erc20' style={styles.erc20} />;
      } else if (token.coinMinimalDenom.trim().toLowerCase().startsWith('factory')) {
        return <TokenType type='factory' style={styles.factory} />;
      }
      return <TokenType type='native' style={styles.native} />;
    }, [betaCW20Denoms, betaERC20Denoms, token.coinMinimalDenom]);

    // On mobile, open URL via Linking
    const handleRedirectionClick = () => {
      if (explorerURL) Linking.openURL(explorerURL);
    };

    return (
      <View style={[styles.cardWrap, isFirst && { marginTop: 24 }, isLast && { marginBottom: 12 }]}>
        <CustomToggleCard
          title={
            <TokenTitle
              title={title}
              showRedirection={!!betaCW20Denoms[token.coinMinimalDenom] && !!explorerURL}
              handleRedirectionClick={handleRedirectionClick}
            />
          }
          subtitle={subTitle}
          isRounded={isLast}
          imgSrc={token.icon}
          TokenType={tokenType}
          isToggleChecked={
            !disabledCW20Denoms.includes(token.coinMinimalDenom) &&
            !fetchedTokens.includes(token.coinMinimalDenom) &&
            enabledCW20Denoms.includes(token.coinMinimalDenom)
          }
          onToggleChange={isEnabled => handleToggleChange(isEnabled, token.coinMinimalDenom)}
          onDeleteClick={() => onDeleteClick(token)}
          style={[
            styles.card,
            isLast && styles.roundedBottom,
          ]}
          imageStyle={styles.tokenImg}
        />
        {isLast ? <View style={{ height: 1, backgroundColor: 'transparent', marginTop: 24 }} /> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: 16,
    width: '100%',
  },
  card: {
    backgroundColor: '#f3f4f6', // secondary-100
    borderRadius: 16,
    width: '100%',
  },
  roundedBottom: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  tokenImg: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  native: { backgroundColor: '#ff9f0a1a', color: '#ff9500' },
  cw20: { backgroundColor: '#29A8741A', color: '#22c55e' },
  erc20: { backgroundColor: '#A52A2A1A', color: '#a52a2a' },
  factory: { backgroundColor: '#0AB8FF1A', color: '#14b8a6' },
});

export default ManuallyAddedTokenCard;
