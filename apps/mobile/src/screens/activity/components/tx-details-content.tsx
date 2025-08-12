import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Avatar } from '@leapwallet/leap-ui';
import { parfait, ParsedMessage } from '@leapwallet/parser-parfait';
import dayjs from 'dayjs';
import { useActivityImage } from '../../../hooks/activity/useActivityImage';
import { DollarIcon } from '../../../../assets/icons/dollar-icon';
import { Images } from '../../../../assets/images';
import { UserClipboard } from '../../../utils/clipboard';
import { formatTokenAmount, sliceAddress } from '../../../utils/strings';
import { SelectedTx } from './ChainActivity';
import { CopyButton } from './copy-button';
import { DetailsCard } from './tx-detail-card';

const getActivityIconAndTitle = (activeChain: SupportedChain): Record<string, { icon: string; title: string }> => {
  return {
    send: { icon: Images.Activity.SendIcon, title: 'Sent' },
    receive: { icon: Images.Activity.ReceiveIcon, title: 'Received' },
    pending: { icon: Images.Activity.PendingDetails, title: 'Pending' },
    delegate: { icon: Images.Activity.Delegate, title: 'Delegated' },
    undelegate: { icon: Images.Activity.Undelegate, title: 'Undelegated' },
    'ibc/transfer': { icon: Images.Activity.SwapIcon, title: 'IBC Transfer' },
    vote: { icon: Images.Activity.TxHash, title: 'Voted' },
    swap: {
      icon: Images.Logos.ChainLogos[activeChain] ?? Images.Activity.SendDetails,
      title: 'Swap',
    },
    fallback: { icon: Images.Activity.SendIcon, title: 'Success' },
    secretTokenTransfer: { icon: Images.Activity.SendDetails, title: 'Sent' },
    'liquidity/add': {
      icon: Images.Activity.Delegate,
      title: 'Add Liquidity',
    },
    'liquidity/remove': {
      icon: Images.Activity.Undelegate,
      title: 'Remove Liquidity',
    },
  };
};

export const TxDetailsContent = ({
  tx,
  contact,
  activeChain,
  txnMessage,
}: {
  tx: SelectedTx;
  contact: { name: string; emoji: number };
  activeChain: SupportedChain;
  txnMessage?: ParsedMessage;
}) => {
  const chainInfos = useGetChains();
  const chainInfo = chainInfos[activeChain];

  const isSimpleTokenTransfer =
    tx?.content?.txType === 'send' || tx?.content?.txType === 'receive' || tx?.content?.txType === 'ibc/transfer';

  const isTxSuccessful = tx?.parsedTx?.code === 0;

  const { sentAmount, sentTokenInfo, receivedAmount, receivedTokenInfo, sentUsdValue, receivedUsdValue, txType } =
    tx?.content ?? {};

  const defaultImg = useActivityImage(txType ?? 'fallback', activeChain);
  const iconAndTitle = getActivityIconAndTitle(activeChain);

  const { icon, title } = iconAndTitle[txType ?? ''] || iconAndTitle.fallback;
  const date = useMemo(() => dayjs(tx?.parsedTx?.timestamp).format('D MMMM YYYY h:mm A'), [tx]);

  const sentAmountInfo =
    sentAmount && sentTokenInfo?.coinDenom ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom) : undefined;
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo?.coinDenom
      ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom)
      : undefined;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Image source={{ uri: isTxSuccessful ? icon : Images.Activity.Error }} style={styles.iconImg} />

        <Text style={styles.titleText}>
          {tx?.content?.txType === 'vote' ? tx?.content?.title1 : isTxSuccessful ? title : 'Fail'}
        </Text>

        <Text style={styles.dateText}>{date}</Text>
      </View>

      {(sentAmountInfo || receivedAmountInfo) && (
        <DetailsCard
          title={tx?.content?.title1}
          imgSrc={chainInfo.chainSymbolImageUrl ?? defaultImg}
          subtitle={sentAmountInfo ?? receivedAmountInfo ?? ''}
          activeChain={activeChain}
          txType={tx?.content?.txType}
          trailing={
            <Text
              style={[
                styles.amountText,
                receivedUsdValue ? styles.accentSuccess : undefined,
                sentUsdValue ? styles.destructive : undefined,
              ]}
            >
              {sentUsdValue
                ? `- $${Number(sentUsdValue).toFixed(2)}`
                : receivedUsdValue
                ? `+ $${Number(receivedUsdValue).toFixed(2)}`
                : ''}
            </Text>
          }
        />
      )}

      {/* Send and Receive */}
      {isSimpleTokenTransfer && (
        <View style={styles.transferContainer}>
          {tx?.content?.txType === 'send' ? (
            <DetailsCard
              title={'Sent to ' + contact.name}
              imgSrc={<Avatar emoji={contact.emoji} size='sm' />}
              subtitle={sliceAddress((txnMessage as parfait.cosmos.bank.send).toAddress)}
              activeChain={activeChain}
              txType={tx?.content?.txType}
              trailing={
                <CopyButton
                  onPress={() => {
                    UserClipboard.copyText((txnMessage as parfait.cosmos.bank.send).toAddress);
                  }}
                />
              }
            />
          ) : tx?.content?.txType === 'receive' ? (
            <DetailsCard
              title={'Received from ' + contact.name}
              imgSrc={<Avatar emoji={contact.emoji} size='sm' />}
              subtitle={sliceAddress((txnMessage as parfait.cosmos.bank.send).fromAddress)}
              activeChain={activeChain}
              txType={tx?.content?.txType}
              trailing={
                <CopyButton
                  onPress={() => {
                    UserClipboard.copyText((txnMessage as parfait.cosmos.bank.send).fromAddress);
                  }}
                />
              }
            />
          ) : null}
        </View>
      )}

      {/* Transaction ID */}
      <View>
        <DetailsCard
          title="Transaction ID"
          imgSrc={
            <View style={styles.txIdAvatar}>
              <Text style={styles.txIdText}>#</Text>
            </View>
          }
          subtitle={sliceAddress(tx?.parsedTx?.txHash ?? '')}
          activeChain={activeChain}
          txType={tx?.content?.txType}
          trailing={
            <CopyButton
              onPress={() => {
                UserClipboard.copyText(tx?.parsedTx?.txHash ?? '');
              }}
            />
          }
        />

        {tx?.content?.feeAmount && (
          <DetailsCard
            title="Transaction Fee"
            imgSrc={
              <View style={styles.feeAvatar}>
                <DollarIcon width={16} height={16} />
              </View>
            }
            subtitle={tx?.content?.feeAmount}
            activeChain={activeChain}
            txType={tx?.content?.txType}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  iconImg: {
    width: 72,
    height: 72,
    marginBottom: 8,
    borderRadius: 36,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#8A94A6',
    marginTop: 6,
  },
  amountText: {
    color: '#8A94A6',
    fontWeight: '500',
    marginLeft: 'auto',
  },
  accentSuccess: {
    color: '#26c06f',
  },
  destructive: {
    color: '#E2655A',
  },
  transferContainer: {
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
  txIdAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#E6EBF0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIdText: {
    color: '#8A94A6',
    fontWeight: 'bold',
    fontSize: 17,
  },
  feeAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#E6EBF0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
