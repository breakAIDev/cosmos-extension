import React, { forwardRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SelectedAddress } from '@leapwallet/cosmos-wallet-hooks';
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainFeatureFlagsStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store';
import Text from '../../../../components/text';
import { Images } from '../../../../../assets/images';
import { observer } from 'mobx-react-lite';
import { useSendContext } from '../../../send/context';
import { AddressBook } from '../../../../utils/addressbook';

import { ErrorWarning } from '../error-warning';
import InputCard from './input-card';
import { RecipientChainInfo } from './recipient-chain-info';
import RecipientDisplayCard from './recipient-display-card';

interface RecipientCardProps {
  isIBCTransfer: boolean;
  sendSelectedNetwork: string;
  destChainInfo: ChainInfo | null;
  selectedAddress: SelectedAddress | null;
  setSelectedContact: (contact: AddressBook.SavedAddress) => void;
  setIsAddContactSheetVisible: (visible: boolean) => void;
  setShowSelectRecipient: (visible: boolean) => void;
  setInputInProgress: (inProgress: boolean) => void;
  inputInProgress: boolean;
  activeChain: SupportedChain;
  chainInfoStore: ChainInfosStore;
  chainFeatureFlagsStore: ChainFeatureFlagsStore;
}

const RecipientCard = forwardRef<any, RecipientCardProps>(
  (
    {
      isIBCTransfer,
      sendSelectedNetwork,
      destChainInfo,
      selectedAddress,
      setSelectedContact,
      setIsAddContactSheetVisible,
      setShowSelectRecipient,
      activeChain,
      setInputInProgress,
      inputInProgress,
      chainInfoStore,
      chainFeatureFlagsStore,
    },
    ref,
  ) => {
    const [recipientInputValue, setRecipientInputValue] = useState<string>('');
    const { setSelectedAddress } = useSendContext();

    return (
      <View style={styles.cardContainer}>
        <View style={styles.innerCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.recipientLabel}>Recipient</Text>
            {isIBCTransfer && sendSelectedNetwork === 'mainnet' && destChainInfo ? (
              <View style={styles.ibcPill}>
                <Images.Misc.IbcProtocol color='#fff' />
                <Text size='xs' style={styles.ibcPillText}>
                  IBC Transfer
                </Text>
              </View>
            ) : null}
          </View>

          {selectedAddress && !inputInProgress ? (
            <RecipientDisplayCard
              selectedAddress={selectedAddress}
              setSelectedContact={setSelectedContact}
              setIsAddContactSheetVisible={setIsAddContactSheetVisible}
              activeChain={activeChain}
              onEdit={() => {
                setInputInProgress(true);
                setRecipientInputValue(selectedAddress?.ethAddress || selectedAddress?.address || '');
                setSelectedAddress(null);
                setTimeout(() => {
                  if (ref && typeof ref !== 'function' && ref.current) {
                    ref.current.focus();
                  }
                }, 200);
              }}
            />
          ) : (
            <InputCard
              ref={ref}
              setInputInProgress={setInputInProgress}
              setShowSelectRecipient={setShowSelectRecipient}
              setRecipientInputValue={setRecipientInputValue}
              recipientInputValue={recipientInputValue}
              chainInfoStore={chainInfoStore}
              chainFeatureFlagsStore={chainFeatureFlagsStore}
              selectedNetwork={sendSelectedNetwork}
            />
          )}
        </View>

        {selectedAddress && !inputInProgress ? <RecipientChainInfo /> : null}

        <ErrorWarning />
      </View>
    );
  },
);

RecipientCard.displayName = 'RecipientCard';

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F4F6F8', // Example secondary-100, adjust as per your theme
    borderRadius: 18,
    marginHorizontal: 24,
    marginTop: 0,
    marginBottom: 0,
  },
  innerCard: {
    width: '100%',
    padding: 20,
    flexDirection: 'column',
    gap: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipientLabel: {
    color: '#8C94A6', // Example text-muted-foreground
    fontSize: 15,
    fontWeight: '500',
  },
  ibcPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#0A84FF',
    borderRadius: 18,
  },
  ibcPillText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 12,
  },
});

export default observer(RecipientCard);
