import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SecretToken, useAddress, useChainApis, useChainId } from '@leapwallet/cosmos-wallet-hooks';
import { Buttons, GenericCard } from '@leapwallet/leap-ui';
import BottomModal from '../../../components/bottom-modal';
import { ErrorCard } from '../../../components/ErrorCard';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { useCreateViewingKey } from '../../../hooks/secret/useCreateViewingKey';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../context/root-store';
import { Colors } from '../../../theme/colors';
import { UserClipboard } from '../../../utils/clipboard';
import { useSnip20ManageTokens } from '../context';
import { CopyViewingKey, Fee } from './index';

type ImportKeySheetProps = {
  isVisible: boolean;
  onClose: () => void;
  type: 'import' | 'update';
  token?: SecretToken & { contractAddr: string };
  onSuccess: VoidFunction;
};

export function ImportKeySheet({
  isVisible,
  onClose,
  type,
  token,
  onSuccess,
}: ImportKeySheetProps) {
  const defaultLogo = useDefaultTokenLogo();
  const [viewingKeyLoader, setViewingKeyLoader] = useState(false);
  const [inputViewingKey, setInputViewingKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createViewingKey = useCreateViewingKey();
  const [showCopyKey, setShowCopyKey] = useState(false);
  const address = useAddress();
  const { lcdUrl } = useChainApis('secret');
  const chainId = useChainId();
  const inputEleRef = useRef<TextInput>(null);

  const { setContractAddress, userPreferredGasLimit, userPreferredGasPrice } = useSnip20ManageTokens();

  useEffect(() => {
    if (token?.contractAddr) {
      setContractAddress(token.contractAddr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.contractAddr]);

  useEffect(() => {
    if (inputEleRef?.current && isVisible && !showCopyKey) {
      inputEleRef.current.focus();
    }
  }, [inputEleRef, isVisible, showCopyKey]);

  const clearState = useCallback(() => {
    setViewingKeyLoader(false);
    setError(null);
    setInputViewingKey('');
    setShowCopyKey(false);
    onClose();
  }, [onClose]);

  const handleConfirmClick = useCallback(async () => {
    if (showCopyKey) {
      onSuccess();
      clearState();
    } else {
      setViewingKeyLoader(true);
      const res = await createViewingKey(
        lcdUrl ?? '',
        chainId ?? '',
        address,
        token?.contractAddr as string,
        type === 'import',
        {
          key: inputViewingKey,
          gasLimit: userPreferredGasLimit,
          feeDenom: userPreferredGasPrice?.denom,
          gasPriceStep: Number(userPreferredGasPrice?.amount ?? 0),
        },
      );

      if (res.error) {
        setError(res.error);
        setViewingKeyLoader(false);
      } else {
        setShowCopyKey(true);
        setViewingKeyLoader(false);
      }
    }
  }, [
    address,
    chainId,
    clearState,
    createViewingKey,
    inputViewingKey,
    lcdUrl,
    onSuccess,
    showCopyKey,
    token?.contractAddr,
    type,
    userPreferredGasLimit,
    userPreferredGasPrice?.amount,
    userPreferredGasPrice?.denom,
  ]);

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={clearState}
      title={type === 'import' ? 'Import viewing key' : 'Update viewing key'}
    >
      <View style={styles.content}>
        <GenericCard
          style={styles.tokenCard}
          title={token?.symbol}
          subtitle={token?.name}
          img={
            <Image
              source={{ uri: token?.icon ?? defaultLogo}}
              style={styles.tokenImg}
            />
          }
        />

        <TextInput
          ref={inputEleRef}
          style={styles.input}
          placeholder="enter key"
          placeholderTextColor="#A1A1AA"
          value={inputViewingKey}
          onChangeText={(text) => {
            setInputViewingKey(text);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!showCopyKey && !viewingKeyLoader}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        {type !== 'import' && !showCopyKey ? (
          <Fee rootDenomsStore={rootDenomsStore} rootBalanceStore={rootBalanceStore} />
        ) : null}
        {error ? (
          <View style={{ marginBottom: 10 }}>
            <ErrorCard text={error} style={{ marginBottom: 12 }} />
          </View>
        ) : null}

        {showCopyKey ? (
          <CopyViewingKey
            generatedViewingKey={inputViewingKey}
            onCopy={async () => {
              UserClipboard.copyText(inputViewingKey);
            }}
          />
        ) : null}

        {!viewingKeyLoader ? (
          <Buttons.Generic
            size="normal"
            color={'#E18881'}
            disabled={!inputViewingKey || !!error}
            style={styles.button}
            onClick={handleConfirmClick}
          >
            {showCopyKey ? 'Done' : 'Confirm'}
          </Buttons.Generic>
        ) : (
          <View style={styles.loaderWrap}>
            <LoaderAnimation color={Colors.white100} />
          </View>
        )}
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tokenCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    width: 344,
  },
  tokenImg: {
    width: 40,
    height: 40,
    marginRight: 16,
    borderRadius: 20,
  },
  input: {
    marginBottom: 16,
    width: 344,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#27272A',
    backgroundColor: '#fff',
  },
  button: {
    width: 344,
    marginTop: 12,
  },
  loaderWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 344,
    height: 48,
    marginTop: 6,
  },
});
