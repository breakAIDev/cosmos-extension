import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Faders, X } from 'phosphor-react-native';
import { Button } from '../../../../components/ui/button';
import { AGGREGATED_CHAIN_KEY } from '../../../../services/config/constants';
import { useActiveChain } from '../../../../hooks/settings/useActiveChain';
import { useSelectedNetwork } from '../../../../hooks/settings/useNetwork';
import { SearchIcon } from '../../../../../assets/icons/search-icon';
import { useNavigation } from '@react-navigation/native';
import { MotiView, AnimatePresence } from 'moti';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

const searchButtonVariants = {
  from: { opacity: 0, scale: 0.95, rotate: '90deg' },
  animate: { opacity: 1, scale: 1, rotate: '0deg' },
  exit: { opacity: 0, scale: 0.95, rotate: '90deg' },
};

export const TokenSectionHeader = ({
  showSearch,
  toggleSearchTokensInput,
}: {
  showSearch: boolean;
  toggleSearchTokensInput: () => void;
}) => {
  const activeChain = useActiveChain();
  const selectedNetwork = useSelectedNetwork();
  const navigation = useNavigation();

  const handleGearActionButtonClick = () => {
    if (activeChain === 'secret' && selectedNetwork === 'mainnet') {
      navigation.navigate('Snip20ManageTokens');
      return;
    }
    navigation.navigate('ManageTokens');
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Your tokens</Text>
      <View style={styles.actions}>
        <Button
          variant="secondary"
          size="icon"
          onPress={toggleSearchTokensInput}
          style={styles.iconButton}
        >
          <AnimatePresence>
            {showSearch ? (
              <MotiView
                from={searchButtonVariants.from}
                animate={searchButtonVariants.animate}
                exit={searchButtonVariants.exit}
                key="search"
                transition={{ type: 'timing', duration: 250 }}
              >
                <X size={18} />
              </MotiView>
            ) : (
              <MotiView
                from={searchButtonVariants.from}
                animate={searchButtonVariants.animate}
                exit={searchButtonVariants.exit}
                key="clear"
                transition={{ type: 'timing', duration: 250 }}
              >
                <SearchIcon size={18} />
              </MotiView>
            )}
          </AnimatePresence>
        </Button>
        {activeChain !== AGGREGATED_CHAIN_KEY as SupportedChain && (
          <Button
            variant="secondary"
            size="icon"
            onPress={handleGearActionButtonClick}
            style={styles.iconButton}
          >
            <Faders size={16} style={{ transform: [{ rotate: '-90deg' }] }} />
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
    height: 'auto',
    backgroundColor: '#f6f6f6', // Secondary-100
    marginLeft: 8,
    borderRadius: 8,
  },
});
