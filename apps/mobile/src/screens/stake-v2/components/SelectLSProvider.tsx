import { LSProvider, SelectedNetwork, useActiveStakingDenom } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { GenericCard } from '@leapwallet/leap-ui';
import { ArrowSquareOut } from 'phosphor-react-native';
import BottomModal from '../../../components/bottom-modal';
import { ValidatorItemSkeleton } from '../../../components/Skeletons/StakeSkeleton';
import Text from '../../../components/text';
import currency from 'currency.js';
import { GenericLight } from '../../../../assets/images/logos';
import React from 'react';
import { EventName } from '../../../services/config/analytics';
import { TouchableOpacity, View, Image, StyleSheet, FlatList } from 'react-native';
import { Linking } from 'react-native';
import { Colors } from '../../../theme/colors';

interface SelectLSProviderProps {
  isVisible: boolean;
  onClose: () => void;
  providers: LSProvider[];
  rootDenomsStore: RootDenomsStore;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
}

interface ProviderCardProps {
  provider: LSProvider;
  backgroundColor: string;
  rootDenomsStore: RootDenomsStore;
  activeChain?: SupportedChain;
  activeNetwork?: SelectedNetwork;
}

export function ProviderCard({
  provider,
  backgroundColor,
  rootDenomsStore,
  activeChain,
  activeNetwork,
}: ProviderCardProps) {
  const [activeStakingDenom] = useActiveStakingDenom(rootDenomsStore.allDenoms, activeChain, activeNetwork);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: provider.priority ? Colors.promotedBg : Colors.white100 },
      ]}
      onPress={() => {
        Linking.openURL(provider.url);
        // Call mixpanel if needed
      }}
      activeOpacity={0.8}
    >
      {provider.priority && (
        <View style={styles.promotedTag}>
          <Text style={styles.promotedText}>Promoted</Text>
        </View>
      )}
      <Image
        source={{ uri: provider.image }}
        defaultSource={{uri: '../../../../assets/images/logos/GenericLight.png'}}
        style={styles.avatar}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.title}>{provider.name}</Text>
        <Text style={styles.subtitle}>
          {provider.apy
            ? `APY ${currency((provider.apy * 100).toString(), { precision: 2, symbol: '' }).format()}%`
            : 'N/A'}
        </Text>
      </View>
      <ArrowSquareOut size={20} weight="bold" color={Colors.text} />
    </TouchableOpacity>
  );
}

export default function SelectLSProvider({
  isVisible,
  onClose,
  providers,
  rootDenomsStore,
  forceChain,
  forceNetwork,
}: SelectLSProviderProps) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      title='Select Provider'
      style={{padding: 24}}
    >
      <View style={modalStyles.container}>
        <View style={modalStyles.sheet}>
          <FlatList
            data={providers}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <ProviderCard
                provider={item}
                backgroundColor={item.priority ? Colors.promotedBg : Colors.white100}
                rootDenomsStore={rootDenomsStore}
                activeChain={forceChain}
                activeNetwork={forceNetwork}
              />
            )}
            ListEmptyComponent={<Text>No providers found.</Text>}
          />
        </View>
      </View>
    </BottomModal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    minHeight: 300,
    maxHeight: '60%',
  },
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 66,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 14,
    backgroundColor: '#F4F4F5',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  promotedTag: {
    position: 'absolute',
    top: 0,
    right: 12,
    backgroundColor: Colors.green600,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 2,
  },
  promotedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
});