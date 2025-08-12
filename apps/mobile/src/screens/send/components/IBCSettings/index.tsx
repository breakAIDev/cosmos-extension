import { useChainsStore, useCustomChannels, useDefaultChannelId } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { SkipMsg, SkipMsgV2, UseRouteResponse, useTransactions } from '@leapwallet/elements-hooks';
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { Info, Minus, Plus, Warning } from 'phosphor-react-native';
import Tooltip from '../../../../components/better-tooltip';
import { CustomCheckbox } from '../../../../components/custom-checkbox';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import BottomModal from '../../../../components/new-bottom-modal';
import Text from '../../../../components/text';
import { useSendContext } from '../../../send/context';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Colors } from '../../../../theme/colors';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import RadioGroupSend from './RadioGroup';

type IBCSettingsProps = {
  className?: string;
  targetChain: SupportedChain;
  sourceChain: SupportedChain;
};

const IBCSettings: React.FC<IBCSettingsProps> = ({ targetChain, sourceChain }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultChannelId, setDefaultChannelId] = useState<string | undefined | null>(null);
  const [sendViaUnverifiedChannel, setSendViaUnverifiedChannel] = useState<boolean>(false);
  const [isAddChannel, setIsAddChannel] = useState<boolean>(false);
  const [customChannelId, setCustomChannelId] = useState<string>();
  const { theme } = useTheme();
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

  const path: string[] = [];
  Object.values(groupedTransactions)?.forEach((d: any[], index1: number) => {
    d.forEach((f: any, index2: number) => {
      if (index1 === 0 && index2 === 0) {
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
          styles.alertBox,
          customIbcChannelId ? styles.alertBoxOrange : styles.alertBoxRed,
        ]}
      >
        {customIbcChannelId ? (
          <Info size={16} color="#FFB33D" style={{ alignSelf: 'flex-start' }} />
        ) : (
          <Warning size={16} color="#F87171" style={{ alignSelf: 'flex-start' }} />
        )}
        <View style={{ flex: 1 }}>
          <Text size="xs" style={[styles.alertTitle]}>
            {customIbcChannelId ? 'Unverified Channel' : 'No verified routes available.'}
          </Text>
          <Text size="xs" color="text-gray-800 dark:text-gray-200" style={styles.alertMessage}>
            {customIbcChannelId
              ? customIbcChannelId
              : hasChannelId
              ? 'You can select channels from an unverified list to transfer.'
              : 'You can add a custom channel to transfer.'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleClick}
          style={styles.selectChannelBtn}
          activeOpacity={0.8}
        >
          <Text
            size="xs"
            style={{ fontWeight: 'bold', color: '#19191A' }}
          >
            {customIbcChannelId ? 'Edit selection' : hasChannelId ? 'Select channel' : 'Add channel'}
          </Text>
        </TouchableOpacity>
      </View>
      <BottomModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Advanced IBC Settings"
        containerStyle={styles.modalContainer}
        contentStyle={[
          styles.modalContent,
          theme === ThemeName.DARK ? styles.modalDark : styles.modalLight,
        ]}
        style={styles.modalInner}
      >
        <View style={styles.modalBox}>
          <View style={styles.channelsRow}>
            <View style={styles.channelsTitleRow}>
              <Text style={styles.channelTitle}>Select channels</Text>
              <Tooltip
                content={
                  <Text style={styles.tooltipText}>
                    ID of the channel that will relay your tokens from {sourceChainInfo.chainName} to{' '}
                    {targetChainInfo?.chainName}.
                  </Text>
                }
              >
                <Info size={20} color={theme === ThemeName.DARK ? "#D1D5DB" : "#666"} />
              </Tooltip>
            </View>
            <TouchableOpacity style={styles.addChannelRow} onPress={handleAddChannel}>
              {!isAddChannel && hasChannelId ? (
                <Plus size={14} weight="bold" color="#16A34A" />
              ) : (
                <Minus size={14} weight="bold" color="#16A34A" />
              )}
              <Text size="xs" style={styles.addChannelText}>
                Add Channel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.channelOptionsBox}>
            <Text size="xs" style={styles.channelsSubText}>
              {sourceChainInfo.chainName} to {targetChainInfo?.chainName} channels
            </Text>
            {defaultChannelId === null ? (
              <View style={styles.loaderCenter}>
                <LoaderAnimation color="white" />
              </View>
            ) : (
              <RadioGroupSend
                themeColor={theme === ThemeName.DARK ? Colors.white100 : Colors.black100}
                options={allOptions}
                onChange={handleSelectChannel}
                selectedOption={customChannelId as string}
                targetChain={targetChain}
                isAddChannel={isAddChannel}
                hasChannelId={hasChannelId}
              />
            )}
          </View>
        </View>

        <View style={styles.warningBox}>
          <View style={styles.warningTitleRow}>
            <Warning size={20} weight="bold" color="#F87171" style={{ alignSelf: 'flex-start' }} />
            <Text size="sm" style={styles.warningTitle}>Sending via unverified channel.</Text>
          </View>
          <View style={styles.warningCheckboxRow}>
            <CustomCheckbox
              checked={sendViaUnverifiedChannel}
              isWhite={true}
              onClick={() => setSendViaUnverifiedChannel((prevValue) => !prevValue)}
            />
            <Text size="xs" style={styles.warningMessage}>
              Usability of tokens sent via unverified channels is not guaranteed. I understand and wish to proceed.
            </Text>
          </View>
        </View>

        <Buttons.Generic
          color={Colors.green600}
          size="normal"
          style={styles.proceedBtn}
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

export default IBCSettings;

const styles = StyleSheet.create({
  alertBox: {
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FDE6D7',
    marginBottom: 12,
  },
  alertBoxOrange: {
    backgroundColor: '#FFEFD0',
  },
  alertBoxRed: {
    backgroundColor: '#FDE6D7',
  },
  alertTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  alertMessage: {
    fontWeight: '500',
    marginBottom: 0,
  },
  selectChannelBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 8,
  },
  modalContainer: {
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#FFF',
  },
  modalDark: {
    backgroundColor: '#0B0B0E',
  },
  modalLight: {
    backgroundColor: '#FFF',
  },
  modalInner: {
    padding: 24,
  },
  modalBox: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  channelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  channelsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  tooltipText: {
    color: '#666',
    fontSize: 14,
  },
  addChannelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addChannelText: {
    fontWeight: '500',
    color: '#16A34A',
    marginLeft: 4,
  },
  channelOptionsBox: {
    backgroundColor: '#F3F5FA',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    width: '100%',
  },
  channelsSubText: {
    fontWeight: 'bold',
    color: '#232334',
    textTransform: 'capitalize',
    marginBottom: 14,
  },
  loaderCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    height: 40,
  },
  warningBox: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FDE6D7',
    marginVertical: 18,
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  warningTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 16,
    color: '#F87171',
  },
  warningCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  warningMessage: {
    fontWeight: '500',
    color: '#232334',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  proceedBtn: {
    width: '100%',
    marginTop: 8,
    borderRadius: 14,
  },
});
