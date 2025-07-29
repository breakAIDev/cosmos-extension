import React, { useEffect, useState } from 'react';
import { GestureResponderEvent, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

import { Button, ButtonProps } from '../../../components/ui/button';
import { CopyIcon } from '../../../../assets/icons/copy-icon';
import { Images } from '../../../../assets/images';

export const CopyButton: React.FC<ButtonProps> = ({ onPress, style, ...rest }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const handlePress = (e: GestureResponderEvent) => {
    setIsCopied(true);
    onPress?.(e);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={handlePress}
      style={[style, isCopied ? styles.copied : styles.default]}
      {...rest}
    >
      {isCopied ? (
        <Animatable.Image
          animation="zoomIn"
          duration={150}
          source={Images.Misc.CheckGreenOutline}
          style={styles.icon}
          resizeMode="contain"
        />
      ) : (
        <Animatable.View animation="zoomIn" duration={150}>
          <CopyIcon width={20} height={20} />
        </Animatable.View>
      )}
    </Button>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
  },
  copied: {
    opacity: 1,
  },
  default: {
    opacity: 0.8,
  },
});

CopyButton.displayName = 'CopyButton';
