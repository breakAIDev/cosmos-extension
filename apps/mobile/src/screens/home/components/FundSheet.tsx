import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import BottomModal from '../../../components/bottom-modal';
import Text from '../../../components/text';
import { FundBannerData } from './FundBanners';
import { MotiView } from 'moti';

interface FundsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  bannerData: FundBannerData[];
  showCopyAddress: boolean;
  modalTitle: string;
}

const FundsSheet = ({
  isVisible,
  onClose,
  bannerData,
  showCopyAddress,
  modalTitle,
}: FundsSheetProps) => {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title={modalTitle}
      closeOnBackdropClick={true}
      // pass other props as needed
    >
      <View style={{ flexDirection: 'column', gap: 12 }}>
        {bannerData.map((d: FundBannerData, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={d.onClick}
            activeOpacity={0.8}
            style={styles.bannerCard}
          >
            <View style={styles.iconBox}>
              <d.icon size={24} color={d.textColor} />
            </View>
            <View>
              <Text size="sm" style={styles.bannerTitle}>
                {d.title}
              </Text>
              <Text size="xs" color="text-gray-400" style={styles.bannerDesc}>
                {d.content}
              </Text>
            </View>

            {showCopyAddress && d.title === 'Receive / Deposit' && (
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 12 }}
                style={styles.copiedOverlay}
              >
                <CheckCircle weight="fill" size={30} color="#fff" style={{ marginRight: 8 }} />
                <Text size="sm" style={styles.copiedText}>
                  Copied Address
                </Text>
              </MotiView>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    padding: 12,
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  bannerDesc: {
    fontWeight: '500',
    color: '#888',
  },
  copiedOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#16a34a',
    opacity: 0.96,
    left: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 2,
  },
  copiedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FundsSheet;
