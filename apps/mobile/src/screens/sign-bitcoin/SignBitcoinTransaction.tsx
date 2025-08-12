import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { BITCOIN_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types';
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils';
import { MessageTypes } from '../../services/config/message-types';
import { BG_RESPONSE } from '../../services/config/storage-keys';
import { useSetActiveChain } from '../../hooks/settings/useActiveChain';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { rootDenomsStore } from '../../context/denoms-store-instance';
import { rootBalanceStore } from '../../context/root-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

import { Loading, SendBitcoin, SignMessage, SignPsbt, SignPsbts } from './components';
import { useHandleRejectClick } from './utils/shared-functions';

type BitcoinTransactionProps = {
  txnData: Record<string, any>;
};

function BitcoinTransaction({ txnData }: BitcoinTransactionProps) {
  const navigation = useNavigation();
  const {setHandleRejectClick} = useHandleRejectClick();

  useEffect(() => {
    // Listen for hardware back or navigation remove event for rejection
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setHandleRejectClick(txnData?.payloadId);
    });

    AsyncStorage.removeItem(BG_RESPONSE);

    return unsubscribe;
  }, [navigation, setHandleRejectClick, txnData]);

  switch (txnData.signTxnData.methodType) {
    case BITCOIN_METHOD_TYPE.SEND_BITCOIN:
      return (
        <SendBitcoin
          txnData={txnData}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        />
      );
    case BITCOIN_METHOD_TYPE.SIGN_PSBT:
      return <SignPsbt txnData={txnData} rootDenomsStore={rootDenomsStore} />;
    case BITCOIN_METHOD_TYPE.SIGN_PSBTS:
      return <SignPsbts txnData={txnData} rootDenomsStore={rootDenomsStore} />;
    case BITCOIN_METHOD_TYPE.SIGN_MESSAGE:
      return <SignMessage txnData={txnData} />;
    default:
      return null;
  }
}

/**
 * HOC to decode the txn signing request and ensure chain is set.
 */
const withBitcoinTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const _activeChain = useActiveChain();
    const setActiveChain = useSetActiveChain();
    const [hasCorrectChain, setHasCorrectChain] = useState(false);
    const [txnData, setTxnData] = useState<Record<string, any> | null>(null);

    useEffect(() => {
      (async function () {
        if (isBitcoinChain(_activeChain)) {
          setHasCorrectChain(true);
        } else {
          await setActiveChain('bitcoin');
          setHasCorrectChain(true);
        }
      })();
    }, [_activeChain, setActiveChain]);

    // Listen for signTransaction (or chat) events from DeviceEventEmitter
    useEffect(() => {
      const listener = (event: any) => {
        if (event?.type === MessageTypes.signTransaction) {
          setTxnData(event.payload);
        }
        // You can extend this to support chat or other message types here
        // if (event?.type === MessageTypes.someChatType) { ... }
      };
      if(hasCorrectChain) {
        DeviceEventEmitter.addListener('bitcoinSignEvent', listener);
        return () => {
          DeviceEventEmitter.removeAllListeners('bitcoinSignEvent');
        };
      }
    }, [hasCorrectChain, setTxnData]);

    if (txnData) {
      return <Component txnData={txnData} />;
    }

    return <Loading />;
  };

  Wrapped.displayName = `withBitcoinTxnSigningRequest(${Component.displayName})`;
  return Wrapped;
};

const signBitcoinTx = withBitcoinTxnSigningRequest(React.memo(BitcoinTransaction));
export default signBitcoinTx;
