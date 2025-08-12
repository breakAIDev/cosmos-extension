import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text as RNText,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useActiveChain, useAddCustomChannel, useChainsStore, useCustomChannels, useDefaultChannelId } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ActionInputWithPreview } from '../../../../components/action-input-with-preview';
import BottomModal from '../../../../components/bottom-modal';
import DisclosureContainer from '../../../../components/disclosure-container';
import { LoaderAnimation } from '../../../../components/loader/Loader';
import RadioGroup from '../../../../components/radio-group';
import Text from '../../../../components/text';
import { Images } from '../../../../../assets/images';
import { getChainColor } from '../../../../theme/colors';

type AddIBCChannelProps = {
  targetChain: string;
  onAddComplete: (value: string) => void;
};

const AddIBCChannel = ({ targetChain, onAddComplete }: AddIBCChannelProps) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const addCustomChannel = useAddCustomChannel({ targetChain });
  const activeChain = useActiveChain();
  const { chains } = useChainsStore();
  const activeChainInfo = chains[activeChain];

  const handleAddChannel = useCallback(async (channelId: string) => {
    setStatus('loading');
    try {
      const result = await addCustomChannel(channelId);
      if (result.success) {
        onAddComplete(result.channel);
        setValue('');
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (e) {
      setStatus('error');
      setMessage('Something went wrong');
    }
  }, [addCustomChannel, onAddComplete]);

  return (
    <View>
      <ActionInputWithPreview
        action={status === 'error' ? 'Clear' : 'Save'}
        buttonText={status === 'error' ? 'Clear' : 'Save'}
        buttonTextColor={getChainColor(activeChain)}
        rightElement={status === 'loading' ? <LoaderAnimation color="white" /> : null}
        value={value}
        invalid={status === 'error'}
        placeholder="Enter source channel ID"
        onAction={(action, inputValue) => {
          if (action === 'Clear') {
            setValue('');
            setStatus('idle');
            setMessage('');
          } else {
            handleAddChannel(inputValue);
          }
        }}
        onChangeText={text => {
          setValue(text);
          if (status === 'error') {
            setStatus('idle');
            setMessage('');
          }
        }}
        // onKeyDown={() => handleAddChannel(value)}
      />
      <RNText style={styles.channelHint}>
        You can enter <RNText style={{ fontWeight: 'bold' }}>24</RNText> for channel-24 on {activeChainInfo.chainName}
      </RNText>
      {status === 'error' ? <RNText style={styles.errorText}>{message}</RNText> : null}
      {status === 'success' ? <RNText style={styles.successText}>{message}</RNText> : null}
    </View>
  );
};

type IBCSettingsProps = {
  style?: StyleProp<ViewStyle>;
  targetChain: SupportedChain;
  onSelectChannel: (channelId: string | undefined) => void;
};

export const IBCSettings = ({ style, targetChain, onSelectChannel }: IBCSettingsProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultChannelId, setDefaultChannelId] = useState<string | undefined>(undefined);
  const [customChannelId, setCustomChannelId] = useState('');

  const { chains } = useChainsStore();
  const sourceChain = useActiveChain();

  const sourceChainInfo = chains[sourceChain];
  const targetChainInfo = chains[targetChain];
  const customChannels = useCustomChannels();
  const { data, status } = useDefaultChannelId(sourceChain, targetChain);

  useEffect(() => {
    if (status === 'success') {
      setDefaultChannelId(data);
    } else if (status === 'error') {
      setDefaultChannelId(undefined);
    }
  }, [data, status]);

  const handleSelectChannel = useCallback(
    (value: string) => {
      setCustomChannelId(value);
      if (value === defaultChannelId && defaultChannelId !== undefined) {
        onSelectChannel(undefined);
      } else {
        onSelectChannel(value);
      }
    },
    [defaultChannelId, onSelectChannel],
  );

  useEffect(() => {
    if (defaultChannelId) {
      handleSelectChannel(defaultChannelId);
    }
  }, [defaultChannelId, handleSelectChannel]);

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
        subTitle: 'Default channel',
        value: defaultChannelId,
      },
      ...customChannelsForTargetChain,
    ];
  }, [customChannelsForTargetChain, defaultChannelId]);

  return (
    <>
      {/* Banner */}
      <View style={[styles.ibcBanner, style]}>
        <Image source={{uri: Images.Misc.IBC}} style={{ width: 24, height: 24 }} />
        <Text size="sm" color="#fff" style={styles.ml2}>
          This is an IBC transfer
          {!!customChannelId && customChannelId !== defaultChannelId ? <> · {customChannelId}</> : <View/>}
        </Text>
        <TouchableOpacity style={styles.mlAuto} onPress={() => setIsSettingsOpen(true)}>
          <Image source={{uri: Images.Misc.Settings}} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
      </View>

      <BottomModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Advanced IBC Settings"
      >
        <View style={styles.modalBody}>
          <Text size="sm" style={{ color: '#222', fontWeight: '600', marginBottom: 8 }}>
            {sourceChainInfo.chainName} to {targetChainInfo.chainName} channels
          </Text>
          {defaultChannelId === null ? (
            <View style={{ marginVertical: 12 }}>
              <LoaderAnimation color="#6C47F4" />
            </View>
          ) : allOptions.length > 0 ? (
            <RadioGroup
              style={styles.radioGroup}
              themeColor={getChainColor(sourceChain)}
              options={allOptions}
              onChange={handleSelectChannel}
              selectedOption={customChannelId}
            />
          ) : (
            <View style={{ marginVertical: 16, alignItems: 'center' }}>
              <RNText style={{ color: '#a0a0a0', fontSize: 14 }}>
                No IBC channels found, you can add a custom channel below.
              </RNText>
            </View>
          )}
          <View style={[styles.row, { marginTop: 12 }]}>
            <Text size="xs" style={{ color: '#666' }}>Need Help?</Text>
            {/* Info: Instead of tooltip, show below as helper text */}
            <Image source={{uri: Images.Misc.InfoCircle}} style={styles.infoCircle} />
          </View>
          <RNText style={styles.channelHint}>
            ID of the channel that will relay your tokens from {sourceChainInfo.chainName} to {targetChainInfo.chainName}.
          </RNText>
        </View>
        <DisclosureContainer
          title="Add Custom Channel"
          style={styles.mt4}
          initialOpen={allOptions.length === 0}
          leftIcon={Images.Misc.AddCircle}
        >
          <AddIBCChannel targetChain={targetChain} onAddComplete={handleSelectChannel} />
        </DisclosureContainer>
      </BottomModal>
    </>
  );
};

