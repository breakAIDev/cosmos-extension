import React from 'react';
import { View } from 'react-native';
import { useInvestData } from '@leapwallet/cosmos-wallet-hooks';
import { ErrorCard } from '../../../components/ErrorCard';
import { DisplaySettings } from '../types';
import { InvestView } from './invest-view';

type InvestViewContainerProps = {
  displaySettings: DisplaySettings;
};

const InvestViewContainer: React.FC<InvestViewContainerProps> = ({ displaySettings }) => {
  const investData = useInvestData();

  if (investData.status === 'loading') {
    // You can use ActivityIndicator or your custom skeleton loaders
    return (
      <View style={{ padding: 16 }}>
        {/* First Section Skeleton */}
        <View>
          <View style={{ height: 20, width: 80, borderRadius: 6, backgroundColor: '#eee', marginBottom: 8 }} />
          <View style={{ borderRadius: 16, overflow: 'hidden' }}>
            <View style={{ height: 44, backgroundColor: '#eee', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
            <View style={{ height: 1, backgroundColor: '#ccc' }} />
            <View style={{ height: 44, backgroundColor: '#eee' }} />
            <View style={{ height: 1, backgroundColor: '#ccc' }} />
            <View style={{ height: 44, backgroundColor: '#eee', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} />
          </View>
        </View>
        {/* Second Section Skeleton */}
        <View style={{ marginTop: 16 }}>
          <View style={{ height: 20, width: 80, borderRadius: 6, backgroundColor: '#eee', marginBottom: 8 }} />
          <View style={{ borderRadius: 16, overflow: 'hidden' }}>
            <View style={{ height: 44, backgroundColor: '#eee', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
            <View style={{ height: 1, backgroundColor: '#ccc' }} />
            <View style={{ height: 44, backgroundColor: '#eee', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} />
          </View>
        </View>
      </View>
    );
  }

  if (investData.status === 'error') {
    return <ErrorCard text={investData.error.message} />;
  }

  // Everything loaded
  return <InvestView data={investData.data} displaySettings={displaySettings} />;
};

export default InvestViewContainer;
