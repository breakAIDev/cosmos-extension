import { useChainApis } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants';
import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait';
import BottomModal from '../../components/bottom-modal'; // React Native compatible
import DisclosureContainer from '../../components/disclosure-container'; // React Native compatible
import { LoaderAnimation } from '../../components/loader/Loader';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';

import { getSimpleType, useMessageDetails } from './message-details';

const MessageDetailsSheet: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClose: () => void;
  message: {
    index: number;
    parsed: ParsedMessage;
    raw: any;
  } | null;
  activeChain: SupportedChain;
  selectedNetwork: 'mainnet' | 'testnet';
}> = ({ isOpen, setIsOpen, message, onClose, activeChain, selectedNetwork }) => {
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const { isLoading, data } = useMessageDetails(message?.parsed, lcdUrl ?? '', activeChain);

  if (!message) return null;

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        onClose();
      }}
      title={`Message ${message.index + 1}`}
      closeOnBackdropClick={true}
    >
      {!isLoading && data ? (
        <>
          <View style={{ width: '100%', padding: 16, backgroundColor: '#fff', borderRadius: 16 }}>
            <Text style={{ color: '#888', fontSize: 14, fontWeight: '500' }}>Description</Text>
            <Text style={{ color: '#222', fontSize: 15, fontWeight: 'bold', marginTop: 4 }}>
              {data === 'unknown' ? (
                message.parsed.__type === ParsedMessageType.Unimplemented ? (
                  <Text style={{ color: 'red' }}>
                    {getSimpleType(
                      message.parsed.message['@type'] ??
                        message.parsed.message.type ??
                        message.parsed.message.type_url ??
                        message.parsed.message.typeUrl,
                    )}
                  </Text>
                ) : (
                  'Unknown'
                )
              ) : (
                data
              )}
            </Text>
          </View>
          <DisclosureContainer title="Message Data" initialOpen={true} style={{ marginTop: 16, padding: 0 }}>
            <ScrollView horizontal style={{ width: '100%', marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#222',
                  fontFamily: 'monospace',
                  flexShrink: 1,
                }}
                selectable
              >
                {JSON.stringify(
                  message.raw,
                  (key, value) => (typeof value === 'bigint' ? value.toString() : value),
                  2,
                )}
              </Text>
            </ScrollView>
          </DisclosureContainer>
        </>
      ) : (
        <View style={{ height: 128, alignItems: 'center', justifyContent: 'center' }}>
          <LoaderAnimation color="white" />
          <Text style={{ color: '#222', fontSize: 12, marginTop: 8 }}>Loading message details</Text>
        </View>
      )}
    </BottomModal>
  );
};

export default MessageDetailsSheet;
