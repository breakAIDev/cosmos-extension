import { TXN_STATUS } from '@leapwallet/elements-core';
import { CaretRight, CheckCircle, XCircle } from 'phosphor-react-native';
import { Images } from '../../../assets/images';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { generateObjectKey, removePendingSwapTxs, TxStoreObject } from '../../utils/pendingSwapsTxsStore';
import { sliceWord } from '../../utils/strings';

type Props = {
  setShowSwapTxPageFor: Dispatch<SetStateAction<TxStoreObject | undefined>>;
  selectedPendingSwapTx: TxStoreObject;
};

const PendingSwapsAlertStrip = ({ setShowSwapTxPageFor, selectedPendingSwapTx }: Props) => {
  const handleViewClick = useCallback(() => {
    setShowSwapTxPageFor(selectedPendingSwapTx);
  }, [selectedPendingSwapTx, setShowSwapTxPageFor]);

  useEffect(() => {
    if ([TXN_STATUS.SUCCESS, TXN_STATUS.FAILED].includes(selectedPendingSwapTx?.state ?? TXN_STATUS.PENDING)) {
      setTimeout(() => {
        const txKey = generateObjectKey(
          selectedPendingSwapTx?.routingInfo ?? {
            messages: (selectedPendingSwapTx as any)?.route?.messages,
          },
        );
        if (txKey) {
          removePendingSwapTxs(txKey);
        }
      }, 5000);
    }
  }, [selectedPendingSwapTx]);

  const { icon, title } = useMemo(() => {
    if (selectedPendingSwapTx?.state === TXN_STATUS.SUCCESS) {
      return {
        icon: (
          <CheckCircle size={36} color="#20c997" /* you may use theme color */ />
        ),
        title: 'Swap successful',
      };
    }
    if (selectedPendingSwapTx?.state === TXN_STATUS.FAILED) {
      return {
        icon: (
          <XCircle size={36} color="#e2655a" /* you may use theme color */ />
        ),
        title: 'Swap failed',
      };
    }
    return {
      icon: Images.Swap.rotate, // This should be a valid RN require/import or uri string
      title: 'Swap in progress...',
    };
  }, [selectedPendingSwapTx?.state]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleViewClick}
      activeOpacity={0.92}
    >
      <View style={styles.leftSection}>
        {/* Animate icon with Moti */}
        <AnimatePresence
          initial={false}>
          
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.iconWrapper}
          >
            {typeof icon === 'number' || typeof icon === 'string' ? (
              <Image
                source={typeof icon === 'number' ? icon : { uri: icon }}
                style={styles.iconImage}
                resizeMode="contain"
              />
            ) : (
              icon
            )}
          </MotiView>
        </AnimatePresence>
        <View style={styles.textSection}>
          <Text style={styles.title}>{title}</Text>
          {selectedPendingSwapTx?.routingInfo?.messages?.[0]?.customTxHash ? (
            <Text style={styles.hash}>
              {sliceWord(
                selectedPendingSwapTx?.routingInfo?.messages?.[0]?.customTxHash,
                5,
                5
              )}
            </Text>
          ) : null}
        </View>
      </View>
      <CaretRight size={16} color="#97A3B9" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    backgroundColor: '#F3F4F6', // bg-secondary-100
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrapper: {
    marginRight: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  textSection: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#232323',
    marginBottom: 2,
  },
  hash: {
    fontSize: 13,
    fontWeight: '400',
    color: '#97A3B9',
    marginTop: 1,
  },
});

export default PendingSwapsAlertStrip;
