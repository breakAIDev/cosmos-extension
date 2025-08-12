import { useNavigation } from '@react-navigation/native';
import { MessageTypes } from '../../../services/config/message-types';
import { DeviceEventEmitter } from 'react-native';

export function useHandleRejectClick() {
  const navigation = useNavigation();

  const handleRejectClick = async ( payloadId?: number, donotClose?: boolean) => {
    DeviceEventEmitter.emit('seiEvmSignEvent', {
      type: MessageTypes.signSeiEvmResponse,
      payloadId,
      payload: { status: 'error', data: 'User rejected the transaction' },
    });

    if (!donotClose) {
      navigation.goBack(); // Or navigation.navigate('Home'), depending on your UX
    }
  }

  return { setHandleRejectClick: handleRejectClick };
}