// ---- IBCBanner ----

export const IBCBanner = ({ style, channelId }: {
  style?: StyleProp<ViewStyle>;
  channelId?: string;
}) => (
  <View style={[styles.ibcBanner, style]}>
    <Image source={{uri: Images.Misc.IBC}} style={{ width: 24, height: 24 }} />
    <Text size="sm" color="#fff" style={styles.ml2}>
      This is an IBC transfer {channelId === undefined ? null : <>· {channelId}</>}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  ibcBanner: {
    backgroundColor: '#6C47F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    width: '100%',
  },
  ml2: { marginLeft: 8 },
  mlAuto: { marginLeft: 'auto' },
  px4: { paddingHorizontal: 16 },
  py3: { paddingVertical: 12 },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  mt2: { marginTop: 8 },
  mt4: { marginTop: 16 },
  mb4: { marginBottom: 16 },
  radioGroup: { marginTop: 8, marginBottom: 16 },
  infoCircle: { marginLeft: 8, width: 18, height: 18 },
  channelHint: { fontSize: 13, color: '#737373', marginTop: 6, textAlign: 'center' },
  errorText: { color: '#e55353', fontSize: 13, marginTop: 8 },
  successText: { color: '#25d796', fontSize: 13, marginTop: 8 },
});


export default IBCSettings;
