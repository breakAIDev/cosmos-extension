import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StdFee } from '@cosmjs/stargate';
import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { Avatar, Buttons, Card, CardDivider, Memo } from '@leapwallet/leap-ui';
import BottomModal from '../../../../components/bottom-modal';
import { ErrorCard } from '../../../../components/ErrorCard';
import LedgerConfirmationPopup from '../../../../components/ledger-confirmation/LedgerConfirmationPopup';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import Text from '../../../../components/text';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { rootDenomsStore } from '../../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../../context/root-store';
import { Colors } from '../../../../theme/colors';
import { normalizeImageSrc } from '../../../../utils/normalizeImageSrc';
import { SelectedAddress } from '../../../send/types';
import { NftDetailsType } from '../../context';

type ReviewNFTTransactionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  themeColor: string;
  selectedAddress: SelectedAddress;
  nftDetails: NftDetailsType;
  fee?: StdFee;
  showLedgerPopup: boolean;
  loading: boolean;
  memo: string;
  setMemo: (s: string) => void;
  showMemo: boolean;
  txError: string;
};

export const ReviewNFTTransferSheet = ({
  isOpen,
  onClose,
  themeColor,
  selectedAddress,
  nftDetails,
  fee,
  showLedgerPopup,
  onConfirm,
  loading,
  memo,
  setMemo,
  showMemo,
  txError,
}: ReviewNFTTransactionSheetProps) => {
  const defaultTokenLogo = useDefaultTokenLogo();

  if (showLedgerPopup && !txError) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />;
  }

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      title="Review Transaction"
      // No className
    >
      <View style={styles.container}>
        <View style={styles.reviewCard}>
          <Text size="xs" style={styles.reviewLabel}>
            Sending
          </Text>

          <View style={styles.nftCardRow}>
            <Card
              avatar={
                <Avatar
                  avatarImage={
                    normalizeImageSrc(
                      nftDetails?.image ?? '',
                      nftDetails?.collection?.address ?? ''
                    ) ?? defaultTokenLogo
                  }
                  size="sm"
                  // avatarOnError is web only
                />
              }
              isRounded
              size="md"
              subtitle={
                <Text style={{ flexWrap: 'wrap' }}>
                  {nftDetails?.tokenId}
                </Text>
              }
              title={
                <Text data-testing-id="send-review-sheet-inputAmount-ele" style={{ fontWeight: 'bold' }}>
                  {nftDetails?.name ??
                    nftDetails?.domain ??
                    (nftDetails?.collection?.name + 'NFT')}
                </Text>
              }
            />
          </View>
          <CardDivider />
          <Card
            avatar={
              <Avatar
                avatarImage={selectedAddress?.avatarIcon}
                emoji={selectedAddress?.emoji}
                chainIcon={selectedAddress?.chainIcon}
                size="sm"
              />
            }
            isRounded
            size="md"
            subtitle={
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Text>{sliceAddress(selectedAddress?.address)}</Text>
                {selectedAddress?.information?.nameService ? (
                  <>
                    <Text> &middot; {selectedAddress.information.nameService}</Text>
                  </>
                ) : null}
              </View>
            }
            title={
              <Text data-testing-id="send-review-sheet-to-ele">
                {'To ' + selectedAddress?.name}
              </Text>
            }
          />
        </View>

        {showMemo ? (
          <Memo
            value={memo}
            onChange={setMemo}
            style={{ marginTop: 10, marginBottom: 10 }}
          />
        ) : null}

        {!!fee && (
          <FeesView
            fee={fee}
            nftDetails={nftDetails}
            rootDenomsStore={rootDenomsStore}
            rootBalanceStore={rootBalanceStore}
          />
        )}

        <Buttons.Generic
          color={themeColor}
          size="normal"
          style={styles.sendButton}
          title="Send"
          onClick={onConfirm}
          disabled={showLedgerPopup || loading}
          data-testing-id="send-review-sheet-send-btn"
        >
          {loading ? <LoaderAnimation color={Colors.white100} /> : 'Send'}
        </Buttons.Generic>
        {txError ? <ErrorCard text={txError} /> : null}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    gap: 16,
    flexDirection: 'column',
    paddingVertical: 24,
  },
  reviewCard: {
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    padding: 12,
    marginBottom: 18,
    width: '100%',
  },
  reviewLabel: {
    paddingHorizontal: 12,
    paddingTop: 10,
    fontWeight: 'bold',
    color: '#a3a3a3', // light gray
  },
  nftCardRow: {
    marginVertical: 8,
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },
  sendButton: {
    width: 344,
    alignSelf: 'center',
    marginTop: 14,
  },
});
