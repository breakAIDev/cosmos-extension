import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk';
import { KeyChain } from '@leapwallet/leap-keychain';
import { Button } from '../../../../components/ui/button';
import WalletInfoCard from '../../../../components/wallet-info-card';
import { OnboardingWrapper } from '../../../onboarding/wrapper';
import { LEDGER_NETWORK, useImportWalletContext } from '../import-wallet-context';

export const SelectLedgerWallet = () => {
  const {
    prevStep,
    currentStep,
    selectedIds,
    setSelectedIds,
    moveToNextStep,
    addresses,
    ledgerNetworks,
  } = useImportWalletContext();

  const [existingAddresses, setExistingAddresses] = useState<string[]>([]);

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets();
      const addresses = [];
      for (const wallet of Object.values(allWallets ?? {})) {
        const address = wallet?.addresses?.cosmos;
        if (address) {
          addresses.push(address);
        }
        const evmPubKey = wallet?.pubKeys?.ethereum;
        const evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) || undefined : undefined;
        if (evmAddress) {
          addresses.push(evmAddress);
        }
      }
      setExistingAddresses(addresses);
    };
    fn();
  }, []);

  const handleSelectChange = useCallback(
    (id: number | string, flag: boolean) => {
      setSelectedIds((prevSelectedIds) => ({ ...(prevSelectedIds ?? {}), [id]: flag }));
    },
    [setSelectedIds],
  );

  const proceedButtonEnabled = useMemo(() => {
    const isCosmosAppSelected = ledgerNetworks.has(LEDGER_NETWORK.COSMOS);
    const isEvmAppSelected = ledgerNetworks.has(LEDGER_NETWORK.ETH);
    return Object.entries(selectedIds ?? {}).some(([key, val]) => {
      if (!val) return false;
      const cosmosAddress = addresses?.[key]?.cosmos?.address;
      const evmPubKey = addresses?.[key]?.ethereum?.pubKey;
      const evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : undefined;
      const cosmosAddressExists = cosmosAddress ? existingAddresses.includes(cosmosAddress) : false;
      const evmAddressExists = evmAddress ? existingAddresses.includes(evmAddress) : false;
      if (isCosmosAppSelected && isEvmAppSelected) {
        return !cosmosAddressExists && !evmAddressExists;
      }
      if (isCosmosAppSelected && !cosmosAddressExists) {
        return true;
      }
      if (isEvmAppSelected && !evmAddressExists) {
        return true;
      }
      return false;
    });
  }, [ledgerNetworks, selectedIds, addresses, existingAddresses]);

  const multiEcosystemImportNote = useMemo(() => {
    const bothNetworksSelected = ledgerNetworks.size === 2;
    if (!bothNetworksSelected) return false;

    return Object.entries(selectedIds ?? {}).some(([key, val]) => {
      if (!val) return false;
      const cosmosAddress = addresses?.[key]?.cosmos?.address;
      const evmPubKey = addresses?.[key]?.ethereum?.pubKey;
      const evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : undefined;
      const cosmosAddressExists = cosmosAddress ? existingAddresses.includes(cosmosAddress) : false;
      const evmAddressExists = evmAddress ? existingAddresses.includes(evmAddress) : false;
      if (!cosmosAddressExists && evmAddressExists) {
        return true;
      }
      if (cosmosAddressExists && !evmAddressExists) {
        return true;
      }
      return false;
    });
  }, [ledgerNetworks.size, selectedIds, addresses, existingAddresses]);

  // Max height logic for the list:
  const listMaxHeight = multiEcosystemImportNote ? 299 : 330;

  return (
    <OnboardingWrapper
      heading={'Your wallets'}
      subHeading={'Select the ones you want to import'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <View style={styles.gradientOverlay}>
        <View style={[styles.scrollWrap, { maxHeight: listMaxHeight }]}>
          <ScrollView
            contentContainerStyle={styles.walletList}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(addresses ?? {}).map(([path, value], index) => {
              let address;
              let isExistingCosmosAddress = false;
              if (ledgerNetworks.has(LEDGER_NETWORK.COSMOS)) {
                address = value?.cosmos?.address;
                if (address) {
                  isExistingCosmosAddress = existingAddresses.indexOf(address) > -1;
                }
              }
              let evmAddress;
              let isExistingEvmAddress = false;
              if (ledgerNetworks.has(LEDGER_NETWORK.ETH)) {
                const evmPubKey = value?.ethereum?.pubKey;
                evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) || undefined : undefined;
                if (evmAddress) {
                  isExistingEvmAddress = existingAddresses.indexOf(evmAddress) > -1;
                }
              }
              const isChosen = selectedIds[path];
              return (
                <WalletInfoCard
                  key={path}
                  index={index}
                  path={path}
                  data-testing-id={`wallet-${index + 1}`}
                  walletName={`Wallet ${index + 1}`}
                  cosmosAddress={address}
                  evmAddress={evmAddress}
                  isChosen={isChosen || isExistingCosmosAddress || isExistingEvmAddress}
                  isExistingAddress={isExistingCosmosAddress || isExistingEvmAddress}
                  onSelectChange={handleSelectChange}
                  isLedger
                  showDerivationPath
                />
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Button
          style={styles.fullWidth}
          disabled={!proceedButtonEnabled}
          data-testing-id="btn-select-wallet-proceed"
          onPress={moveToNextStep}
        >
          Add selected wallets
        </Button>
        {multiEcosystemImportNote && (
          <Text style={styles.ecosystemNote}>
            All addresses for the EVM & Cosmos network will be imported.
          </Text>
        )}
      </View>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    // Add gradient if needed, for now just acts as a wrapper
  },
  scrollWrap: {
    width: '100%',
    paddingVertical: 4,
    flex: 1,
    alignSelf: 'stretch',
  },
  walletList: {
    flexDirection: 'column',
    gap: 16, // gap-4
    paddingBottom: 112, // pb-28
  },
  bottomSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 'auto',
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  ecosystemNote: {
    marginTop: 12,
    color: '#64748b', // text-muted-foreground
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
});
