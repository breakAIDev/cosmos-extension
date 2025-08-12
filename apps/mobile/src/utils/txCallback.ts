import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';

export const useTxCallBack = () => {
  const navigation = useNavigation();

  return useMemo(() => {
    return (status: 'success' | 'txDeclined') => {
      if (status === 'success') {
        navigation.navigate('PendingTx');
      } else {
        navigation.navigate('Home?txDeclined=true');
      }
    };
  }, [navigation]);
};
