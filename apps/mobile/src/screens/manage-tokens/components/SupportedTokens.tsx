import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { GenericCard, CardDivider } from '@leapwallet/leap-ui';
import { Toggle } from '@leapwallet/leap-ui'; // or your own Toggle
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../assets/images';
import { useTheme, ThemeName } from '@leapwallet/leap-ui';
import { observer } from 'mobx-react-lite';

import { TokenTitle } from './TokenTitle';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';

export type SupportedToken = NativeDenom & { enabled: boolean; verified: boolean };

type SupportedTokensProps = {
  tokens: SupportedToken[];
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>;
  activeChainStore: any;
  cw20DenomsStore: any;
  autoFetchedCW20DenomsStore: any;
};

export const SupportedTokens = observer(({
  tokens,
  handleToggleChange,
}: SupportedTokensProps) => {
  const defaultTokenLogo = useDefaultTokenLogo();
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.heading}>Supported tokens</Text>
      <View style={styles.tokensContainer}>
        {tokens.map((token, index, array) => {
          const isLast = index === array.length - 1;

          // If you have your own sliceWord/capitalize utility, use them here
          const title = token?.name ?? token.coinDenom;
          const subTitle = token.coinDenom;

          // If you have getExplorerAccountUrl RN, use it here
          // Otherwise, explorerURL is a string (optional)
          // You can pass explorerURL as a prop if needed
          // const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom);

          const handleRedirectionClick = () => {
            // Implement your deep-link or Linking logic here for RN
            // Example: Linking.openURL(explorerURL);
          };

          return (
            <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
              <GenericCard
                title={
                  <TokenTitle
                    title={title}
                    showRedirection={false}
                    handleRedirectionClick={handleRedirectionClick}
                  />
                }
                subtitle={subTitle}
                isRounded={isLast}
                size="md"
                img={
                  <View style={styles.imgWrapper}>
                    <Image
                      source={{ uri: token.icon ?? defaultTokenLogo}}
                      style={styles.tokenIcon}
                      resizeMode="contain"
                      // onError not directly available, handle with Image fallback libs if needed
                    />
                    {token.verified && (
                      <View style={styles.verifiedBadgeWrapper}>
                        <Image
                          source={
                            theme === ThemeName.DARK
                              ? Images.Misc.VerifiedWithBgStarDark
                              : Images.Misc.VerifiedWithBgStar
                          }
                          style={styles.verifiedBadge}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  </View>
                }
                icon={
                  <View style={styles.toggleWrapper}>
                    <Toggle
                      checked={token.enabled}
                      onChange={(isEnabled: boolean) => handleToggleChange(isEnabled, token.coinMinimalDenom)}
                    />
                  </View>
                }
              />
              {!isLast ? <CardDivider /> : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  heading: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  tokensContainer: {
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingBottom: 4,
    overflow: 'hidden',
  },
  imgWrapper: {
    marginRight: 10,
    position: 'relative',
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIcon: {
    height: 28,
    width: 28,
    borderRadius: 14,
  },
  verifiedBadgeWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  verifiedBadge: {
    height: 16,
    width: 16,
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

