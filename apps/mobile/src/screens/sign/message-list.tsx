import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { RightArrow } from '../../../assets/images/misc';

import { getMessageTitle, getSimpleType } from './message-details';

type MessageItemProps = {
  message: ParsedMessage;
  messageNumber: number;
  isLast: boolean;
  onClick: () => void;
};

const MessageItem: React.FC<MessageItemProps> = ({ message, isLast, onClick }) => {
  const _title = getMessageTitle(message);

  const title =
    message.__type === ParsedMessageType.Unimplemented
      ? getSimpleType(
          message.message['@type'] ?? message.message.type ?? message.message.type_url ?? message.message.typeUrl,
        )
      : _title;

  return (
    <TouchableOpacity
      style={[
        styles.messageItem,
        !isLast && styles.itemBorder,
      ]}
      activeOpacity={0.7}
      onPress={onClick}
    >
      <View style={styles.itemTextContainer}>
        <Text style={styles.messageTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Image source={{uri: RightArrow}} style={styles.arrowIcon} resizeMode="contain" />
    </TouchableOpacity>
  );
};

type MessageListProps = {
  parsedMessages: ParsedMessage[];
  onMessageSelect: (message: ParsedMessage, index: number) => void;
  className?: string;
};

const MessageList: React.FC<MessageListProps> = ({ parsedMessages, onMessageSelect }) => {
  return (
    <FlatList
      data={parsedMessages}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={({ item, index }) => (
        <MessageItem
          key={index}
          isLast={index === parsedMessages.length - 1}
          message={item}
          messageNumber={index + 1}
          onClick={() => onMessageSelect(item, index)}
        />
      )}
      contentContainerStyle={{ gap: 0 }}
    />
  );
};

export default MessageList;

const styles = StyleSheet.create({
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff', // Light background; use '#1A1A1A' for dark mode
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-100, use '#23272F' for dark mode
  },
  itemTextContainer: {
    flex: 1,
    maxWidth: '90%',
  },
  messageTitle: {
    fontWeight: 'bold',
    color: '#1F2937', // gray-900
    fontSize: 15,
    textAlign: 'left',
  },
  arrowIcon: {
    height: 20,
    width: 20,
    marginLeft: 12,
    tintColor: '#6B7280', // gray-400 or adjust for dark mode
  },
});
