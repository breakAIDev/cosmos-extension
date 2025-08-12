import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { getErrorMsg, useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { ThumbsUp } from 'phosphor-react-native';
import { ErrorCard } from '../../../components/ErrorCard';
import { DisplayFee } from '../../../components/gas-price-options/display-fee';
import { LoaderAnimation } from '../../../components/loader/Loader';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { useCaptureTxError } from '../../../hooks/utility/useCaptureTxError';
import { Colors } from '../../../theme/colors';
// If you have a Memo component for RN, use it. If not, use TextInput here.

import { ReviewVoteCastProps } from '../components/ReviewVoteCast';

export function NtrnReviewVoteCast({
  isOpen,
  onCloseHandler,
  onSubmitVote,
  selectedVote,
  error,
  loading,
  memo,
  setMemo,
  proposalId,
  gasOption,
  forceChain,
}: Omit<ReviewVoteCastProps, 'feeText'>) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
  useCaptureTxError(error);

  return (
    <BottomModal isOpen={isOpen} onClose={onCloseHandler} title="Review Transaction">
      <View style={styles.content}>
        <View style={styles.voteMsgCard}>
          <View style={styles.iconCircle}>
            <ThumbsUp size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.voteMsgLabel}>Vote message</Text>
            <Text style={styles.voteMsg}>
              Vote <Text style={styles.voteType}>{selectedVote}</Text> on <Text style={styles.proposalId}>Proposal #{proposalId}</Text>
            </Text>
          </View>
        </View>

        {/* Memo Input (replace with your Memo component if available) */}
        <TextInput
          style={styles.memoInput}
          placeholder="Enter memo (optional)"
          value={memo}
          onChangeText={setMemo}
          placeholderTextColor="#999"
          multiline
        />

        {/* DisplayFee (assuming you ported this for RN) */}
        <DisplayFee style={{ marginTop: 16 }} />

        {error ? (
          <ErrorCard text={getErrorMsg(error, gasOption, 'vote')} />
        ) : null}

        <Button
          style={styles.approveBtn}
          onPress={async () => {
            if (selectedVote !== undefined) {
              await onSubmitVote(selectedVote);
            }
          }}
          disabled={loading}
        >
          {loading ? <LoaderAnimation color={Colors.white100} /> : 'Approve'}
        </Button>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  voteMsgCard: {
    flexDirection: 'row',
    backgroundColor: '#E6FAF0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#29A874',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteMsgLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 3,
  },
  voteMsg: {
    fontSize: 17,
    color: '#222',
    fontWeight: 'bold',
  },
  voteType: {
    color: '#29A874',
  },
  proposalId: {
    color: '#0a69fe',
  },
  memoInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dedede',
    backgroundColor: '#fafafa',
    minHeight: 44,
    width: '100%',
    padding: 10,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 8,
    color: '#222',
  },
  approveBtn: {
    width: '100%',
    marginTop: 10,
  },
});
