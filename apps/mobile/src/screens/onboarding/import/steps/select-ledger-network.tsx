import React, { useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/check-box';
import { useDefaultTokenLogo } from '../../../../hooks';
import { Images } from '../../../../../assets/images';
import { OnboardingWrapper } from '../../../onboarding/wrapper';
import { LEDGER_NETWORK, useImportWalletContext } from '../import-wallet-context';

export const ledgerNetworkOptions = [
  {
    id: LEDGER_NETWORK.COSMOS,
    img: Images.Logos.Cosmos,
    title: 'COSMOS',
    subText: 'OSMO, ATOM & 4 more',
  },
  {
    id: LEDGER_NETWORK.ETH,
    img: Images.Logos.Ethereum,
    title: 'EVM',
    subText: 'ETH, AVAX, BASE & 5 more',
  },
];

export const SelectLedgerNetwork = () => {
  const {
    ledgerNetworks,
    addresses,
    setLedgerNetworks,
    moveToNextStep,
    setWalletAccounts,
    prevStep,
    currentStep,
    setAddresses,
  } = useImportWalletContext();

  useEffect(() => {
    setWalletAccounts(undefined);
    if (addresses && Object.keys(addresses).length > 0) {
      setAddresses({});
    }
  }, [addresses, setAddresses, setWalletAccounts]);

  return (
    <OnboardingWrapper
      heading={'Select networks'}
      subHeading={'Select networks you want to connect with'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <ScrollView style={styles.cardContainer}>
        {ledgerNetworkOptions.map((network) => (
          <LedgerNetworkCard
            key={network.id}
            {...network}
            checked={ledgerNetworks.has(network.id)}
            onCheckedChange={(checked) => {
              setLedgerNetworks((prev) => {
                const newSet = new Set(prev);
                if (checked) {
                  newSet.add(network.id);
                } else {
                  newSet.delete(network.id);
                }
                return newSet;
              });
            }}
          />
        ))}
      </ScrollView>

      <Button
        disabled={ledgerNetworks.size === 0}
        style={styles.proceedButton}
        onPress={moveToNextStep}
      >
        Proceed
      </Button>
    </OnboardingWrapper>
  );
};

const LedgerNetworkCard = (props: {
  img?: string;
  title: string;
  subText: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  const defaultTokenLogo = useDefaultTokenLogo();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => props.onCheckedChange(!props.checked)}
    >
      <Image
        source={{uri: props.img ?? defaultTokenLogo}}
        onError={() => {}}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{props.title}</Text>
        <Text style={styles.cardSubText}>{props.subText}</Text>
      </View>
      <Checkbox style={styles.cardCheckbox} checked={props.checked} onChange={props.onCheckedChange} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 4,
    marginBottom: 12,
    flexGrow: 0,
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,100,100,0.25)',
    backgroundColor: '#F5F6F7', // Secondary-200
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 999,
    marginRight: 14,
    backgroundColor: '#EEE',
  },
  cardTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181818',
  },
  cardSubText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  cardCheckbox: {
    marginLeft: 'auto',
  },
  proceedButton: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 4,
    alignSelf: 'center',
  },
});

