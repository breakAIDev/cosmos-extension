import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { KeyChain } from '@leapwallet/leap-keychain';
import { Button } from '../../../../components/ui/button';
import WalletInfoCard, { SelectWalletsLabel } from '../../../../components/wallet-info-card';
import { OnboardingWrapper } from '../../../onboarding/wrapper';
import { useImportWalletContext } from '../import-wallet-context';

export const SelectWallet = () => {
  const {
    selectedIds,
    setSelectedIds,
    moveToNextStep,
    walletAccounts = [],
    prevStep,
    currentStep,
  } = useImportWalletContext();

  const [isLoading, setIsLoading] = useState(false);
  const [existingAddresses, setExistingAddresses] = useState<string[]>([]);

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets();
      const addresses = [];
      for (const wallet of Object.values(allWallets ?? {})) {
        const address = wallet.addresses.cosmos;
        if ((wallet as any)?.watchWallet) continue;
        addresses.push(address);
      }
      setExistingAddresses(addresses);
    };
    fn();
  }, []);

  const handleProceedClick = () => {
    setIsLoading(true);
    moveToNextStep();
  };

  const selectedCount = useMemo(() => {
    return Object.values(selectedIds).filter((val) => val).length;
  }, [selectedIds]);

  const handleSelectChange = useCallback(
    (id: number, flag: boolean) => {
      setSelectedIds({ ...selectedIds, [id]: flag });
    },
    [selectedIds, setSelectedIds],
  );

  const filteredWalletAccounts = useMemo(() => {
    return walletAccounts.filter(({ address }) => {
      const isExistingAddress = !!address && existingAddresses.indexOf(address) > -1;
      if (isExistingAddress) {
        return false;
      }
      return true;
    });
  }, [walletAccounts, existingAddresses]);

  return (
    <OnboardingWrapper
      heading={'Your wallets'}
      subHeading={'Select the ones you want to import'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      style={styles.gap0}
    >
      <View style={styles.gradientOverlay}>
        <ScrollView
          contentContainerStyle={styles.walletList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SelectWalletsLabel
            count={selectedCount}
            total={filteredWalletAccounts.length}
            onSelectAllToggle={(flag) => {
              setSelectedIds(
                flag
                  ? Object.fromEntries(filteredWalletAccounts.map(({ index: id }) => [id, true]))
                  : Object.fromEntries(filteredWalletAccounts.map(({ index: id }) => [id, false]))
              );
            }}
          />

          {walletAccounts.map(
            ({
              address,
              index: id,
              evmAddress,
              bitcoinAddress,
              moveAddress,
              solanaAddress,
              suiAddress,
            }) => {
              const isExistingAddress = !!address && existingAddresses.indexOf(address) > -1;
              const isChosen = selectedIds[id];

              return (
                <WalletInfoCard
                  key={id}
                  index={id}
                  walletName={`Wallet ${id + 1}`}
                  data-testing-id={`wallet-${id + 1}`}
                  cosmosAddress={address}
                  evmAddress={evmAddress}
                  bitcoinAddress={bitcoinAddress}
                  moveAddress={moveAddress}
                  solanaAddress={solanaAddress}
                  suiAddress={suiAddress}
                  isChosen={isChosen}
                  isExistingAddress={isExistingAddress}
                  onSelectChange={handleSelectChange}
                />
              );
            }
          )}
        </ScrollView>
      </View>

      <Button
        data-testing-id="btn-select-wallet-proceed"
        style={styles.fullWidth}
        disabled={isLoading || selectedCount === 0}
        onPress={handleProceedClick}
      >
        Proceed
      </Button>
    </OnboardingWrapper>
  );
};

const styles = StyleSheet.create({
  gap0: {
    gap: 0,
  },
  gradientOverlay: {
    flex: 1,
    marginTop: 28, // mt-7
  },
  walletList: {
    flexDirection: 'column',
    gap: 12, // gap-3, i.e. 3 * 4 = 12
    paddingBottom: 112, // pb-28 (28 * 4 = 112)
    height: 336, // h-[21rem] => 21 * 16 = 336 (can be omitted if you want scroll to be dynamic)
  },
  fullWidth: {
    width: '100%',
  },
});
