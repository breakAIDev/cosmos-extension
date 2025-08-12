import { useAddress, useGetExplorerTxnUrl } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ParsedMessageType } from '@leapwallet/parser-parfait';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { ArrowSquareOut } from 'phosphor-react-native'; // Make sure this is installed
import BottomModal from '../../../components/new-bottom-modal'; // Must be RN compatible!
import { Button } from '../../../components/ui/button';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useSelectedNetwork } from '../../../hooks/settings/useNetwork';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { AddressBook } from '../../../utils/addressbook';

import { SelectedTx } from './ChainActivity';
import { TxDetailsContent } from './tx-details-content';

export type TxDetailsProps = {
  open: boolean;
  tx: SelectedTx | null;
  onBack: () => void;
  forceChain?: SupportedChain;
};

const emptyContact = { name: '', emoji: 0 };

export function TxDetails({ open, tx, onBack, forceChain }: TxDetailsProps) {
  const chainInfos = useChainInfos();
  const selectedNetwork = useSelectedNetwork();

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const [contact, setContact] = useState<{ name: string; emoji: number }>(emptyContact);

  const address = useAddress(activeChain);
  const txnMessage = tx?.parsedTx?.messages[0];

  useEffect(() => {
    if (txnMessage?.__type === ParsedMessageType.BankSend) {
      const isReceive = address === txnMessage.toAddress;
      AddressBook.getEntry(isReceive ? txnMessage.fromAddress : txnMessage.toAddress).then((contact) => {
        if (contact) {
          setContact({
            name: contact.name,
            emoji: contact.emoji,
          });
        } else {
          setContact(emptyContact);
        }
      });
    }
  }, [tx, setContact, txnMessage, address]);

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
    forceTxHash: tx?.parsedTx?.txHash,
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  return (
    <BottomModal
      fullScreen
      title="Transaction details"
      isOpen={open}
      onClose={onBack}
      contentStyle={styles.modal}
    >
      {tx && (
        <TxDetailsContent
          tx={tx}
          contact={contact}
          txnMessage={txnMessage}
          activeChain={activeChain}
        />
      )}

      {txnUrl ? (
        <Button
          style={styles.button}
          onPress={() => Linking.openURL(txnUrl)}
        >
          <View style={styles.buttonContent}>
            <ArrowSquareOut size={20} style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>
              View on {chainInfos[activeChain].txExplorer?.[selectedNetwork]?.name}
            </Text>
          </View>
        </Button>
      ) : null}
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 32,
    flex: 1,
  },
  button: {
    width: '100%',
    marginTop: 'auto',
    alignSelf: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222', // Or your accent color
  },
});
