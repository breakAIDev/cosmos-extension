import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import {
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
} from '@leapwallet/cosmos-wallet-store';
import { capitalize, sliceWord, useGetExplorerAccountUrl } from '@leapwallet/cosmos-wallet-hooks';
import { observer } from 'mobx-react-lite';
import { Linking } from 'react-native';

import { CustomToggleCard, TokenType } from './index';
import { TokenTitle } from './TokenTitle';

type ManuallyAddedTokensProps = {
  tokens: NativeDenom[];
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>;
  fetchedTokens: string[];
  onDeleteClick: (token: NativeDenom) => void;
  betaERC20DenomsStore: BetaERC20DenomsStore;
  betaCW20DenomsStore: BetaCW20DenomsStore;
  disabledCW20DenomsStore: DisabledCW20DenomsStore;
  enabledCW20DenomsStore: EnabledCW20DenomsStore;
};

export const ManuallyAddedTokens = observer(
  ({
    tokens,
    handleToggleChange,
    fetchedTokens,
    onDeleteClick,
    betaCW20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    betaERC20DenomsStore,
  }: ManuallyAddedTokensProps) => {
    const { betaCW20Denoms } = betaCW20DenomsStore;
    const { betaERC20Denoms } = betaERC20DenomsStore;
    const { disabledCW20Denoms } = disabledCW20DenomsStore;
    const { enabledCW20Denoms } = enabledCW20DenomsStore;
    const { getExplorerAccountUrl } = useGetExplorerAccountUrl({});

    return (
      <View>
        <Text style={styles.header}>Manually added tokens</Text>
        <View style={styles.cardContainer}>
          {tokens.map((token, index, array) => {
            const isLast = index === array.length - 1;
            let _TokenType = <TokenType type="native" style={{ backgroundColor: '#ff9f0a1a', color: '#ff9500' }} />;

            const title = sliceWord(token?.name ?? capitalize(token.coinDenom.toLowerCase()), 7, 4);
            const subTitle = sliceWord(token.coinDenom, 4, 4);

            if (betaCW20Denoms[token.coinMinimalDenom]) {
              _TokenType = <TokenType type="cw20" style={{ backgroundColor: '#29A8741A', color: '#22c55e' }} />;
            } else if (betaERC20Denoms[token.coinMinimalDenom]) {
              _TokenType = <TokenType type="erc20" style={{ backgroundColor: '#A52A2A1A', color: '#a52a2a' }} />;
            } else if (token.coinMinimalDenom.trim().toLowerCase().startsWith('factory')) {
              _TokenType = <TokenType type="factory" style={{ backgroundColor: '#0AB8FF1A', color: '#14b8a6' }} />;
            }

            const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom);
            const handleRedirectionClick = () => {
              if (explorerURL) Linking.openURL(explorerURL);
            };

            return (
              <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
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
                  TokenType={_TokenType}
                  isToggleChecked={
                    !disabledCW20Denoms.includes(token.coinMinimalDenom) &&
                    !fetchedTokens.includes(token.coinMinimalDenom) &&
                    enabledCW20Denoms.includes(token.coinMinimalDenom)
                  }
                  onToggleChange={(isEnabled: boolean) => handleToggleChange(isEnabled, token.coinMinimalDenom)}
                  onDeleteClick={() => onDeleteClick(token)}
                />
                {!isLast ? <View style={styles.cardDivider} /> : null}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#64748b',
    marginBottom: 8,
  },
  cardContainer: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // Add shadow if you want
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
});

