import React, { useMemo } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { GasOptions, getErrorMsg, VoteOptions } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ThumbsUp } from 'phosphor-react-native';
import { ErrorCard } from '../../../components/ErrorCard';
import LedgerConfirmationPopup from '../../../components/ledger-confirmation/LedgerConfirmationPopup';
import { LoaderAnimation } from '../../../components/loader/Loader';
import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import { useCaptureTxError } from '../../../hooks/utility/useCaptureTxError';
import { Colors } from '../../../theme/colors';

export type ReviewVoteCastProps = {
  isOpen: boolean;
  onCloseHandler: () => void;
  onSubmitVote: (option: VoteOptions) => Promise<boolean>;
  loading: boolean;
  error?: string;
  selectedVote: VoteOptions | undefined;
  memo: string;
  setMemo: (memo: string) => void;
  feeText: string;
  proposalId: string;
  refetchCurrVote: () => void;
  showLedgerPopup?: boolean;
  ledgerError?: string;
  gasOption: GasOptions;
  forceChain?: SupportedChain;
};

export function ReviewVoteCast({
  isOpen,
  onCloseHandler,
  onSubmitVote,
  selectedVote,
  error,
  feeText,
  loading,
  memo,
  setMemo,
  proposalId,
  showLedgerPopup,
  ledgerError,
  gasOption,
  forceChain,
}: ReviewVoteCastProps): React.ReactElement {

  useCaptureTxError(error);

  if (showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />;
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onCloseHandler} title="Review Transaction">
      <View style={styles.container}>
        <View style={styles.voteMsgBox}>
          <View style={styles.iconCircle}>
            <ThumbsUp size={20} color="#fff" />
          </View>
          <View style={styles.voteMsgTextCol}>
            <Text style={styles.voteMsgLabel}>Vote message</Text>
            <Text style={styles.voteMsgTitle}>
              Vote <Text style={styles.bold}>{selectedVote}</Text> on <Text style={styles.bold}>Proposal #{proposalId}</Text>
            </Text>
          </View>
        </View>
        <TextInput
          style={styles.memoInput}
          value={memo}
          onChangeText={setMemo}
          placeholder="Memo (optional)"
          placeholderTextColor="#aaa"
          multiline
        />

        {feeText ? (
          <Text style={styles.feeText}>{feeText}</Text>
        ) : null}

        {(error ?? ledgerError) && (
          <ErrorCard text={getErrorMsg(error ?? ledgerError ?? '', gasOption, 'vote')} />
        )}

        <Button
          style={styles.approveBtn}
          disabled={showLedgerPopup || loading}
          onPress={async () => {
            if (selectedVote !== undefined) {
              const txSuccess = await onSubmitVote(selectedVote);
              if (txSuccess) {
                onCloseHandler();
              }
            }
          }}
        >
          {loading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
        </Button>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 10, gap: 20 },
  voteMsgBox: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#f5f6fa',
    borderRadius: 18,
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
  },
  iconCircle: {
    height: 40,
    width: 40,
    backgroundColor: '#29A874',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteMsgTextCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 14,
  },
  voteMsgLabel: {
    fontSize: 13,
    color: '#8e99af',
    marginBottom: 4,
  },
  voteMsgTitle: {
    fontSize: 16,
    color: '#22272e',
    fontWeight: 'bold',
  },
  bold: { fontWeight: 'bold', color: '#22272e' },
  memoInput: {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#f6f6f6',
    padding: 12,
    fontSize: 14,
    color: '#22272e',
    borderWidth: 0,
    marginTop: 10,
  },
  feeText: {
    fontSize: 13,
    color: '#8e99af',
    alignSelf: 'center',
    marginVertical: 6,
  },
  approveBtn: { width: '100%', marginTop: 8 },
});
