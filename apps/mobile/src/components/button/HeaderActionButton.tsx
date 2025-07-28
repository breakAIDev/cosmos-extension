import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Buttons } from '@leapwallet/leap-ui'; // <-- must be React Native compatible!
import { HeaderAction, HeaderActionType } from '../../types/components';

const ActionButton = React.memo(({ type, onClick, style }: HeaderAction & { style?: any }) => {
  switch (type) {
    case HeaderActionType.CANCEL:
      return <Buttons.Cancel onPress={onClick} style={style} />;
    case HeaderActionType.BACK:
      return <Buttons.Back onPress={onClick} style={style} />;
    case HeaderActionType.NAVIGATION:
      return (
        <View style={[styles.row, style]}>
          <View style={styles.navButtonContainer}>
            <Buttons.Nav
              onPress={onClick}
              style={styles.navButton}
            />
          </View>
        </View>
      );
  }
});

ActionButton.displayName = 'ActionButton';
export { ActionButton };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  navButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
