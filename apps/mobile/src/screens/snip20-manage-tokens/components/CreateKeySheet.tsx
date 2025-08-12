import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SecretToken, useAddress, useChainApis, useChainId, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { Buttons, GenericCard } from '@leapwallet/leap-ui';
import BottomModal from '../../../components/bottom-modal';
import { ErrorCard } from '../../../components/ErrorCard';
import { LoaderAnimation } from '../../../components/loader/Loader';
import Text from '../../../components/text';
import { useCreateQueryPermit } from '../../../hooks/secret/useCreateQueryPermit';
import { useCreateViewingKey } from '../../../hooks/secret/useCreateViewingKey';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { rootDenomsStore } from '../../../context/denoms-store-instance';
import { rootBalanceStore } from '../../../context/root-store';
import { Colors } from '../../../theme/colors';
import { UserClipboard } from '../../../utils/clipboard';
import { useSnip20ManageTokens } from '../context';
import { CopyViewingKey, Fee } from './index';

type Props = {
  isVisible: boolean;
  onClose: VoidFunction;
  token?: SecretToken & { contractAddr: string };
  onSuccess: VoidFunction;
};

export function CreateKeySheet({ isVisible, onClose, token, onSuccess }: Props) {
  const defaultLogo = useDefaultTokenLogo();
  const [generatedViewingKey, setGeneratedViewingKey] = useState<string | undefined | null>(null);
  const [viewingKeyLoader, setViewingKeyLoader] = useState(false);

  const createViewingKey = useCreateViewingKey();
  const createQueryPermit = useCreateQueryPermit();
  const [error, setError] = useState<string | null>(null);
  const address = useAddress();
  const { lcdUrl } = useChainApis('secret');
  const chainId = useChainId();
  const chains = useGetChains();

  const { setContractAddress, userPreferredGasLimit, userPreferredGasPrice } = useSnip20ManageTokens();

  useEffect(() => {
    if (token?.contractAddr) {
      setContractAddress(token.contractAddr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.contractAddr]);

  const clearState = useCallback(() => {
    setGeneratedViewingKey(null);
    setViewingKeyLoader(false);
    onClose();
  }, [onClose]);

  const handleConfirmClick = useCallback(async () => {
    setViewingKeyLoader(true);

    if (token?.snip24Enabled) {
      createQueryPermit(address, token.contractAddr);
      clearState();
      onSuccess();
    } else {
      if (!generatedViewingKey) {
        const { error, key } = await createViewingKey(
          lcdUrl ?? chains.secret.apis.rest ?? '',
          chainId ?? 'secret-4',
          address,
          token?.contractAddr as string,
          false,
          {
            gasLimit: userPreferredGasLimit,
            feeDenom: userPreferredGasPrice?.denom,
            gasPriceStep: Number(userPreferredGasPrice?.amount ?? 0),
          },
        );

        if (error) {
          setError(error);
          setViewingKeyLoader(false);
        } else {
          setViewingKeyLoader(false);
          setGeneratedViewingKey(key);
        }
      } else {
        clearState();
        onSuccess();
      }
    }
  }, [
    address,
    chainId,
    chains.secret.apis.rest,
    clearState,
    createQueryPermit,
    createViewingKey,
    generatedViewingKey,
    lcdUrl,
    onSuccess,
    token?.contractAddr,
    token?.snip24Enabled,
    userPreferredGasLimit,
    userPreferredGasPrice?.amount,
    userPreferredGasPrice?.denom,
  ]);

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={clearState}
      title={token?.snip24Enabled ? 'Create query permit' : 'Create Viewing Key'}
    >
      <View style={styles.content}>
        <View style={styles.headerCard}>
          <Text size="xs" style={styles.headerLabel} color={'text-gray-200'}>
            {token?.snip24Enabled ? 'Create query permit' : 'Create Viewing Key'}
          </Text>
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
        </View>

        {!generatedViewingKey && !token?.snip24Enabled ? (
          <Fee rootDenomsStore={rootDenomsStore} rootBalanceStore={rootBalanceStore} />
        ) : null}

        {generatedViewingKey ? (
          <CopyViewingKey
            generatedViewingKey={generatedViewingKey}
            onCopy={async () => {
              await UserClipboard.copyText(generatedViewingKey);
            }}
          />
        ) : null}

        {error ? (
          <View style={{ marginBottom: 10 }}>
            <ErrorCard text={error} />
          </View>
        ) : null}

        {!viewingKeyLoader ? (
          <Buttons.Generic
            size="normal"
            color="#E18881"
            style={styles.button}
            onPress={handleConfirmClick}
          >
            {generatedViewingKey ? 'Done' : 'Confirm'}
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
  headerCard: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  headerLabel: {
    fontWeight: 'bold',
    paddingLeft: 20,
    marginBottom: 10,
  },
  tokenCard: {
    width: 300,
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  tokenImg: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
  },
  button: {
    width: 344,
    marginTop: 18,
  },
  loaderWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 344,
    height: 48,
    marginTop: 6,
  },
});
