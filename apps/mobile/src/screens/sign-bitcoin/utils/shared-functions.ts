import { useNavigation } from '@react-navigation/native';
import { MessageTypes } from '../../../services/config/message-types';
import { DeviceEventEmitter } from 'react-native'; // Native event system

export function useHandleRejectClick() {
  const navigation = useNavigation();

  const handleRejectClick = async (payloadId: any) => {
    DeviceEventEmitter.emit('bitcoinSignEvent', {
      type: MessageTypes.signBitcoinResponse,
      payloadId,
      payload: { status: 'error', data: 'User rejected the transaction' },
    });

    // Navigate back to home or close modal as per your UX
    navigation.goBack();
  };

  return { setHandleRejectClick: handleRejectClick };
}
