import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Toggle, useTheme, ThemeName } from '@leapwallet/leap-ui'; // Assume this is your RN Toggle or use a Switch
import { useDefaultTokenLogo } from '../../../hooks';
import { Images } from '../../../../assets/images';
import { capitalize, sliceWord } from '../../../utils/strings';
import { TokenTitle } from './TokenTitle';
import { SupportedToken } from './SupportedTokens';
import { useNavigation } from '@react-navigation/native';
import { ActiveChainStore, AutoFetchedCW20DenomsStore, CW20DenomsStore } from '@leapwallet/cosmos-wallet-store';

type SupportedTokenCardProps = {
  token: SupportedToken;
  tokensLength: number;
  index: number;
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>;
  activeChainStore: ActiveChainStore;
  cw20DenomsStore: CW20DenomsStore;
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore;
};

export const SupportedTokenCard = observer(
  ({
    token,
    tokensLength,
    index,
    handleToggleChange,
  }: SupportedTokenCardProps) => {
    const defaultTokenLogo = useDefaultTokenLogo();
    const { theme } = useTheme();
    const navigation = useNavigation();

    const isLast = index === tokensLength - 1;
    const isFirst = index === 0;
    const title = sliceWord(token?.name ?? capitalize(token.coinDenom.toLowerCase()) ?? '', 7, 4);
    const subTitle = sliceWord(token.coinDenom, 4, 4);

    const handleRedirectionClick = () => {
      navigation.navigate('Home');
    };

    return (
      <View
        style={[
          styles.card,
          isFirst && { marginTop: 24 },
          isLast && { marginBottom: 24 },
        ]}
      >
        <View style={styles.tokenInfoRow}>
          <View style={styles.tokenImgContainer}>
            <Image
              source={{ uri: token.icon ?? defaultTokenLogo }}
              style={styles.tokenImg}
            />
            {token.verified && (
              <Image
                source={{
                  uri:
                    theme === ThemeName.DARK
                      ? Images.Misc.VerifiedWithBgStarDark
                      : Images.Misc.VerifiedWithBgStar,
                }}
                style={styles.verifiedIcon}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <TokenTitle
              title={title}
              showRedirection={false}
              handleRedirectionClick={handleRedirectionClick}
            />
            <Text style={styles.subTitle}>{subTitle}</Text>
          </View>
        </View>
        <View style={styles.toggleContainer}>
          <Toggle
            checked={token.enabled}
            onChange={(isEnabled: boolean) =>
              handleToggleChange(isEnabled, token.coinMinimalDenom)
            }
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f6fc',
    borderRadius: 16,
    marginBottom: 16,
    height: 66,
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  tokenInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenImgContainer: {
    marginRight: 12,
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  verifiedIcon: {
    width: 16,
    height: 16,
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  subTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  toggleContainer: {
    marginLeft: 8,
  },
});
