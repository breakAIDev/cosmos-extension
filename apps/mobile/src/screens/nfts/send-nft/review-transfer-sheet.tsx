import {
  sliceAddress,
  sliceWord,
  TxCallback,
  useAddress,
  useChainInfo,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ArrowDown, Info } from 'phosphor-react-native';
import { ErrorCard } from '../../../components/ErrorCard';
import LedgerConfirmationPopup from '../../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { Wallet } from '../../../hooks/wallet/useWallet';
import React, { useCallback, useEffect, useState } from 'react';
import { nftStore } from '../../../context/nft-store';
import { NftDetailsType, useNftContext } from '../context';
import { useNFTSendContext } from './context';
import { FeesView } from './fees-view';

import { View, Image, TextInput, StyleSheet } from 'react-native';

type ReviewNFTTransactionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  nftDetails: NftDetailsType;
};

export const ReviewNFTTransferSheet: React.FC<ReviewNFTTransactionSheetProps> = ({
  isOpen,
  onClose,
  nftDetails,
}) => {
  const defaultTokenLogo = useDefaultTokenLogo();
  const {
    txError,
    receiverAddress,
    collectionAddress,
    sendNftReturn,
    setTxError,
  } = useNFTSendContext();
  const { chainSymbolImageUrl: chainImage } = useChainInfo('mainCoreum');
  const { setNftDetails, setShowTxPage } = useNftContext();
  const [memo, setMemo] = useState('');
  const activeChain: SupportedChain = 'mainCoreum';
  const [isProcessing, setIsProcessing] = useState(false);
  const getWallet = Wallet.useGetWallet(activeChain);

  const fromAddress = useAddress(activeChain);

  const {
    isSending,
    fee,
    transferNFTContract,
    showLedgerPopup,
    simulateTransferNFTContract,
    fetchAccountDetailsStatus,
    addressWarning,
  } = sendNftReturn;

  useEffect(() => {
    (async function () {
      if (
        isSending ||
        isProcessing ||
        !nftDetails ||
        !collectionAddress ||
        !receiverAddress?.address ||
        !fromAddress
      ) {
        return;
      }

      const wallet = await getWallet(activeChain);
      const toAddress = receiverAddress?.address;

      await simulateTransferNFTContract({
        wallet: wallet,
        collectionId: collectionAddress,
        fromAddress,
        toAddress: toAddress,
        tokenId: nftDetails?.tokenId ?? '',
        memo: memo,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromAddress,
    collectionAddress,
    isProcessing,
    isSending,
    memo,
    nftDetails,
    receiverAddress,
  ]);

  const modifiedCallback: TxCallback = useCallback(
    (status) => {
      setShowTxPage(true);
      onClose();
      setNftDetails(null);
    },
    [onClose, setNftDetails, setShowTxPage],
  );

  const handleSendNft = async () => {
    if (!nftDetails || !collectionAddress || !receiverAddress?.address || !fromAddress || !fee) {
      return;
    }
    setIsProcessing(true);

    const wallet = await getWallet(activeChain);
    const toAddress = receiverAddress?.address;

    const res = await transferNFTContract({
      wallet: wallet,
      collectionId: collectionAddress,
      fromAddress,
      toAddress,
      tokenId: nftDetails?.tokenId ?? '',
      memo: memo,
      fees: fee,
    });

    nftStore.loadNfts();
    if (res?.success) {
      modifiedCallback(res.success ? 'success' : 'txDeclined');
    } else {
      setTxError(res?.errors?.[0]);
    }
    setIsProcessing(false);
  };

  const isReviewDisabled =
    !receiverAddress || ['loading', 'error'].includes(fetchAccountDetailsStatus);

  if (showLedgerPopup && !txError) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />;
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="Review transfer" style={styles.modal}>
      <View style={styles.mainContainer}>
        {/* Top NFT info */}
        <View style={styles.nftInfoCard}>
          <View style={styles.nftInfoLeft}>
            <Text size="lg" style={styles.nftInfoTitle}>
              {sliceWord(nftDetails?.collection.name ?? '', 12, 0)} #{sliceWord(nftDetails?.tokenId ?? '', 5, 0)}
            </Text>
            <Text size="sm" style={styles.nftInfoTokenId}>
              {sliceWord(nftDetails?.tokenId ?? '', 5, 0)}
            </Text>
          </View>
          <Image
            source={nftDetails.image ? { uri: nftDetails.image } : defaultTokenLogo}
            style={styles.nftImage}
          />
        </View>

        {/* Arrow Down */}
        <View style={styles.arrowContainer}>
          <ArrowDown
            size={40}
            color="#5df2b7"
            weight="duotone"
            style={styles.arrowIcon}
          />
        </View>

        {/* Destination card */}
        <View style={styles.destCard}>
          <View style={styles.destCardRow}>
            <Text size="lg" style={styles.destCardTitle}>
              {receiverAddress?.ethAddress
                ? sliceAddress(receiverAddress.ethAddress)
                : receiverAddress?.selectionType === 'currentWallet' || receiverAddress?.selectionType === 'saved'
                ? receiverAddress?.name?.split('-')[0]
                : sliceAddress(receiverAddress?.address)}
            </Text>
            <Image
              source={chainImage ? { uri: chainImage } : undefined}
              style={styles.destChainImage}
            />
          </View>
          {addressWarning ? (
            <View style={styles.warningCard}>
              <Info size={16} color="#ffe999" style={styles.warningIcon} />
              <Text size="xs" style={styles.warningText}>
                {addressWarning}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Memo (if present) */}
        {memo ? (
          <View style={styles.memoContainer}>
            <Text size="sm" style={styles.memoLabel}>Memo:</Text>
            <Text size="sm" style={styles.memoText}>{memo}</Text>
          </View>
        ) : null}

        {/* Fees */}
        {!!fee && <FeesView nftDetails={nftDetails} fee={fee} />}

        {/* Memo input (add if you want to let users enter a memo) */}
        {/* <TextInput
          value={memo}
          onChangeText={setMemo}
          style={styles.memoInput}
          placeholder="Add a memo (optional)"
        /> */}

        {/* Confirm button */}
        <Button
          style={styles.confirmButton}
          onPress={handleSendNft}
          disabled={isReviewDisabled || showLedgerPopup || isProcessing || isSending}
        >
          {isProcessing ? 'Sending...' : 'Confirm transfer'}
        </Button>
        {txError ? <ErrorCard text={txError} /> : null}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    padding: 24,
    paddingTop: 32,
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  nftInfoCard: {
    backgroundColor: '#edf3f3',
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nftInfoLeft: {
    flexDirection: 'column',
    gap: 4,
    maxWidth: '72%',
  },
  nftInfoTitle: {
    fontWeight: 'bold',
    color: '#1a202c',
  },
  nftInfoTokenId: {
    color: '#888',
    fontSize: 13,
  },
  nftImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  arrowContainer: {
    marginVertical: -12,
    alignItems: 'center',
    zIndex: 1,
  },
  arrowIcon: {
    borderRadius: 50,
    backgroundColor: '#d1ffe7',
    padding: 4,
    borderWidth: 3,
    borderColor: '#fff',
  },
  destCard: {
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  destCardRow: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#e5e8ef',
    padding: 20,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destCardTitle: {
    fontWeight: 'bold',
    color: '#1a202c',
  },
  destChainImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffe999',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 10,
  },
  warningIcon: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  warningText: {
    color: '#b88700',
    fontWeight: '500',
  },
  memoContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 16,
    marginTop: 4,
  },
  memoLabel: {
    color: '#999',
    fontWeight: '500',
    marginRight: 6,
  },
  memoText: {
    color: '#333',
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  confirmButton: {
    width: '100%',
    marginTop: 16,
  },
});
