import { CheckCircle } from 'phosphor-react-native';
import { Button } from '../../../components/ui/button';
import { MotiView, AnimatePresence } from 'moti';
import { CopyIcon } from '../../../../assets/icons/copy-icon';
import React, { useEffect, useState } from 'react';
import { UserClipboard } from '../../../utils/clipboard';
import { sliceAddress } from '../../../utils/strings';
import { View, StyleSheet } from 'react-native';

// Helper for monospace address text
import { Text } from 'react-native';
const AddressMono = ({ children }: { children: string  }) => (
  <Text style={styles.addressText}>{children}</Text>
);

export const CopyButton = ({ address }: { address: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <Button
      variant="ghost"
      size="sm"
      style={styles.button}
      onPress={() => {
        setIsCopied(true);
        UserClipboard.copyText(address);
      }}
    >
      <View style={styles.innerContent}>
        {/* Address */}
        <View style={{ marginRight: 8 }}>
          {/** You can use a <Text> if you want to customize font, etc. */}
          <AddressMono>{sliceAddress(address)}</AddressMono>
        </View>
        {/* Animated Icon */}
        <AnimatePresence>
          {isCopied ? (
            <MotiView
              key="check"
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'timing', duration: 150 }}
              style={styles.icon}
            >
              <CheckCircle size={16} color="#059669" />
            </MotiView>
          ) : (
            <MotiView
              key="copy"
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'timing', duration: 150 }}
              style={styles.icon}
            >
              <CopyIcon size={16} />
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#F3F4F6', // bg-secondary-100
    minHeight: 32,
    margin: 0,
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap is not supported in RN, use marginRight on previous element
  },
  icon: {
    marginLeft: 4,
  },
  addressText: {
    fontSize: 13,
    fontFamily: 'DMMono-Regular', // Use your loaded font or fallback to monospace
    color: '#374151', // text-secondary-800
    fontWeight: '500',
  },
});
