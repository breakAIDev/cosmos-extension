import React, { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import {
  formatEtherUnits,
  getChainApis,
  getErc20TokenDetails,
  getErc721TokenDetails,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { MessageTypes } from '../../services/config/message-types';
import { BG_RESPONSE } from '../../services/config/storage-keys';
import { getChainOriginStorageKey, getSupportedChains } from '../../context/utils';
import { evmBalanceStore } from '../../context/balance-store';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';

// Import your RN navigation, components, and utilities:
import { useNavigation } from '@react-navigation/native';
import { ArrowHeader, Loading, MessageSignature, SignTransaction } from './components';
import { useHandleRejectClick } from '../sign-bitcoin/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types';

type TxOriginData = {
  activeChain: SupportedChain;
  activeNetwork: 'mainnet' | 'testnet';
};

type SeiEvmTransactionProps = {
  txOriginData: TxOriginData;
  txnDataList: Record<string, any>[];
  setTxnDataList: React.Dispatch<React.SetStateAction<Record<string, any>[] | null>>;
};

function SeiEvmTransaction({ txnDataList, setTxnDataList, txOriginData }: SeiEvmTransactionProps) {
  const [activeTxn, setActiveTxn] = useState(0);
  const navigation = useNavigation();
  const { setHandleRejectClick} = useHandleRejectClick();

  // Listen to navigation's beforeRemove event if you want to reject on screen exit
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setHandleRejectClick(txnDataList[0]?.payloadId);
    });
    AsyncStorage.removeItem(BG_RESPONSE);

    return unsubscribe;
  }, [navigation, setHandleRejectClick, txnDataList]);

  const handleTxnListUpdate = (customId: string) => {
    const filteredTxnDataList = txnDataList.filter((_txnData) => _txnData.customId !== customId);
    setTxnDataList(filteredTxnDataList);
    setActiveTxn(0);
  };

  return (
    <View>
      {txnDataList.length > 1 ? (
        <ArrowHeader activeIndex={activeTxn} setActiveIndex={setActiveTxn} limit={txnDataList.length} />
      ) : null}

      {txnDataList.map((txnData, index) => {
        if (index !== activeTxn) {
          return null;
        }

        switch (txnData.signTxnData.methodType) {
          case ETHEREUM_METHOD_TYPE.PERSONAL_SIGN:
          case ETHEREUM_METHOD_TYPE.ETH__SIGN:
          case ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4:
            return (
              <MessageSignature
                key={txnData.customId}
                txnData={txnData}
                donotClose={txnDataList.length > 1}
                handleTxnListUpdate={() => handleTxnListUpdate(txnData.customId)}
              />
            );
        }

        return (
          <SignTransaction
            activeChain={txOriginData.activeChain}
            activeNetwork={txOriginData.activeNetwork}
            key={txnData.customId}
            txnData={txnData}
            rootDenomsStore={rootDenomsStore}
            rootBalanceStore={rootBalanceStore}
            evmBalanceStore={evmBalanceStore}
            donotClose={txnDataList.length > 1}
            handleTxnListUpdate={() => handleTxnListUpdate(txnData.customId)}
          />
        );
      })}
    </View>
  );
}

const withSeiEvmTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const [txnDataList, setTxnDataList] = useState<Record<string, any>[] | null>(null);
    const [txOriginData, setTxOriginData] = useState<TxOriginData | null>(null);

    const signSeiEvmTxEventHandler = useCallback(async (message: any, sender: any) => {
      if (message.type === MessageTypes.signTransaction) {
        const txnData = message.payload;
        const storageKey = getChainOriginStorageKey(txnData.origin);

        const storageRaw = await AsyncStorage.getItem(storageKey);
        const storage = storageRaw ? JSON.parse(storageRaw) : {};
        const defaultChain = 'ethereum';
        const { chainKey = defaultChain, network = 'mainnet' } = storage[storageKey] || {};
        const supportedChains = await getSupportedChains();
        const chainData = supportedChains[chainKey as SupportedChain];
        const evmChainId = Number(network === 'testnet' ? chainData?.evmChainIdTestnet : chainData?.evmChainId);

        setTxOriginData({ activeChain: chainKey, activeNetwork: network });

        const { evmJsonRpc } = getChainApis(chainKey, network, supportedChains);

        if (txnData?.signTxnData?.spendPermissionCapValue) {
          try {
            let tokenDetails;
            try {
              tokenDetails = await getErc20TokenDetails(txnData.signTxnData.to, evmJsonRpc ?? '', Number(evmChainId));
              txnData.signTxnData.details = {
                Permission: `This allows the third party to spend ${formatEtherUnits(
                  txnData.signTxnData.spendPermissionCapValue,
                  tokenDetails?.decimals ?? 18,
                )} ${tokenDetails.symbol} from your current balance.`,
                ...txnData.signTxnData.details,
              };
            } catch (error) {
              console.error('Error fetching token details as ERC20 token, retrying as ERC721 token', error);
              tokenDetails = await getErc721TokenDetails(txnData.signTxnData.to, evmJsonRpc ?? '', Number(evmChainId));
              txnData.signTxnData.details = {
                Permission: `This allows the third party to transfer your ${txnData.signTxnData.spendPermissionCapValue} ${tokenDetails.symbol} token.`,
                ...txnData.signTxnData.details,
              };
            }
          } catch (error) {
            // Log error as needed
            console.error('Error fetching token details', error);
          }
        }

        setTxnDataList((prev) => {
          prev = prev ?? [];
          if (prev.some((txn) => txn?.origin?.toLowerCase() !== txnData?.origin?.toLowerCase())) {
            return prev;
          }
          return [...prev, { ...txnData, customId: `evt-00${prev.length}` }];
        });
      }
    }, []);

    useEffect(() => {
      // Listen to events via your own system (WebSocket, DeviceEventEmitter, etc)
      // DeviceEventEmitter.addListener('signTransaction', signSeiEvmTxEventHandler);
      // return () => DeviceEventEmitter.removeAllListeners('signTransaction', signSeiEvmTxEventHandler);
    }, [signSeiEvmTxEventHandler]);

    if (txnDataList?.length && txOriginData) {
      return <Component txnDataList={txnDataList} setTxnDataList={setTxnDataList} txOriginData={txOriginData} />;
    }

    return <Loading />;
  };

  Wrapped.displayName = `withSeiEvmTxnSigningRequest(${Component.displayName})`;
  return Wrapped;
};

const signSeiEvmTx = withSeiEvmTxnSigningRequest(React.memo(SeiEvmTransaction));
export default signSeiEvmTx;
