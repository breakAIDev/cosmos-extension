import { useChainsStore, useCustomChannels, useDefaultChannelId } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { SkipMsg, SkipMsgV2, UseRouteResponse, useTransactions } from '@leapwallet/elements-hooks';
import { Buttons } from '@leapwallet/leap-ui';
import { Info, MinusCircle, PlusCircle, Question, Warning } from 'phosphor-react-native';
import Tooltip from '../../../../components/better-tooltip';
import BottomModal from '../../../../components/bottom-modal';
import { CustomCheckbox } from '../../../../components/custom-checkbox';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import RadioGroup from '../../../../components/radio-group';
import Text from '../../../../components/text';
import { useSendContext } from '../../../send-v2/context';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Colors } from '../../../../theme/colors';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import AddIBCChannel from './AddIBCChannel';

type IBCSettingsProps = {
  targetChain: SupportedChain;
  sourceChain: SupportedChain;
};

const IBCSettings: React.FC<IBCSettingsProps> = ({ targetChain, sourceChain }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultChannelId, setDefaultChannelId] = useState<string | undefined | null>(null);
  const [sendViaUnverifiedChannel, setSendViaUnverifiedChannel] = useState<boolean>(false);
  const [isAddChannel, setIsAddChannel] = useState<boolean>(false);
  const [customChannelId, setCustomChannelId] = useState<string>();

  const { chains } = useChainsStore();
  const sourceChainInfo = chains[sourceChain];
  const targetChainInfo = chains[targetChain];

  const customChannels = useCustomChannels();
  const { data, status } = useDefaultChannelId(sourceChain, targetChain);
  const { transferData, setIsIbcUnwindingDisabled, customIbcChannelId, setCustomIbcChannelId } = useSendContext();

  const routeWithMessages = useMemo(
    () =>
      transferData?.isSkipTransfer && transferData?.routeResponse
        ? {
            ...transferData?.routeResponse,
            messages: transferData?.messages,
          }
        : {
            operations: [],
            messages: [],
            sourceAsset: { denom: null },
          },
    // @ts-ignore
    [transferData?.isSkipTransfer, transferData?.messages, transferData?.routeResponse],
  );

  const { groupedTransactions } = useTransactions(
    routeWithMessages as (UseRouteResponse & { messages?: SkipMsg[] | SkipMsgV2[] }) | null,
  );

  // Path composition (unused but kept for parity)
  const path: string[] = [];
  Object.values(groupedTransactions)?.forEach((d: any[], index1: number) => {
    d.forEach((f: any, index2: number) => {
      if (index1 == 0 && index2 == 0) {
        path.push(f.sourceChain);
      }
      path.push(f.destinationChain);
    });
  });

  useEffect(() => {
    if (status === 'success') {
      setDefaultChannelId(data);
    } else if (status === 'error') {
      setDefaultChannelId(undefined);
    }
  }, [data, status]);

  const handleClick = useCallback(() => {
    setIsSettingsOpen((prev) => !prev);
  }, []);

  const handleSelectChannel = useCallback(
    (value: string) => {
      if (value === customChannelId && customChannelId !== undefined) {
        setCustomChannelId(undefined);
      } else {
        setCustomChannelId(value);
      }
    },
    [customChannelId],
  );

  const customChannelsForTargetChain = useMemo(
    () =>
      customChannels
        .filter(({ counterPartyChain }) => counterPartyChain === targetChain)
        .map(({ channelId }) => ({
          title: channelId,
          subTitle: 'Custom channel',
          value: channelId,
        }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [customChannels, targetChain],
  );

  const allOptions = useMemo(() => {
    if (!defaultChannelId) {
      return customChannelsForTargetChain;
    }
    return [
      {
        title: defaultChannelId,
        subTitle: 'Prefetched from Cosmos directory registry',
        value: defaultChannelId,
      },
      ...customChannelsForTargetChain,
    ];
  }, [customChannelsForTargetChain, defaultChannelId]);

  const hasChannelId = allOptions.length > 0;

  const handleAddChannel = useCallback(() => {
    if (hasChannelId) {
      setIsAddChannel((prev) => !prev);
      setCustomChannelId(undefined);
    }
  }, [hasChannelId]);

  const onProceed = () => {
    setIsIbcUnwindingDisabled(true);
    setIsSettingsOpen(false);
    setCustomIbcChannelId(customChannelId);
  };

  return (
    <>
      <View
        style={[
          styles.warningBar,
          customIbcChannelId && styles.warningBarCustom,
        ]}
      >
        {customIbcChannelId ? (
          <Info size={16} color="#FFB33D" style={{ alignSelf: 'flex-start' }} />
        ) : (
          <Warning size={16} color="#F87171" style={{ alignSelf: 'flex-start' }} />
        )}
        <View style={{ flex: 1 }}>
          <Text size="xs" style={styles.boldText}>
            {customIbcChannelId ? 'Unverified Channel' : 'No verified routes available.'}
          </Text>
          <Text size="xs" style={styles.infoSubText}>
            {customIbcChannelId
              ? customIbcChannelId
              : hasChannelId
              ? 'You can select channels from an unverified list to transfer.'
              : 'You can add a custom channel to transfer.'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleClick}
          style={styles.selectBtn}
          activeOpacity={0.7}
        >
          <Text size="xs" style={styles.selectBtnText}>
            {customIbcChannelId ? 'Edit selection' : hasChannelId ? 'Select channel' : 'Add channel'}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Advanced IBC Settings"
        closeOnBackdropClick={true}
        containerStyle={{ maxHeight: '90%' }}
        style={{ padding: 24 }}
      >
        <View style={styles.panelContainer}>
          <View style={styles.channelsHeaderRow}>
            <View style={styles.headerLeftRow}>
              <Text style={styles.boldText}>Select channels</Text>
              <Tooltip
                content={
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>
                    ID of the channel that will relay your tokens from {sourceChainInfo.chainName} to {targetChainInfo?.chainName}.
                  </Text>
                }
              >
                <View style={{ marginLeft: 6 }}>
                  <Question size={20} color="#6B7280" />
                </View>
              </Tooltip>
            </View>
            <TouchableOpacity
              style={styles.addChannelBtn}
              onPress={handleAddChannel}
              activeOpacity={0.7}
            >
              {!isAddChannel && hasChannelId ? (
                <PlusCircle size={16} weight="bold" color="#111827" />
              ) : (
                <MinusCircle size={16} weight="bold" color="#111827" />
              )}
              <Text size="xs" style={styles.addChannelText}>
                Add Channel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.channelsOptionsBlock}>
            {!isAddChannel && hasChannelId ? (
              <>
                <Text size="sm" style={styles.channelsListTitle}>
                  {sourceChainInfo.chainName} to {targetChainInfo?.chainName} channels
                </Text>
                {defaultChannelId === null ? (
                  <View style={styles.loaderBox}>
                    <LoaderAnimation color="white" />
                  </View>
                ) : (
                  <RadioGroup
                    themeColor={Colors.green600}
                    options={allOptions}
                    onChange={handleSelectChannel}
                    selectedOption={customChannelId as string}
                  />
                )}
              </>
            ) : (
              <AddIBCChannel targetChain={targetChain} onAddComplete={handleSelectChannel} />
            )}
          </View>
        </View>

        <View style={styles.unverifiedWarnBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Warning size={24} weight="bold" color="#F87171" style={{ alignSelf: 'flex-start' }} />
            <Text size="sm" style={styles.boldText}>Sending via unverified channel.</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, gap: 8 }}>
            <View style={{ marginRight: 6 }}>
              <CustomCheckbox
                checked={sendViaUnverifiedChannel}
                onClick={() => setSendViaUnverifiedChannel((prevValue) => !prevValue)}
              />
            </View>
            <Text size="xs" style={styles.infoSubText}>
              Usability of tokens sent via unverified channels is not guaranteed. I understand and wish to proceed.
            </Text>
          </View>
        </View>

        <Buttons.Generic
          color={Colors.green600}
          size="normal"
          style={{ width: '100%' }}
          title="Proceed"
          disabled={!sendViaUnverifiedChannel || !customChannelId}
          onClick={onProceed}
        >
          Proceed
        </Buttons.Generic>
      </BottomModal>
    </>
  );
};

const styles = StyleSheet.create({
  warningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2', // bg-red-100
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  warningBarCustom: {
    backgroundColor: '#FFEDD5', // bg-orange-200
  },
  boldText: {
    fontWeight: 'bold',
  },
  infoSubText: {
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 2,
  },
  selectBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginLeft: 8,
  },
  selectBtnText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 12,
  },
  panelContainer: {
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'center',
  },
  channelsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addChannelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addChannelText: {
    fontWeight: '500',
    color: '#111827',
    fontSize: 12,
    marginLeft: 4,
  },
  channelsOptionsBlock: {
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 18,
    padding: 16,
    gap: 16,
  },
  channelsListTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  unverifiedWarnBox: {
    backgroundColor: '#FEE2E2', // bg-red-100
    borderRadius: 18,
    padding: 16,
    marginVertical: 16,
  },
});

export default IBCSettings;
