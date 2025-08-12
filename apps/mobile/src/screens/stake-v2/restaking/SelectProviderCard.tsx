import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { CaretDown, Info } from 'phosphor-react-native';
import { Button } from '../../../components/ui/button';
import { Tooltip } from '../../../components/ui/tooltip';
import { PenIcon } from '../../../../assets/icons/pen-icon';
import { Images } from '../../../../assets/images';
import { GenericDark, GenericLight } from '../../../../assets/images/logos';
import { formatPercentAmount, sliceWord, useProviderApr } from '@leapwallet/cosmos-wallet-hooks';
import ProviderTooltip from './ProviderTooltip';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { Provider } from '@leapwallet/cosmos-wallet-sdk';

export type SelectProviderCardProps = {
  selectedProvider?: Provider;
  setShowSelectProviderSheet: (val: boolean) => void;
  selectDisabled: boolean;
  title: string;
  optional?: boolean;
  rootDenomsStore: RootDenomsStore;
};

export const SelectProviderCard = observer(({
  selectedProvider,
  setShowSelectProviderSheet,
  selectDisabled,
  title,
  optional,
  rootDenomsStore,
}: SelectProviderCardProps) => {
  const theme = useTheme().theme;
  const { apr } = useProviderApr(selectedProvider?.provider ?? '', rootDenomsStore.allDenoms);
  const [showTooltip, setShowTooltip] = useState(false);

  // Responsive character length (estimate)
  const sidePanel = false; // Replace with your logic if needed
  const screenWidth = Dimensions.get('window').width;
  const nameMaxLength = sidePanel
    ? 21 + Math.floor(((Math.min(screenWidth, 400) - 320) / 81) * 7)
    : 30;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>{title}</Text>
        {selectedProvider && (
          <Tooltip
            visible={showTooltip}
            onOpen={() => setShowTooltip(true)}
            onClose={() => setShowTooltip(false)}
            trigger={triggerProps => (
              <TouchableOpacity {...triggerProps} onPress={() => setShowTooltip(true)}>
                <Info size={18} color={theme === ThemeName.DARK ? '#888' : '#ccc'} />
              </TouchableOpacity>
            )}
            content={<ProviderTooltip provider={selectedProvider} />}
            placement="left"
          />
        )}
      </View>

      <View style={styles.providerRow}>
        <View style={styles.avatarAndText}>
          <Image
            source={{uri: 
              selectedProvider
                ? Images.Misc.Validator
                : theme === ThemeName.DARK
                  ? GenericDark
                  : GenericLight
            }}
            style={styles.avatar}
            resizeMode="cover"
            // fallback image logic for onError is tricky in RN; see below
          />
          <View style={styles.providerInfo}>
            <Text style={styles.monikerText}>
              {selectedProvider
                ? sliceWord(selectedProvider.moniker, nameMaxLength, 0)
                : `Select Provider${optional ? ' (optional)' : ''}`}
            </Text>
            {selectedProvider && parseFloat(apr ?? '0') > 0 && (
              <Text style={styles.aprText}>
                Estimated APR&nbsp;
                <Text style={styles.aprBold}>{formatPercentAmount(apr ?? '', 1)}</Text>%
              </Text>
            )}
          </View>
        </View>
        {!selectDisabled && (
          <Button
            size="icon"
            variant="secondary"
            style={styles.editButton}
            onPress={() => setShowSelectProviderSheet(true)}
          >
            <PenIcon size={24} />
          </Button>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f4f5f8', // replace with your theme color
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontWeight: '500',
    fontSize: 15,
    color: '#888',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  avatarAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  providerInfo: {
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
  },
  monikerText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  aprText: {
    fontSize: 13,
    color: '#14b86a', // accent-success
    fontWeight: '500',
  },
  aprBold: {
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#e8e9ee', // or your theme
    borderRadius: 24,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
