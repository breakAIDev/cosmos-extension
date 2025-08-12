import { RewardsIcon } from '../../../../assets/icons/rewards-icon';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { View } from 'react-native';

const BottomNavIcon = observer(() => {
  return (
    <View style={{ position: 'relative' }}>
      <RewardsIcon size={24} color="#888" /* or use your theme color here */ />
    </View>
  );
});

export default BottomNavIcon;
