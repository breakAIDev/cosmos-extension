import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'; // Uncomment if using a skeleton lib
import { sliceAddress, useChainApis } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait';

import { useMessageDetails } from './message-details';

type DetailItemProps = {
  message: ParsedMessage;
  activeChain: SupportedChain;
  selectedNetwork: 'mainnet' | 'testnet';
};

const DetailItem: React.FC<DetailItemProps> = ({ message, activeChain, selectedNetwork }) => {
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const { data, isLoading } = useMessageDetails(message, lcdUrl ?? '', activeChain);

  if (isLoading) {
    return (
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item/>
      </SkeletonPlaceholder>
    );
  }

  return (
    <View style={{ marginTop: 4 }}>
      <Text style={{ fontWeight: 'bold', color: '#111', fontSize: 15 }}>
        {data === 'unknown'
          ? message.__type === ParsedMessageType.Unimplemented
            ? (() => {
                const splitTypeUrl = message.message['@type'].split('.');
                const messageType = splitTypeUrl[splitTypeUrl.length - 1];
                return <Text style={{ color: '#EF4444' }}>{messageType}</Text>;
              })()
            : 'Unknown'
          : data}
      </Text>
    </View>
  );
};

type TransactionDetailsProps = {
  parsedMessages: ParsedMessage[] | null;
  activeChain: SupportedChain;
  selectedNetwork: 'mainnet' | 'testnet';
};

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  parsedMessages,
  activeChain,
  selectedNetwork,
}) => {
  const noMessageIsParsed = parsedMessages === null || parsedMessages.length === 0;
  const noMessageIsDecoded = noMessageIsParsed
    ? true
    : parsedMessages.every((msg) => msg.__type === ParsedMessageType.Unimplemented);

  const claimRewardsMessage = useMemo(() => {
    if (parsedMessages) {
      let message = '';
      let counter = 0;

      for (const parsedMessage of parsedMessages) {
        if (parsedMessage.__type === ParsedMessageType.ClaimReward) {
          if (counter === 0) {
            message = `Claim staking reward from ${sliceAddress(parsedMessage.validatorAddress)}`;
          }
          counter += 1;
        }
      }

      if (counter > 1) {
        message += ` and +${counter - 1} more validator${counter - 1 === 1 ? '' : 's'}`;
      }

      return message;
    }
    return '';
  }, [parsedMessages]);

  if (noMessageIsDecoded) return null;

  return (
    <View
      style={{
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        backgroundColor: 'rgba(58, 207, 146, 0.17)',
      }}
    >
      <Text style={{ color: '#777', fontSize: 14, fontWeight: '500', letterSpacing: 0.2, marginBottom: 4 }}>
        Transaction Summary
      </Text>
      <View style={{ marginTop: 8 }}>
        {claimRewardsMessage ? (
          <Text style={{ fontWeight: 'bold', color: '#111', fontSize: 15 }}>{claimRewardsMessage}</Text>
        ) : (
          parsedMessages?.map((msg, i) => (
            <DetailItem key={i} message={msg} activeChain={activeChain} selectedNetwork={selectedNetwork} />
          )) || (
            <Text style={{ color: '#EF4444', fontSize: 14 }}>No information available</Text>
          )
        )}
      </View>
    </View>
  );
};

export default TransactionDetails;
