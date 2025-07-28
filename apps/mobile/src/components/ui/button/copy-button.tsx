{/* <CopyButton onPress={() => {  }}>
  Copy Address
</CopyButton> */}

import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Button, ButtonProps } from '.'; // Your Button with types!
import { CopyIcon } from '../../../../assets/icons/copy-icon'; // Should be an SVG or Image RN component
import { Images } from '../../../../assets/images'; // Should use require() for RN

export function CopyButton({
  children,
  onPress,
  textStyle,
  ...props
}: ButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isCopied) {
      timer = setTimeout(() => setIsCopied(false), 2000);
    }
    return () => timer && clearTimeout(timer);
  }, [isCopied]);

  const handlePress = (e: any) => {
    setIsCopied(true);
    if (onPress) onPress(e);
  };

  return (
    <Button
      onPress={handlePress}
      variant="ghost"
      size="sm"
      textStyle={[
        styles.label,
        isCopied && styles.copiedLabel,
        textStyle,
      ]}
      {...props}
    >
      <Animatable.View
        animation="fadeIn"
        duration={150}
        style={{ marginRight: 8 }}
        key={isCopied ? 'check' : 'copy'}
      >
        {isCopied ? (
          <Image
            source={Images.Misc.CheckGreenOutline} // Should be a require('...') or static import
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
        ) : (
          // If CopyIcon is an SVG component, render it directly; else use <Image />
          <CopyIcon width={16} height={16} color="#26c06f" />
        )}
      </Animatable.View>
      {children || 'Copy'}
    </Button>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  copiedLabel: {
    color: '#0ba360', // Use green text when copied (overrides default)
  },
});
